/* TRIBES — zero-dependency static server for Render Node web service.
   Serves index.html + styles.css + game.js + assets/ from this folder.
   No npm install needed (no node_modules), binds to Render's $PORT. */
var http=require('http'), fs=require('fs'), path=require('path'), url=require('url');
var ROOT=__dirname, PORT=process.env.PORT||3000;
var MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png',
  '.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml',
  '.ico':'image/x-icon','.webp':'image/webp'};
http.createServer(function(req,res){
  var p=decodeURIComponent(url.parse(req.url).pathname);
  if(p==='/'||p==='') p='/index.html';
  // prevent path traversal
  var file=path.normalize(path.join(ROOT,p));
  if(file.indexOf(ROOT)!==0){ res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(file,function(err,buf){
    if(err){ res.writeHead(404,{'Content-Type':'text/plain'}); return res.end('404 '+p); }
    res.writeHead(200,{'Content-Type':MIME[path.extname(file).toLowerCase()]||'application/octet-stream',
      'Cache-Control':'no-cache'});
    res.end(buf);
  });
}).listen(PORT,function(){ console.log('TRIBES up on :'+PORT); });
