/* Windows app: one window showing the same www/ pages as the Android app. Nothing is loaded from the internet. */
const {app,BrowserWindow,shell,Menu}=require('electron');
const path=require('path');
function win(){
 const w=new BrowserWindow({width:1366,height:800,minWidth:1024,minHeight:600,backgroundColor:'#08131a',show:false,autoHideMenuBar:true,title:'Diskarte by MakinaLabs',icon:path.join(__dirname,'icon.png'),webPreferences:{contextIsolation:true,nodeIntegration:false,backgroundThrottling:true}});
 Menu.setApplicationMenu(null);
 w.once('ready-to-show',()=>{w.maximize();w.show();});
 w.loadFile(path.join(__dirname,'..','www','index.html'));
 w.webContents.on('before-input-event',(e,i)=>{if(i.type==='keyDown'&&i.key==='F11'){w.setFullScreen(!w.isFullScreen());e.preventDefault();}});
 w.webContents.setWindowOpenHandler(({url})=>{if(/^https:/.test(url))shell.openExternal(url);return{action:'deny'};});
 w.webContents.on('will-navigate',(e,u)=>{if(!u.startsWith('file:'))e.preventDefault();});
}
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.whenReady().then(win);
app.on('window-all-closed',()=>app.quit());
