/* One-time: creates the release key and its properties file under signing/. Refuses to replace an existing key. */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{execFileSync}=require('child_process');
const dir=path.join(__dirname,'..','signing'),store='engine-room-release.jks',alias='engine-room';
if(fs.existsSync(path.join(dir,store)))throw new Error('release key already exists');
fs.mkdirSync(dir,{recursive:true});
const pass=crypto.randomBytes(24).toString('base64url');
execFileSync('C:/Program Files/Android/Android Studio/jbr/bin/keytool.exe',['-genkeypair','-keystore',path.join(dir,store),'-storetype','PKCS12','-alias',alias,'-keyalg','RSA','-keysize','4096','-validity','10000','-storepass:env','KSP','-dname','CN=Engine Room Simulators, O=tsogs66'],{env:{...process.env,KSP:pass},stdio:'inherit'});
fs.writeFileSync(path.join(dir,'keystore.properties'),`storeFile=${store}\nstorePassword=${pass}\nkeyAlias=${alias}\nkeyPassword=${pass}\n`);
console.log('release key created');
