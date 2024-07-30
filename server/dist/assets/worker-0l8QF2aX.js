const f="0.12.6",R=`https://unpkg.com/@ffmpeg/core@${f}/dist/umd/ffmpeg-core.js`;var E;(function(t){t.LOAD="LOAD",t.EXEC="EXEC",t.WRITE_FILE="WRITE_FILE",t.READ_FILE="READ_FILE",t.DELETE_FILE="DELETE_FILE",t.RENAME="RENAME",t.CREATE_DIR="CREATE_DIR",t.LIST_DIR="LIST_DIR",t.DELETE_DIR="DELETE_DIR",t.ERROR="ERROR",t.DOWNLOAD="DOWNLOAD",t.PROGRESS="PROGRESS",t.LOG="LOG",t.MOUNT="MOUNT",t.UNMOUNT="UNMOUNT"})(E||(E={}));const u=new Error("unknown message type"),O=new Error("ffmpeg is not loaded, call `await ffmpeg.load()` first"),l=new Error("failed to import ffmpeg-core.js");let s;const m=async({coreURL:t,wasmURL:n,workerURL:r})=>{const o=!s;try{t||(t=R),importScripts(t)}catch{if(t||(t=R.replace("/umd/","/esm/")),self.createFFmpegCore=(await import(t)).default,!self.createFFmpegCore)throw l}const e=t,c=n||t.replace(/.js$/g,".wasm"),a=r||t.replace(/.js$/g,".worker.js");return s=await self.createFFmpegCore({mainScriptUrlOrBlob:`${e}#${btoa(JSON.stringify({wasmURL:c,workerURL:a}))}`}),s.setLogger(i=>self.postMessage({type:E.LOG,data:i})),s.setProgress(i=>self.postMessage({type:E.PROGRESS,data:i})),o},D=({args:t,timeout:n=-1})=>{s.setTimeout(n),s.exec(...t);const r=s.ret;return s.reset(),r},S=({path:t,data:n})=>(s.FS.writeFile(t,n),!0),I=({path:t,encoding:n})=>s.FS.readFile(t,{encoding:n}),L=({path:t})=>(s.FS.unlink(t),!0),N=({oldPath:t,newPath:n})=>(s.FS.rename(t,n),!0),A=({path:t})=>(s.FS.mkdir(t),!0),w=({path:t})=>{const n=s.FS.readdir(t),r=[];for(const o of n){const e=s.FS.stat(`${t}/${o}`),c=s.FS.isDir(e.mode);r.push({name:o,isDir:c})}return r},k=({path:t})=>(s.FS.rmdir(t),!0),b=({fsType:t,options:n,mountPoint:r})=>{const o=t,e=s.FS.filesystems[o];return e?(s.FS.mount(e,n,r),!0):!1},d=({mountPoint:t})=>(s.FS.unmount(t),!0);self.onmessage=async({data:{id:t,type:n,data:r}})=>{const o=[];let e;try{if(n!==E.LOAD&&!s)throw O;switch(n){case E.LOAD:e=await m(r);break;case E.EXEC:e=D(r);break;case E.WRITE_FILE:e=S(r);break;case E.READ_FILE:e=I(r);break;case E.DELETE_FILE:e=L(r);break;case E.RENAME:e=N(r);break;case E.CREATE_DIR:e=A(r);break;case E.LIST_DIR:e=w(r);break;case E.DELETE_DIR:e=k(r);break;case E.MOUNT:e=b(r);break;case E.UNMOUNT:e=d(r);break;default:throw u}}catch(c){self.postMessage({id:t,type:E.ERROR,data:c.toString()});return}e instanceof Uint8Array&&o.push(e.buffer),self.postMessage({id:t,type:n,data:e},o)};