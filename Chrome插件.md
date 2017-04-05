## 架构
- ###总括：
  - Manifest：程序清单
  - Background：插件运行环境/主程序
  - Pop up：弹出页面
  - Content scripts：与浏览页面交互的脚本
- ### Manifest
  每一个扩展都有一个JSON格式的manifest文件，叫manifest.json，相当于程序清单，其中定义了插件的一些元数据等信息，示例如下：
``` javascript
{
  // 必须添加
  "manifest_version": 2, //固定的，定义manifest版本信息
  "name": "My Extension", //插件名称
  "version": "1.0", //插件本身的版本

  // 推荐添加
  "default_locale": "en",
  "description": "This is my first extension.", //插件的描述
  "icons": {...},

  //browser_action和page_action只能添加一个
  "browser_action": { //浏览器级别行为，所有页面均生效
        "default_icon": "cc.gif",//图标的图片
        "default_title": "Hello CC", //鼠标移到图标显示的文字 
        "default_popup": "popup.html" //单击图标后弹窗页面
    }, 
  "page_action":{ //页面级别的行为，只在特定页面下生效 
		"default_icon":{
			"24":"icon_24.png",
			"38":"icon_38.png"
			},
		"default_popup": "popup.html",
		"default_title":"MyTitle"
	},

  // 可选
  "author": ...,
  "automation": ...,   
  
  //background script即插件运行的环境
  "background":{
        "page":"background.html", //page和scripts只能设置一个   
        "persistent": false   
        
        //scripts定义一个脚本文件的数组，chrome会在扩展启动时自动创建一个包含所有指定脚本的页面
        // "scripts": ["js/jquery-1.9.1.min.js","js/background.js"]
    },
  "background_page": ...,
  "chrome_settings_overrides": {...},
  "chrome_ui_overrides": {
    "bookmarks_ui": {
      "remove_bookmark_shortcut": true,
      "remove_button": true
    }
  },
  "chrome_url_overrides": {...},
  "commands": {...},
  "content_capabilities": ...,
  
  //定义对页面内容进行操作的脚本
  "content_scripts": [{  
         "matches": ["http://*/*","https://*/*"],//只在这些站点下 content_scripts会运行
         "js": ["js/jquery-1.9.1.min.js", "js/js.js"],   
         "run_at": "document_start",  //在document加载时执行该脚本，如果不指定，则在document加载完成后执行
    }] 
    
  "content_security_policy": "policyString",
  "converted_from_user_script": ...,
  "current_locale": ...,
  "devtools_page": "devtools.html",
  "event_rules": [{...}],
  "externally_connectable": {
    "matches": ["*://*.example.com/*"]
  },
  "file_browser_handlers": [...],
  "file_system_provider_capabilities": {
    "configurable": true,
    "multiple_mounts": true,
    "source": "network"
  },
  "homepage_url": "http://path/to/homepage",
  "import": [{"id": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}],
  "incognito": "spanning, split, or not_allowed",
  "input_components": ...,
  "key": "publicKey",
  "minimum_chrome_version": "versionString",
  "nacl_modules": [...],
  "oauth2": ...,
  "offline_enabled": true,
  "omnibox": {
    "keyword": "aString"
  },
  "optional_permissions": ["tabs"],
  "options_page": "options.html",
  "options_ui": {
    "chrome_style": true,
    "page": "options.html"
  },
  
  //数组，声明插件所需要的权限
  "permissions": [ 
        "http://*/", 
        "bookmarks", 
        "tabs", 
        "history",
        "activeTab",
        "storage"
    ], 
  "platforms": ...,
  "plugins": [...],
  "requirements": {...},
  "sandbox": [...],
  "short_name": "Short Name",
  "signature": ...,
  "spellcheck": ...,
  "storage": {
    "managed_schema": "schema.json"
  },
  "system_indicator": ...,
  "tts_engine": {...},
  "update_url": "http://path/to/updateInfo.xml",
  "version_name": "aString",
  "web_accessible_resources": [...]
}
```
- ### Background Page
  - **background是插件的运行环境**，姑且叫做**主程序**。一旦插件被启用，chrome就会为该插件开辟一个独立运行环境，用来执行background script。若设置了scripts字段，浏览器的扩展系统会自动根据scripts字段指定的所有js文件自动生成背景页。也可以直接page字段，指定背景页。**两者只能设置一个**。   
  - 一般情况下，我们会让将扩展的主要逻辑都放在 background 中比较便于管理。其它页面可以通过消息传递的机制与 background 进行通讯。理论上 content script 与 popup 之间也可以传递消息，但不建议这么做。
  - 包含background.html和background.js两个文件，包括如下两种：
    - Persistent background pages：一直开启
    - Event pages：需要时开启，可通过将persistent设置为false来设置
      - 开启时机：
        - 首次安装或更新完版本时
        - 触发特定事件时
        - content script 向其发送消息时
        - 其他页面（例如popup）调用` runtime.getBackgroundPage`时
      - 注册到Manifest中：
``` javascript
        {
         "name": "My extension",
         ...
         "background": {
           "scripts": ["eventPage.js"],
           "persistent": false
          },
         ...
         }
```
- ### UI Page
  - #### popup:
    - popup.html和popup.js：popup和background page在同一个运行环境中，均在插件主程序中。也就是说popup可以通过特定的方式调background里的方法。注：出于安全考虑，javascript必须与html分开存放且写在html里的js无效。
  - #### option:
- ### Content Scripts
  Content Scripts相当于一个对当前浏览页面（符合matches定义的模式）的补充脚本，称作**内容脚本**，与popup不同，内容脚本几乎与主程序运行环境相隔离、独立。与主程序的交互只能通过发送消息的方式进行。
  - CanDo：
     可以访问和修改单前浏览页面的DOM，但不能访问该页面脚本定义的变量和方法，并且不会和该页面原有js的方法和变量冲突。
  - CanNot：
    - 不能使用chrome独有API，除了以下几点：
      - extension(getURL,inIncognitoContext,lastError,onRequest,sendRequest)
      - i18n
      - runtime ( connect , getManifest , getURL , id , onConnect , onMessage , sendMessage )
      - storage
    - 不能使用插件里其他页面定义的变量和方法
  - 向访问的页面注入脚本，访问和修改DOM的方式：
    只有为要访问的页面赋予权限才可以，需在Manifest中添加permissions节点。   
    向页面插入脚本的API: 
  - 注入脚本:**chrome.tabs.executeScript**,如下:   
``` javascript
    //将访问页面的背景变为红色
    chrome.browserAction.onClicked.addListener(function(tab) {
      chrome.tabs.executeScript({
        code: 'document.body.style.backgroundColor="red"'
      });
    });
```
- 注入CSS：**chrome.tabs.insertCSS**
- 注册到Manifest中   
```javascript
    {
      "name": "My extension",
      ...
      "content_scripts": [
        {
          "matches": ["http://www.google.com/*"],//只有在符合该pattern的站点才会运行
          "css": ["mystyles.css"],
          "js": ["jquery.js", "myscript.js"]
        }
      ],
      //为以下页面赋予访问并向注入脚本的权限
      "permissions": [
        "tabs", "http://www.google.com/*",
        "activeTab"
      ],
      ...
    }
```
-  消息传递：
   虽然内容脚本的执行环境和托管它们的页面是彼此隔离的，但它们共享对页面DOM的访问权限，如果页面希望与内容脚本（或通过内容脚本进行扩展）进行通信，那么它必须通过共享的DOM进行。示例如下：
``` javascript
      //访问的页面：
      document.getElementById("theButton").addEventListener("click",
    function() {
    window.postMessage({ type: "FROM_PAGE", text: "Hello from the webpage!" }, "*");
    }, false);
    
    //content_scripts脚本；
    var port = chrome.runtime.connect();
    
    window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
      return;
    
    if (event.data.type && (event.data.type == "FROM_PAGE")) {
      console.log("Content script received: " + event.data.text);
      port.postMessage(event.data.text);
      }
    }, false);
```

## 插件页面间通讯：
插件各个部分之间的通讯有如下两种模式：
- ### 简单的单次请求
  - 内容脚本到主程序：
```javascript
chrome.extension.sendMessage({hello: "Cissy"}, function(response) {
    console.log(response.farewell);
});
```
  - 主程序到内容脚本
```javascript
chrome.tabs.query({active:true}, function(tab) {
    chrome.tabs.sendMessage(tab.id, {greeting: "hello"}, function(response) {
        console.log(response.farewell);
    });
});
```
  - 接收消息
  chrome.extension.sendMessage()向扩展内的其它监听者发送一条消息。此消息发送后会触发扩展内每个页面的chrome.extension.onMessage()事件。
```javascript
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.greeting == "hello")
            sendResponse({farewell: "goodbye"});
});
```
- ### 长连接
  - background 和 popup
    background和popup运行在同一个进程中，都是运行在主程序中的，所以background 和 popup 之间可以直接相互调用对方的方法，不需要消息传递。
    - popup调用background中变量或方法
```javascript
var bg = chrome.extension.getBackgroundPage();//获取background页面
console.log(bg.a);//调用background的变量或方法。
```
    - background调用popup中变量或方法
      background是一个运行在扩展进程中的HTML页面。它在你的扩展的整个生命周期都存在，而popup是在你点击了图标之后才存在，所以，在获取popup变量时，请确认popup已打开。
```javascript
var pop = chrome.extension.getViews({type:'popup'});//获取popup页面
console.log(pop[0].b);//调用第一个popup的变量或方法。
```
  - background 和 content
  持续长时间的保持会话需要在content script和扩展建立一个长时间存在的通道。当建立连接，两端都有一个runtime.Port 对象通过这个连接发送和接收消息。
    - 内容脚本发送消息到扩展程序
```javascript
var bac = chrome.extension.connect({name: "ConToBg"});//建立通道，并给通道命名
bac.postMessage({hello: "Cissy"});//利用通道发送一条消息。
```
    - 扩展程序发送消息到内容脚本
```javascript
var cab = chrome.tabs.connect(tabId, {name: "BgToCon"});//建立通道，指定tabId，并命名
    cab.postMessage({ hello: "Cissy"});//利用通道发送一条消息。
```
    - 接收消息
    接收消息为了处理正在等待的连接，需要用chrome.extension.onConnect 事件监听器，对于content script或者扩展页面，这个方法都是一样的
```javascript
chrome.extension.onConnect.addListener(function(bac) {//监听是否连接，bac为Port对象
    bac.onMessage.addListener(function(msg) {//监听是否收到消息，msg为消息对象
        console.log(msg.hello);
    })
})
```

## 数据保存及隐身模式
可以使用HTML5的localStorage或保存到服务器，但是，无论何种方式，尽量保证在隐身模式的情况下不要保存任何数据，或仅将数据保存在内存中，如下：
``` javascript
function saveTabData(tab, data) {
  if (tab.incognito) {
    chrome.runtime.getBackgroundPage(function(bgPage) {
      bgPage[tab.url] = data;      // 匿名模式，保存为当前页面的数据，只在内存中
    });
  } else {
    localStorage[tab.url] = data;  // 保存到本地
  }
}
```
## 调试
插件各部分的调试方式各不相同，具体如下：
- Content script：直接F12打开开发者工具，在*Sources*栏下的*Content scripts*即可调试
- background：在chrome的扩展程序设置页面*chrome://extention* 下找到相应的插件，点击*检查视图*即可调试
- popup：右击工具栏上插件的图标，选择*审查弹出内容*即可调试

## Chrome API
除了web本身的API以外，Chrome插件还支持一些独有的API可供使用
- 同步方法vs异步方法
   例：
    同步方法：返回string的`chrome.runtime.getURL()`方法
    异步方法：
``` javascript
   //获取当前页面，并修改页面url
   chrome.tabs.query({'active': true}, function(tabs) {
   chrome.tabs.update(tabs[0].id, {url: newUrl});
   });
```
- 常用API:
  - chrome.extension.getURL()：获取插件文件的URL，
     例：chrome.extension.getURL("images/myimage.png");获取文件myimage.png的URL
  - chrome.tabs.executeScript()：向访问页面注入脚本