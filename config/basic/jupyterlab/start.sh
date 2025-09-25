#!/bin/bash
# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

set -e

# The _log function is used for everything this script wants to log.
_log () {
    if [[ "$*" == "ERROR:"* ]] || [[ "$*" == "WARNING:"* ]] || [[ "${JUPYTER_DOCKER_STACKS_QUIET}" == "" ]]; then
        echo "$@"
    fi
}
_log "Entered start.sh with args:" "$@"

# Run hook scripts
run-hooks () {
    if [[ ! -d "${1}" ]] ; then
        return
    fi
    _log "${0}: running hooks in ${1} as uid / gid: $(id -u) / $(id -g)"
    for f in "${1}/"*; do
        case "${f}" in
            *.sh)
                _log "${0}: running script ${f}"
                source "${f}"
                ;;
            *)
                if [[ -x "${f}" ]] ; then
                    _log "${0}: running executable ${f}"
                    "${f}"
                else
                    _log "${0}: ignoring non-executable ${f}"
                fi
                ;;
        esac
    done
    _log "${0}: done running hooks in ${1}"
}

unset_explicit_env_vars () {
    if [ -n "${JUPYTER_ENV_VARS_TO_UNSET}" ]; then
        for env_var_to_unset in $(echo "${JUPYTER_ENV_VARS_TO_UNSET}" | tr ',' ' '); do
            echo "Unset ${env_var_to_unset} due to JUPYTER_ENV_VARS_TO_UNSET"
            unset "${env_var_to_unset}"
        done
        unset JUPYTER_ENV_VARS_TO_UNSET
    fi
}

# ---------------------------
# Command Resolution Section
# ---------------------------
if [ $# -eq 0 ]; then
    cmd=( "bash" )
else
    cmd=( "$@" )
fi

# Log raw command received
_log "Raw command received from Helm:" "${cmd[@]}"

# DEBUG_MODE override
if [[ "${DEBUG_MODE}" == "1" ]]; then
    _log "DEBUG_MODE enabled – overriding command with: sleep infinity"
    cmd=( "sleep" "infinity" )
fi

# Final resolved command
_log "Final resolved command to be executed:" "${cmd[@]}"

# ---------------------------
# Root user branch
# ---------------------------
if [ "$(id -u)" == 0 ] ; then
    if id jovyan &> /dev/null ; then
        if ! usermod --home "/home/${NB_USER}" --login "${NB_USER}" jovyan 2>&1 | grep "no changes" > /dev/null; then
            _log "Updated the jovyan user:"
            _log "- username: jovyan       -> ${NB_USER}"
            _log "- home dir: /home/jovyan -> /home/${NB_USER}"
        fi
    elif ! id -u "${NB_USER}" &> /dev/null; then
        _log "ERROR: Neither the jovyan user or '${NB_USER}' exists."
        exit 1
    fi

    if [ "${NB_UID}" != "$(id -u "${NB_USER}")" ] || [ "${NB_GID}" != "$(id -g "${NB_USER}")" ]; then
        _log "Update ${NB_USER}'s UID:GID to ${NB_UID}:${NB_GID}"
        if [ "${NB_GID}" != "$(id -g "${NB_USER}")" ]; then
            groupadd --force --gid "${NB_GID}" --non-unique "${NB_GROUP:-${NB_USER}}"
        fi
        userdel "${NB_USER}"
        useradd --home "/home/${NB_USER}" --uid "${NB_UID}" --gid "${NB_GID}" --groups 100 --no-log-init "${NB_USER}"
    fi

    if [[ "${NB_USER}" != "jovyan" ]]; then
        if [[ ! -e "/home/${NB_USER}" ]]; then
            _log "Attempting to copy /home/jovyan to /home/${NB_USER}..."
            mkdir "/home/${NB_USER}"
            if cp -a /home/jovyan/. "/home/${NB_USER}/"; then
                _log "Success!"
            else
                _log "Failed to copy, trying symlink..."
                if ln -s /home/jovyan "/home/${NB_USER}"; then
                    _log "Success creating symlink!"
                else
                    _log "ERROR: Failed to set up home directory"
                    exit 1
                fi
            fi
        fi
        if [[ "${PWD}/" == "/home/jovyan/"* ]]; then
            new_wd="/home/${NB_USER}/${PWD:13}"
            _log "Changing working directory to ${new_wd}"
            cd "${new_wd}"
        fi
    fi

    if [[ "${CHOWN_HOME}" == "1" || "${CHOWN_HOME}" == "yes" ]]; then
        _log "Ensuring /home/${NB_USER} is owned by ${NB_UID}:${NB_GID}"
        chown ${CHOWN_HOME_OPTS} "${NB_UID}:${NB_GID}" "/home/${NB_USER}"
    fi
    if [ -n "${CHOWN_EXTRA}" ]; then
        for extra_dir in $(echo "${CHOWN_EXTRA}" | tr ',' ' '); do
            _log "Ensuring ${extra_dir} is owned by ${NB_UID}:${NB_GID}"
            chown ${CHOWN_EXTRA_OPTS} "${NB_UID}:${NB_GID}" "${extra_dir}"
        done
    fi

    export XDG_CACHE_HOME="/home/${NB_USER}/.cache"
    sed -r "s#Defaults\s+secure_path\s*=\s*\"?([^\"]+)\"?#Defaults secure_path=\"${CONDA_DIR}/bin:\1\"#" /etc/sudoers | grep secure_path > /etc/sudoers.d/path

    if [[ "$GRANT_SUDO" == "1" || "$GRANT_SUDO" == "yes" ]]; then
        _log "Granting ${NB_USER} passwordless sudo rights!"
        echo "${NB_USER} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/added-by-start-script
    fi

    run-hooks /usr/local/bin/before-notebook.d
    unset_explicit_env_vars

    _log "Running as ${NB_USER}:" "${cmd[@]}"
    exec sudo --preserve-env --set-home --user "${NB_USER}" \
        PATH="${PATH}" \
        PYTHONPATH="${PYTHONPATH:-}" \
        "${cmd[@]}"

# ---------------------------
# Non-root user branch
# ---------------------------
else
    if [[ "${GRANT_SUDO}" == "1" || "${GRANT_SUDO}" == "yes" ]]; then
        _log "WARNING: container must be started as root to grant sudo permissions!"
    fi

    if ! whoami &> /dev/null; then
        _log "Fixing missing /etc/passwd entry..."
        if [[ -w /etc/passwd ]]; then
            sed --expression="s/^jovyan:/nayvoj:/" /etc/passwd > /tmp/passwd
            echo "${NB_USER}:x:$(id -u):$(id -g):,,,:/home/jovyan:/bin/bash" >> /tmp/passwd
            cat /tmp/passwd > /etc/passwd
            rm /tmp/passwd
        else
            _log "WARNING: unable to fix missing /etc/passwd entry."
        fi
    fi

    run-hooks /usr/local/bin/before-notebook.d
    unset_explicit_env_vars

#     _log "Executing the command as non-root:" "${cmd[@]}"
#     exec "${cmd[@]}"
    if [ $# -eq 0 ]; then
			echo "Non-root -- no command provided. Starting debug sleep loop..."
			tail -f /dev/null
		else
			echo "Executing command as non-root: $@"
			exec "$@"
		fi
fi
