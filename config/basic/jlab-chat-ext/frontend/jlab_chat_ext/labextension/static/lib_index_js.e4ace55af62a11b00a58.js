"use strict";
(self["webpackChunkjlab_chat_ext"] = self["webpackChunkjlab_chat_ext"] || []).push([["lib_index_js"],{

/***/ "./lib/index.js":
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   chatIcon: () => (/* binding */ chatIcon),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _jupyterlab_application__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/application */ "webpack/sharing/consume/default/@jupyterlab/application");
/* harmony import */ var _jupyterlab_application__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_application__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _jupyterlab_launcher__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @jupyterlab/launcher */ "webpack/sharing/consume/default/@jupyterlab/launcher");
/* harmony import */ var _jupyterlab_launcher__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_launcher__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @lumino/widgets */ "webpack/sharing/consume/default/@lumino/widgets");
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_lumino_widgets__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var socket_io_client__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! socket.io-client */ "webpack/sharing/consume/default/socket.io-client/socket.io-client");
/* harmony import */ var socket_io_client__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(socket_io_client__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @jupyterlab/ui-components */ "webpack/sharing/consume/default/@jupyterlab/ui-components");
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _lock_svg__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./lock.svg */ "./lib/lock.svg");



// import { PageConfig } from '@jupyterlab/coreutils';




// Define the chat icon
const chatIcon = new _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_5__.LabIcon({
    name: 'jlab-chat-ext:chat',
    svgstr: _lock_svg__WEBPACK_IMPORTED_MODULE_6__
});
// Fetch chat URL from Python backend
async function getChatUrl() {
    const response = await fetch('/chat-ext/wsurl');
    const data = await response.json();
    return data.chatUrl;
}
getChatUrl().then((url) => {
    console.log("✅ CHAT_WS_URL from backend is:", url);
});
const plugin = {
    id: 'jlab-chat-ext',
    autoStart: true,
    requires: [_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__.ICommandPalette],
    optional: [_jupyterlab_launcher__WEBPACK_IMPORTED_MODULE_2__.ILauncher, _jupyterlab_application__WEBPACK_IMPORTED_MODULE_0__.ILayoutRestorer],
    activate: async (app, palette, launcher, restorer) => {
        var _a, _b;
        console.log('✅ jlab-chat-ext is loaded');
        const { commands, shell } = app;
        //     console.log('✅ About to attempt connection to CHAT_WS_URL');
        //     // Get the URL from the page config injected by the server
        //     const targetURL = PageConfig.getOption('chatServerUrl');
        //     console.log('✅ targetURL === ' + targetURL + ' ===');
        //     const wsURL = targetURL || 'http://${window.location.hostname}:3001';    
        // //     const wsURL = (window as any).CHAT_WS_URL || 'http://${window.location.hostname}:3001';
        //     console.log('✅ Connecting to chat server at:', wsURL);
        // //     const socket = io(wsURL);
        // 🔥 Get the chat server URL from backend
        let wsURL = '';
        try {
            wsURL = await getChatUrl();
            console.log('✅ CHAT_WS_URL from backend is:', wsURL);
        }
        catch (err) {
            console.log('❌ CHAT_WS_URL ERROR. Value: ', wsURL);
            console.error('❌ Failed to fetch chat URL from backend:', err);
            wsURL = `http://${window.location.hostname}:3001`; // fallback
        }
        const socket = socket_io_client__WEBPACK_IMPORTED_MODULE_4___default()(wsURL, {
            reconnectionAttempts: 5,
            timeout: 10000
        });
        console.log('✅ Attempted connection to wsURL');
        // --- Main Area Widget ---
        const mainContent = new _lumino_widgets__WEBPACK_IMPORTED_MODULE_3__.Widget();
        mainContent.node.innerHTML = `
      <div style="padding: 1em;">
        <h3>Main Chat Widget</h3>
        <input id="mainRoomInput" placeholder="Room name" />
        <button id="mainJoinBtn">Join</button>
        <div id="mainChatLog" style="margin-top: 1em; height: 200px; overflow-y: scroll; border: 1px solid gray;"></div>
        <input id="mainChatInput" placeholder="Type message..." />
        <button id="mainSendBtn">Send</button>
      </div>
    `;
        let mainRoom = '';
        const mainLog = mainContent.node.querySelector('#mainChatLog');
        (_a = mainContent.node.querySelector('#mainJoinBtn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            const room = mainContent.node.querySelector('#mainRoomInput').value.trim();
            console.log('✅ Room is now === ' + room + ' ===');
            if (room) {
                if (mainRoom)
                    socket.emit('leave', mainRoom);
                console.log('✅ Emitting join');
                socket.emit('join', room);
                mainRoom = room;
                console.log('✅ Room is joined ?');
                mainLog.innerHTML += `<div><em>Joined room: ${room}</em></div>`;
            }
            else {
                mainLog.innerHTML += `<div><em>Please enter a room name.</em></div>`;
            }
        });
        (_b = mainContent.node.querySelector('#mainSendBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            const input = mainContent.node.querySelector('#mainChatInput');
            const msg = input.value.trim();
            if (msg) {
                console.log('✅ Chat message: ' + msg);
                socket.emit('chat message', { room: mainRoom, message: msg });
                input.value = '';
            }
        });
        // -------------------------------
        // Sidebar Chat Widget
        // -------------------------------
        const sidebarContent = new _lumino_widgets__WEBPACK_IMPORTED_MODULE_3__.Widget();
        sidebarContent.node.innerHTML = `
      <div style="padding: 0.5em;">
        <h4>Sidebar Chat</h4>
        <div id="sidebarChatLog" style="height: 150px; overflow-y: scroll; border: 1px solid #ccc;"></div>
      </div>
    `;
        const sidebarLog = sidebarContent.node.querySelector('#sidebarChatLog');
        socket.on('connect', () => {
            mainLog.innerHTML += `<div><em>Connected to ${wsURL}</em></div>`;
            sidebarLog.innerHTML += `<div><em>Connected</em></div>`;
        });
        socket.on('chat message', (data) => {
            // Show all messages for now — can filter by room if needed
            mainLog.innerHTML += `<div>${data.message}</div>`;
            mainLog.scrollTop = mainLog.scrollHeight;
            sidebarLog.innerHTML += `<div>${data.message}</div>`;
            sidebarLog.scrollTop = sidebarLog.scrollHeight;
            //  	  	// Only display the message if it's for the current room
            //   		if (data.room === mainRoom) {
            //    			mainLog.innerHTML += `<div>${data.message}</div>`;
            //     		mainLog.scrollTop = mainLog.scrollHeight;
            //   	    sidebarLog.innerHTML += `<div>${msg}</div>`;
            //     	  sidebarLog.scrollTop = sidebarLog.scrollHeight;
            //   		}
        });
        // --- Main Widget Setup ---
        const mainWidget = new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__.MainAreaWidget({ content: mainContent });
        mainWidget.id = 'jlab-chat-ext-main';
        mainWidget.title.label = 'Chat';
        mainWidget.title.icon = chatIcon;
        mainWidget.title.closable = true;
        // --- Sidebar Setup ---
        sidebarContent.id = 'jlab-chat-ext-sidebar';
        sidebarContent.title.caption = 'Chat Sidebar';
        sidebarContent.title.iconClass = 'jp-ChatIcon jp-SideBar-tabIcon';
        shell.add(sidebarContent, 'left', { rank: 800 });
        // --- Command Setup ---
        const commandID = 'jlab-chat-ext:open-main';
        commands.addCommand(commandID, {
            label: 'Open Chat Widget',
            caption: 'Open the collaborative chat widget in the main area',
            execute: () => {
                if (!mainWidget.isAttached) {
                    shell.add(mainWidget, 'main');
                }
                shell.activateById(mainWidget.id);
            }
        });
        palette.addItem({ command: commandID, category: 'Chat' });
        launcher === null || launcher === void 0 ? void 0 : launcher.add({ command: commandID, category: 'Other', rank: 1 });
        restorer === null || restorer === void 0 ? void 0 : restorer.add(mainWidget, mainWidget.id);
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (plugin);


/***/ }),

/***/ "./lib/lock.svg":
/*!**********************!*\
  !*** ./lib/lock.svg ***!
  \**********************/
/***/ ((module) => {

module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" viewBox=\"0 0 24 23\">\n  <path fill=\"#333\" d=\"M12 17a2 2 0 0 0 2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5 5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3\" class=\"jp-icon4\"/>\n</svg>\n";

/***/ })

}]);
//# sourceMappingURL=lib_index_js.e4ace55af62a11b00a58.js.map