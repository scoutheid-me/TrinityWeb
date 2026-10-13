"""Execute a repository Python file through the running Blender Lab add-on."""
import socket,json,sys
from pathlib import Path
def request(code):
 with socket.create_connection(('127.0.0.1',9876),timeout=10) as s:
  s.settimeout(120);s.sendall(json.dumps({'type':'execute','code':code,'strict_json':True}).encode()+b'\0');data=b''
  while b'\0' not in data:
   chunk=s.recv(65536)
   if not chunk:break
   data+=chunk
  response=json.loads(data.split(b'\0')[0]);print(json.dumps(response));return response
if __name__=='__main__':
 p=Path(sys.argv[1]).resolve()
 request("exec(compile("+repr(p.read_text(encoding='utf-8'))+","+repr(str(p))+",'exec'),{'__file__':"+repr(str(p))+",'__name__':'__main__'})\nresult={'completed':True}")
