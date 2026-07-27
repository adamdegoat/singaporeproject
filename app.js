var uu=0,bl=1,du=2;var Fr=1,_a=2,Bs=3,fi=0,Ke=1,Ce=2,jn=0,Ki=1,El=2,wl=3,Br=4,fu=5;var Ii=100,pu=101,mu=102,gu=103,xu=104,_u=200,yu=201,vu=202,Mu=203,No=204,Fo=205,Su=206,bu=207,Eu=208,wu=209,Tu=210,Au=211,Ru=212,Cu=213,Iu=214,Bo=0,Oo=1,zo=2,Qi=3,Ho=4,ko=5,Go=6,Vo=7,ya=0,Pu=1,Lu=2,Hn=0,Tl=1,Al=2,Rl=3,Or=4,Cl=5,Il=6,Pl=7;var Ll=300,Bi=301,ts=302,va=303,Ma=304,zr=306,ws=1e3,$n=1001,Wo=1002,qe=1003,Du=1004;var Hr=1005;var Je=1006,Sa=1007;var ti=1008;var pn=1009,Dl=1010,Ul=1011,Os=1012,ba=1013,kn=1014,In=1015,ei=1016,Ea=1017,wa=1018,zs=1020,Nl=35902,Fl=35899,Bl=1021,Ol=1022,Pn=1023,Jn=1026,Oi=1027,Ta=1028,Aa=1029,zi=1030,Ra=1031;var Ca=1033,kr=33776,Gr=33777,Vr=33778,Wr=33779,Ia=35840,Pa=35841,La=35842,Da=35843,Ua=36196,Na=37492,Fa=37496,Ba=37488,Oa=37489,Xr=37490,za=37491,Ha=37808,ka=37809,Ga=37810,Va=37811,Wa=37812,Xa=37813,qa=37814,Ya=37815,Za=37816,$a=37817,Ja=37818,Ka=37819,Qa=37820,ja=37821,tc=36492,ec=36494,nc=36495,ic=36283,sc=36284,qr=36285,rc=36286;var or=2300,Xo=2301,Uo=2302,cl=2303,ll=2400,hl=2401,ul=2402;var Uu=3200;var Yr=0,Nu=1,xi="",De="srgb",ar="srgb-linear",cr="linear",de="srgb";var Zi=7680;var dl=519,Fu=512,Bu=513,Ou=514,oc=515,zu=516,Hu=517,ac=518,ku=519,fl=35044;var zl="300 es",zn=2e3,Ts=2001;function Tf(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Af(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function lr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Gu(){let i=lr("canvas");return i.style.display="block",i}var Nh={},As=null;function Hl(...i){let t="THREE."+i.shift();As?As("log",t,...i):console.log(t,...i)}function Vu(i){let t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Jt(...i){i=Vu(i);let t="THREE."+i.shift();if(As)As("warn",t,...i);else{let e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function $t(...i){i=Vu(i);let t="THREE."+i.shift();if(As)As("error",t,...i);else{let e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function Ji(...i){let t=i.join(" ");t in Nh||(Nh[t]=!0,Jt(...i))}function Wu(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var Xu={[Bo]:Oo,[zo]:Go,[Ho]:Vo,[Qi]:ko,[Oo]:Bo,[Go]:zo,[Vo]:Ho,[ko]:Qi},Kn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}},en=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Nc=Math.PI/180,qo=180/Math.PI;function Hs(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(en[i&255]+en[i>>8&255]+en[i>>16&255]+en[i>>24&255]+"-"+en[t&255]+en[t>>8&255]+"-"+en[t>>16&15|64]+en[t>>24&255]+"-"+en[e&63|128]+en[e>>8&255]+"-"+en[e>>16&255]+en[e>>24&255]+en[n&255]+en[n>>8&255]+en[n>>16&255]+en[n>>24&255]).toLowerCase()}function le(i,t,e){return Math.max(t,Math.min(e,i))}function Rf(i,t){return(i%t+t)%t}function Fc(i,t,e){return(1-e)*i+e*t}function Js(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function dn(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var xt=class i{static{i.prototype.isVector2=!0}constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=le(this.x,t.x,e.x),this.y=le(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=le(this.x,t,e),this.y=le(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(le(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(le(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Se=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let c=n[s+0],l=n[s+1],h=n[s+2],d=n[s+3],u=r[o+0],f=r[o+1],g=r[o+2],y=r[o+3];if(d!==y||c!==u||l!==f||h!==g){let p=c*u+l*f+h*g+d*y;p<0&&(u=-u,f=-f,g=-g,y=-y,p=-p);let m=1-a;if(p<.9995){let M=Math.acos(p),b=Math.sin(M);m=Math.sin(m*M)/b,a=Math.sin(a*M)/b,c=c*m+u*a,l=l*m+f*a,h=h*m+g*a,d=d*m+y*a}else{c=c*m+u*a,l=l*m+f*a,h=h*m+g*a,d=d*m+y*a;let M=1/Math.sqrt(c*c+l*l+h*h+d*d);c*=M,l*=M,h*=M,d*=M}}t[e]=c,t[e+1]=l,t[e+2]=h,t[e+3]=d}static multiplyQuaternionsFlat(t,e,n,s,r,o){let a=n[s],c=n[s+1],l=n[s+2],h=n[s+3],d=r[o],u=r[o+1],f=r[o+2],g=r[o+3];return t[e]=a*g+h*d+c*f-l*u,t[e+1]=c*g+h*u+l*d-a*f,t[e+2]=l*g+h*f+a*u-c*d,t[e+3]=h*g-a*d-c*u-l*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,c=Math.sin,l=a(n/2),h=a(s/2),d=a(r/2),u=c(n/2),f=c(s/2),g=c(r/2);switch(o){case"XYZ":this._x=u*h*d+l*f*g,this._y=l*f*d-u*h*g,this._z=l*h*g+u*f*d,this._w=l*h*d-u*f*g;break;case"YXZ":this._x=u*h*d+l*f*g,this._y=l*f*d-u*h*g,this._z=l*h*g-u*f*d,this._w=l*h*d+u*f*g;break;case"ZXY":this._x=u*h*d-l*f*g,this._y=l*f*d+u*h*g,this._z=l*h*g+u*f*d,this._w=l*h*d-u*f*g;break;case"ZYX":this._x=u*h*d-l*f*g,this._y=l*f*d+u*h*g,this._z=l*h*g-u*f*d,this._w=l*h*d+u*f*g;break;case"YZX":this._x=u*h*d+l*f*g,this._y=l*f*d+u*h*g,this._z=l*h*g-u*f*d,this._w=l*h*d-u*f*g;break;case"XZY":this._x=u*h*d-l*f*g,this._y=l*f*d-u*h*g,this._z=l*h*g+u*f*d,this._w=l*h*d+u*f*g;break;default:Jt("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],c=e[9],l=e[2],h=e[6],d=e[10],u=n+a+d;if(u>0){let f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(h-c)*f,this._y=(r-l)*f,this._z=(o-s)*f}else if(n>a&&n>d){let f=2*Math.sqrt(1+n-a-d);this._w=(h-c)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+l)/f}else if(a>d){let f=2*Math.sqrt(1+a-n-d);this._w=(r-l)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(c+h)/f}else{let f=2*Math.sqrt(1+d-n-a);this._w=(o-s)/f,this._x=(r+l)/f,this._y=(c+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(le(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,c=e._y,l=e._z,h=e._w;return this._x=n*h+o*a+s*l-r*c,this._y=s*h+o*c+r*a-n*l,this._z=r*h+o*l+n*c-s*a,this._w=o*h-n*a-s*c-r*l,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=this.dot(t);a<0&&(n=-n,s=-s,r=-r,o=-o,a=-a);let c=1-e;if(a<.9995){let l=Math.acos(a),h=Math.sin(l);c=Math.sin(c*l)/h,e=Math.sin(e*l)/h,this._x=this._x*c+n*e,this._y=this._y*c+s*e,this._z=this._z*c+r*e,this._w=this._w*c+o*e,this._onChangeCallback()}else this._x=this._x*c+n*e,this._y=this._y*c+s*e,this._z=this._z*c+r*e,this._w=this._w*c+o*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},D=class i{static{i.prototype.isVector3=!0}constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Fh.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Fh.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,c=t.w,l=2*(o*s-a*n),h=2*(a*e-r*s),d=2*(r*n-o*e);return this.x=e+c*l+o*d-a*h,this.y=n+c*h+a*l-r*d,this.z=s+c*d+r*h-o*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=le(this.x,t.x,e.x),this.y=le(this.y,t.y,e.y),this.z=le(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=le(this.x,t,e),this.y=le(this.y,t,e),this.z=le(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(le(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,c=e.z;return this.x=s*c-r*a,this.y=r*o-n*c,this.z=n*a-s*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Bc.copy(this).projectOnVector(t),this.sub(Bc)}reflect(t){return this.sub(Bc.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(le(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Bc=new D,Fh=new Se,jt=class i{static{i.prototype.isMatrix3=!0}constructor(t,e,n,s,r,o,a,c,l){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,c,l)}set(t,e,n,s,r,o,a,c,l){let h=this.elements;return h[0]=t,h[1]=s,h[2]=a,h[3]=e,h[4]=r,h[5]=c,h[6]=n,h[7]=o,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],h=n[4],d=n[7],u=n[2],f=n[5],g=n[8],y=s[0],p=s[3],m=s[6],M=s[1],b=s[4],x=s[7],T=s[2],S=s[5],R=s[8];return r[0]=o*y+a*M+c*T,r[3]=o*p+a*b+c*S,r[6]=o*m+a*x+c*R,r[1]=l*y+h*M+d*T,r[4]=l*p+h*b+d*S,r[7]=l*m+h*x+d*R,r[2]=u*y+f*M+g*T,r[5]=u*p+f*b+g*S,r[8]=u*m+f*x+g*R,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8];return e*o*h-e*a*l-n*r*h+n*a*c+s*r*l-s*o*c}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8],d=h*o-a*l,u=a*c-h*r,f=l*r-o*c,g=e*d+n*u+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/g;return t[0]=d*y,t[1]=(s*l-h*n)*y,t[2]=(a*n-s*o)*y,t[3]=u*y,t[4]=(h*e-s*c)*y,t[5]=(s*r-a*e)*y,t[6]=f*y,t[7]=(n*c-l*e)*y,t[8]=(o*e-n*r)*y,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){let c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*o+l*a)+o+t,-s*l,s*c,-s*(-l*o+c*a)+a+e,0,0,1),this}scale(t,e){return Ji("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Oc.makeScale(t,e)),this}rotate(t){return Ji("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Oc.makeRotation(-t)),this}translate(t,e){return Ji("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Oc.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Oc=new jt,Bh=new jt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Oh=new jt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Cf(){let i={enabled:!0,workingColorSpace:ar,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===de&&(s.r=di(s.r),s.g=di(s.g),s.b=di(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===de&&(s.r=Es(s.r),s.g=Es(s.g),s.b=Es(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===xi?cr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Ji("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Ji("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[ar]:{primaries:t,whitePoint:n,transfer:cr,toXYZ:Bh,fromXYZ:Oh,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:De},outputColorSpaceConfig:{drawingBufferColorSpace:De}},[De]:{primaries:t,whitePoint:n,transfer:de,toXYZ:Bh,fromXYZ:Oh,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:De}}}),i}var he=Cf();function di(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Es(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var us,Yo=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{us===void 0&&(us=lr("canvas")),us.width=t.width,us.height=t.height;let s=us.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=us}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=lr("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=di(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(di(e[n]/255)*255):e[n]=di(e[n]);return{data:e,width:t.width,height:t.height}}else return Jt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},If=0,Rs=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:If++}),this.uuid=Hs(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(zc(s[o].image)):r.push(zc(s[o]))}else r=zc(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function zc(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Yo.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Jt("Texture: Unable to serialize Texture."),{})}var Pf=0,Hc=new D,cn=class i extends Kn{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=$n,s=$n,r=Je,o=ti,a=Pn,c=pn,l=i.DEFAULT_ANISOTROPY,h=xi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Pf++}),this.uuid=Hs(),this.name="",this.source=new Rs(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new xt(0,0),this.repeat=new xt(1,1),this.center=new xt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new jt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Hc).x}get height(){return this.source.getSize(Hc).y}get depth(){return this.source.getSize(Hc).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){Jt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Jt(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Ll)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ws:t.x=t.x-Math.floor(t.x);break;case $n:t.x=t.x<0?0:1;break;case Wo:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ws:t.y=t.y-Math.floor(t.y);break;case $n:t.y=t.y<0?0:1;break;case Wo:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};cn.DEFAULT_IMAGE=null;cn.DEFAULT_MAPPING=Ll;cn.DEFAULT_ANISOTROPY=1;var we=class i{static{i.prototype.isVector4=!0}constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,c=t.elements,l=c[0],h=c[4],d=c[8],u=c[1],f=c[5],g=c[9],y=c[2],p=c[6],m=c[10];if(Math.abs(h-u)<.01&&Math.abs(d-y)<.01&&Math.abs(g-p)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+y)<.1&&Math.abs(g+p)<.1&&Math.abs(l+f+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let b=(l+1)/2,x=(f+1)/2,T=(m+1)/2,S=(h+u)/4,R=(d+y)/4,_=(g+p)/4;return b>x&&b>T?b<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(b),s=S/n,r=R/n):x>T?x<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(x),n=S/s,r=_/s):T<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(T),n=R/r,s=_/r),this.set(n,s,r,e),this}let M=Math.sqrt((p-g)*(p-g)+(d-y)*(d-y)+(u-h)*(u-h));return Math.abs(M)<.001&&(M=1),this.x=(p-g)/M,this.y=(d-y)/M,this.z=(u-h)/M,this.w=Math.acos((l+f+m-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=le(this.x,t.x,e.x),this.y=le(this.y,t.y,e.y),this.z=le(this.z,t.z,e.z),this.w=le(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=le(this.x,t,e),this.y=le(this.y,t,e),this.z=le(this.z,t,e),this.w=le(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(le(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Zo=class extends Kn{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Je,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new we(0,0,t,e),this.scissorTest=!1,this.viewport=new we(0,0,t,e),this.textures=[];let s={width:t,height:e,depth:n.depth},r=new cn(s),o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Je,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new Rs(s)}return this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},yn=class extends Zo{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},hr=class extends cn{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=qe,this.minFilter=qe,this.wrapR=$n,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var $o=class extends cn{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=qe,this.minFilter=qe,this.wrapR=$n,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ne=class i{static{i.prototype.isMatrix4=!0}constructor(t,e,n,s,r,o,a,c,l,h,d,u,f,g,y,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,c,l,h,d,u,f,g,y,p)}set(t,e,n,s,r,o,a,c,l,h,d,u,f,g,y,p){let m=this.elements;return m[0]=t,m[4]=e,m[8]=n,m[12]=s,m[1]=r,m[5]=o,m[9]=a,m[13]=c,m[2]=l,m[6]=h,m[10]=d,m[14]=u,m[3]=f,m[7]=g,m[11]=y,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,s=1/ds.setFromMatrixColumn(t,0).length(),r=1/ds.setFromMatrixColumn(t,1).length(),o=1/ds.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(s),l=Math.sin(s),h=Math.cos(r),d=Math.sin(r);if(t.order==="XYZ"){let u=o*h,f=o*d,g=a*h,y=a*d;e[0]=c*h,e[4]=-c*d,e[8]=l,e[1]=f+g*l,e[5]=u-y*l,e[9]=-a*c,e[2]=y-u*l,e[6]=g+f*l,e[10]=o*c}else if(t.order==="YXZ"){let u=c*h,f=c*d,g=l*h,y=l*d;e[0]=u+y*a,e[4]=g*a-f,e[8]=o*l,e[1]=o*d,e[5]=o*h,e[9]=-a,e[2]=f*a-g,e[6]=y+u*a,e[10]=o*c}else if(t.order==="ZXY"){let u=c*h,f=c*d,g=l*h,y=l*d;e[0]=u-y*a,e[4]=-o*d,e[8]=g+f*a,e[1]=f+g*a,e[5]=o*h,e[9]=y-u*a,e[2]=-o*l,e[6]=a,e[10]=o*c}else if(t.order==="ZYX"){let u=o*h,f=o*d,g=a*h,y=a*d;e[0]=c*h,e[4]=g*l-f,e[8]=u*l+y,e[1]=c*d,e[5]=y*l+u,e[9]=f*l-g,e[2]=-l,e[6]=a*c,e[10]=o*c}else if(t.order==="YZX"){let u=o*c,f=o*l,g=a*c,y=a*l;e[0]=c*h,e[4]=y-u*d,e[8]=g*d+f,e[1]=d,e[5]=o*h,e[9]=-a*h,e[2]=-l*h,e[6]=f*d+g,e[10]=u-y*d}else if(t.order==="XZY"){let u=o*c,f=o*l,g=a*c,y=a*l;e[0]=c*h,e[4]=-d,e[8]=l*h,e[1]=u*d+y,e[5]=o*h,e[9]=f*d-g,e[2]=g*d-f,e[6]=a*h,e[10]=y*d+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Lf,t,Df)}lookAt(t,e,n){let s=this.elements;return xn.subVectors(t,e),xn.lengthSq()===0&&(xn.z=1),xn.normalize(),bi.crossVectors(n,xn),bi.lengthSq()===0&&(Math.abs(n.z)===1?xn.x+=1e-4:xn.z+=1e-4,xn.normalize(),bi.crossVectors(n,xn)),bi.normalize(),ho.crossVectors(xn,bi),s[0]=bi.x,s[4]=ho.x,s[8]=xn.x,s[1]=bi.y,s[5]=ho.y,s[9]=xn.y,s[2]=bi.z,s[6]=ho.z,s[10]=xn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],h=n[1],d=n[5],u=n[9],f=n[13],g=n[2],y=n[6],p=n[10],m=n[14],M=n[3],b=n[7],x=n[11],T=n[15],S=s[0],R=s[4],_=s[8],E=s[12],w=s[1],C=s[5],P=s[9],O=s[13],z=s[2],L=s[6],N=s[10],U=s[14],G=s[3],Z=s[7],q=s[11],J=s[15];return r[0]=o*S+a*w+c*z+l*G,r[4]=o*R+a*C+c*L+l*Z,r[8]=o*_+a*P+c*N+l*q,r[12]=o*E+a*O+c*U+l*J,r[1]=h*S+d*w+u*z+f*G,r[5]=h*R+d*C+u*L+f*Z,r[9]=h*_+d*P+u*N+f*q,r[13]=h*E+d*O+u*U+f*J,r[2]=g*S+y*w+p*z+m*G,r[6]=g*R+y*C+p*L+m*Z,r[10]=g*_+y*P+p*N+m*q,r[14]=g*E+y*O+p*U+m*J,r[3]=M*S+b*w+x*z+T*G,r[7]=M*R+b*C+x*L+T*Z,r[11]=M*_+b*P+x*N+T*q,r[15]=M*E+b*O+x*U+T*J,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],c=t[9],l=t[13],h=t[2],d=t[6],u=t[10],f=t[14],g=t[3],y=t[7],p=t[11],m=t[15],M=c*f-l*u,b=a*f-l*d,x=a*u-c*d,T=o*f-l*h,S=o*u-c*h,R=o*d-a*h;return e*(y*M-p*b+m*x)-n*(g*M-p*T+m*S)+s*(g*b-y*T+m*R)-r*(g*x-y*S+p*R)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],o=t[5],a=t[9],c=t[2],l=t[6],h=t[10];return e*(o*h-a*l)-n*(r*h-a*c)+s*(r*l-o*c)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8],d=t[9],u=t[10],f=t[11],g=t[12],y=t[13],p=t[14],m=t[15],M=e*a-n*o,b=e*c-s*o,x=e*l-r*o,T=n*c-s*a,S=n*l-r*a,R=s*l-r*c,_=h*y-d*g,E=h*p-u*g,w=h*m-f*g,C=d*p-u*y,P=d*m-f*y,O=u*m-f*p,z=M*O-b*P+x*C+T*w-S*E+R*_;if(z===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let L=1/z;return t[0]=(a*O-c*P+l*C)*L,t[1]=(s*P-n*O-r*C)*L,t[2]=(y*R-p*S+m*T)*L,t[3]=(u*S-d*R-f*T)*L,t[4]=(c*w-o*O-l*E)*L,t[5]=(e*O-s*w+r*E)*L,t[6]=(p*x-g*R-m*b)*L,t[7]=(h*R-u*x+f*b)*L,t[8]=(o*P-a*w+l*_)*L,t[9]=(n*w-e*P-r*_)*L,t[10]=(g*S-y*x+m*M)*L,t[11]=(d*x-h*S-f*M)*L,t[12]=(a*E-o*C-c*_)*L,t[13]=(e*C-n*E+s*_)*L,t[14]=(y*b-g*T-p*M)*L,t[15]=(h*T-d*b+u*M)*L,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,c=t.z,l=r*o,h=r*a;return this.set(l*o+n,l*a-s*c,l*c+s*a,0,l*a+s*c,h*a+n,h*c-s*o,0,l*c-s*a,h*c+s*o,r*c*c+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,o=e._y,a=e._z,c=e._w,l=r+r,h=o+o,d=a+a,u=r*l,f=r*h,g=r*d,y=o*h,p=o*d,m=a*d,M=c*l,b=c*h,x=c*d,T=n.x,S=n.y,R=n.z;return s[0]=(1-(y+m))*T,s[1]=(f+x)*T,s[2]=(g-b)*T,s[3]=0,s[4]=(f-x)*S,s[5]=(1-(u+m))*S,s[6]=(p+M)*S,s[7]=0,s[8]=(g+b)*R,s[9]=(p-M)*R,s[10]=(1-(u+y))*R,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let o=ds.set(s[0],s[1],s[2]).length(),a=ds.set(s[4],s[5],s[6]).length(),c=ds.set(s[8],s[9],s[10]).length();r<0&&(o=-o),Fn.copy(this);let l=1/o,h=1/a,d=1/c;return Fn.elements[0]*=l,Fn.elements[1]*=l,Fn.elements[2]*=l,Fn.elements[4]*=h,Fn.elements[5]*=h,Fn.elements[6]*=h,Fn.elements[8]*=d,Fn.elements[9]*=d,Fn.elements[10]*=d,e.setFromRotationMatrix(Fn),n.x=o,n.y=a,n.z=c,this}makePerspective(t,e,n,s,r,o,a=zn,c=!1){let l=this.elements,h=2*r/(e-t),d=2*r/(n-s),u=(e+t)/(e-t),f=(n+s)/(n-s),g,y;if(c)g=r/(o-r),y=o*r/(o-r);else if(a===zn)g=-(o+r)/(o-r),y=-2*o*r/(o-r);else if(a===Ts)g=-o/(o-r),y=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=d,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=y,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=zn,c=!1){let l=this.elements,h=2/(e-t),d=2/(n-s),u=-(e+t)/(e-t),f=-(n+s)/(n-s),g,y;if(c)g=1/(o-r),y=o/(o-r);else if(a===zn)g=-2/(o-r),y=-(o+r)/(o-r);else if(a===Ts)g=-1/(o-r),y=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=0,l[12]=u,l[1]=0,l[5]=d,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=g,l[14]=y,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},ds=new D,Fn=new ne,Lf=new D(0,0,0),Df=new D(1,1,1),bi=new D,ho=new D,xn=new D,zh=new ne,Hh=new Se,Te=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],o=s[4],a=s[8],c=s[1],l=s[5],h=s[9],d=s[2],u=s[6],f=s[10];switch(e){case"XYZ":this._y=Math.asin(le(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(u,l),this._z=0);break;case"YXZ":this._x=Math.asin(-le(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(le(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-le(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(le(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-le(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(u,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Jt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return zh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(zh,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Hh.setFromEuler(this),this.setFromQuaternion(Hh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Te.DEFAULT_ORDER="XYZ";var Cs=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Uf=0,kh=new D,fs=new Se,ai=new ne,uo=new D,Ks=new D,Nf=new D,Ff=new Se,Gh=new D(1,0,0),Vh=new D(0,1,0),Wh=new D(0,0,1),Xh={type:"added"},Bf={type:"removed"},ps={type:"childadded",child:null},kc={type:"childremoved",child:null},rn=class i extends Kn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Uf++}),this.uuid=Hs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new D,e=new Te,n=new Se,s=new D(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ne},normalMatrix:{value:new jt}}),this.matrix=new ne,this.matrixWorld=new ne,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Cs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return fs.setFromAxisAngle(t,e),this.quaternion.multiply(fs),this}rotateOnWorldAxis(t,e){return fs.setFromAxisAngle(t,e),this.quaternion.premultiply(fs),this}rotateX(t){return this.rotateOnAxis(Gh,t)}rotateY(t){return this.rotateOnAxis(Vh,t)}rotateZ(t){return this.rotateOnAxis(Wh,t)}translateOnAxis(t,e){return kh.copy(t).applyQuaternion(this.quaternion),this.position.add(kh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Gh,t)}translateY(t){return this.translateOnAxis(Vh,t)}translateZ(t){return this.translateOnAxis(Wh,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(ai.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?uo.copy(t):uo.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Ks.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ai.lookAt(Ks,uo,this.up):ai.lookAt(uo,Ks,this.up),this.quaternion.setFromRotationMatrix(ai),s&&(ai.extractRotation(s.matrixWorld),fs.setFromRotationMatrix(ai),this.quaternion.premultiply(fs.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?($t("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Xh),ps.child=t,this.dispatchEvent(ps),ps.child=null):$t("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Bf),kc.child=t,this.dispatchEvent(kc),kc.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),ai.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),ai.multiply(t.parent.matrixWorld)),t.applyMatrix4(ai),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Xh),ps.child=t,this.dispatchEvent(ps),ps.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ks,t,Nf),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ks,Ff,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let c=a.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){let d=c[l];r(t.shapes,d)}else r(t.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(t.materials,this.material[c]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let c=this.animations[a];s.animations.push(r(t.animations,c))}}if(e){let a=o(t.geometries),c=o(t.materials),l=o(t.textures),h=o(t.images),d=o(t.shapes),u=o(t.skeletons),f=o(t.animations),g=o(t.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),u.length>0&&(n.skeletons=u),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){let c=[];for(let l in a){let h=a[l];delete h.metadata,c.push(h)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}};rn.DEFAULT_UP=new D(0,1,0);rn.DEFAULT_MATRIX_AUTO_UPDATE=!0;rn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var ge=class extends rn{constructor(){super(),this.isGroup=!0,this.type="Group"}},Of={type:"move"},Is=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ge,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ge,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ge,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null,a=this._targetRay,c=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){o=!0;for(let y of t.hand.values()){let p=e.getJointPose(y,n),m=this._getHandJoint(l,y);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let h=l.joints["index-finger-tip"],d=l.joints["thumb-tip"],u=h.position.distanceTo(d.position),f=.02,g=.005;l.inputState.pinching&&u>f+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!l.inputState.pinching&&u<=f-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Of)))}return a!==null&&(a.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new ge;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},qu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ei={h:0,s:0,l:0},fo={h:0,s:0,l:0};function Gc(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var Vt=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=De){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,he.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=he.workingColorSpace){return this.r=t,this.g=e,this.b=n,he.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=he.workingColorSpace){if(t=Rf(t,1),e=le(e,0,1),n=le(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=Gc(o,r,t+1/3),this.g=Gc(o,r,t),this.b=Gc(o,r,t-1/3)}return he.colorSpaceToWorking(this,s),this}setStyle(t,e=De){function n(r){r!==void 0&&parseFloat(r)<1&&Jt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Jt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);Jt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=De){let n=qu[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Jt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=di(t.r),this.g=di(t.g),this.b=di(t.b),this}copyLinearToSRGB(t){return this.r=Es(t.r),this.g=Es(t.g),this.b=Es(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=De){return he.workingToColorSpace(nn.copy(this),t),Math.round(le(nn.r*255,0,255))*65536+Math.round(le(nn.g*255,0,255))*256+Math.round(le(nn.b*255,0,255))}getHexString(t=De){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=he.workingColorSpace){he.workingToColorSpace(nn.copy(this),e);let n=nn.r,s=nn.g,r=nn.b,o=Math.max(n,s,r),a=Math.min(n,s,r),c,l,h=(a+o)/2;if(a===o)c=0,l=0;else{let d=o-a;switch(l=h<=.5?d/(o+a):d/(2-o-a),o){case n:c=(s-r)/d+(s<r?6:0);break;case s:c=(r-n)/d+2;break;case r:c=(n-s)/d+4;break}c/=6}return t.h=c,t.s=l,t.l=h,t}getRGB(t,e=he.workingColorSpace){return he.workingToColorSpace(nn.copy(this),e),t.r=nn.r,t.g=nn.g,t.b=nn.b,t}getStyle(t=De){he.workingToColorSpace(nn.copy(this),t);let e=nn.r,n=nn.g,s=nn.b;return t!==De?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Ei),this.setHSL(Ei.h+t,Ei.s+e,Ei.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Ei),t.getHSL(fo);let n=Fc(Ei.h,fo.h,e),s=Fc(Ei.s,fo.s,e),r=Fc(Ei.l,fo.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},nn=new Vt;Vt.NAMES=qu;var ur=class i{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new Vt(t),this.density=e}clone(){return new i(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var dr=class extends rn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Te,this.environmentIntensity=1,this.environmentRotation=new Te,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}},Bn=new D,ci=new D,Vc=new D,li=new D,ms=new D,gs=new D,qh=new D,Wc=new D,Xc=new D,qc=new D,Yc=new we,Zc=new we,$c=new we,Ci=class i{constructor(t=new D,e=new D,n=new D){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),Bn.subVectors(t,e),s.cross(Bn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){Bn.subVectors(s,e),ci.subVectors(n,e),Vc.subVectors(t,e);let o=Bn.dot(Bn),a=Bn.dot(ci),c=Bn.dot(Vc),l=ci.dot(ci),h=ci.dot(Vc),d=o*l-a*a;if(d===0)return r.set(0,0,0),null;let u=1/d,f=(l*c-a*h)*u,g=(o*h-a*c)*u;return r.set(1-f-g,g,f)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,li)===null?!1:li.x>=0&&li.y>=0&&li.x+li.y<=1}static getInterpolation(t,e,n,s,r,o,a,c){return this.getBarycoord(t,e,n,s,li)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,li.x),c.addScaledVector(o,li.y),c.addScaledVector(a,li.z),c)}static getInterpolatedAttribute(t,e,n,s,r,o){return Yc.setScalar(0),Zc.setScalar(0),$c.setScalar(0),Yc.fromBufferAttribute(t,e),Zc.fromBufferAttribute(t,n),$c.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(Yc,r.x),o.addScaledVector(Zc,r.y),o.addScaledVector($c,r.z),o}static isFrontFacing(t,e,n,s){return Bn.subVectors(n,e),ci.subVectors(t,e),Bn.cross(ci).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Bn.subVectors(this.c,this.b),ci.subVectors(this.a,this.b),Bn.cross(ci).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,o,a;ms.subVectors(s,n),gs.subVectors(r,n),Wc.subVectors(t,n);let c=ms.dot(Wc),l=gs.dot(Wc);if(c<=0&&l<=0)return e.copy(n);Xc.subVectors(t,s);let h=ms.dot(Xc),d=gs.dot(Xc);if(h>=0&&d<=h)return e.copy(s);let u=c*d-h*l;if(u<=0&&c>=0&&h<=0)return o=c/(c-h),e.copy(n).addScaledVector(ms,o);qc.subVectors(t,r);let f=ms.dot(qc),g=gs.dot(qc);if(g>=0&&f<=g)return e.copy(r);let y=f*l-c*g;if(y<=0&&l>=0&&g<=0)return a=l/(l-g),e.copy(n).addScaledVector(gs,a);let p=h*g-f*d;if(p<=0&&d-h>=0&&f-g>=0)return qh.subVectors(r,s),a=(d-h)/(d-h+(f-g)),e.copy(s).addScaledVector(qh,a);let m=1/(p+y+u);return o=y*m,a=u*m,e.copy(n).addScaledVector(ms,o).addScaledVector(gs,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Rn=class{constructor(t=new D(1/0,1/0,1/0),e=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(On.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(On.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=On.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,On):On.fromBufferAttribute(r,o),On.applyMatrix4(t.matrixWorld),this.expandByPoint(On);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),po.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),po.copy(n.boundingBox)),po.applyMatrix4(t.matrixWorld),this.union(po)}let s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,On),On.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Qs),mo.subVectors(this.max,Qs),xs.subVectors(t.a,Qs),_s.subVectors(t.b,Qs),ys.subVectors(t.c,Qs),wi.subVectors(_s,xs),Ti.subVectors(ys,_s),Wi.subVectors(xs,ys);let e=[0,-wi.z,wi.y,0,-Ti.z,Ti.y,0,-Wi.z,Wi.y,wi.z,0,-wi.x,Ti.z,0,-Ti.x,Wi.z,0,-Wi.x,-wi.y,wi.x,0,-Ti.y,Ti.x,0,-Wi.y,Wi.x,0];return!Jc(e,xs,_s,ys,mo)||(e=[1,0,0,0,1,0,0,0,1],!Jc(e,xs,_s,ys,mo))?!1:(go.crossVectors(wi,Ti),e=[go.x,go.y,go.z],Jc(e,xs,_s,ys,mo))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,On).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(On).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(hi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),hi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),hi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),hi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),hi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),hi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),hi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),hi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(hi),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},hi=[new D,new D,new D,new D,new D,new D,new D,new D],On=new D,po=new Rn,xs=new D,_s=new D,ys=new D,wi=new D,Ti=new D,Wi=new D,Qs=new D,mo=new D,go=new D,Xi=new D;function Jc(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Xi.fromArray(i,r);let a=s.x*Math.abs(Xi.x)+s.y*Math.abs(Xi.y)+s.z*Math.abs(Xi.z),c=t.dot(Xi),l=e.dot(Xi),h=n.dot(Xi);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>a)return!1}return!0}var ke=new D,xo=new xt,zf=0,fn=class extends Kn{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:zf++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=fl,this.updateRanges=[],this.gpuType=In,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)xo.fromBufferAttribute(this,e),xo.applyMatrix3(t),this.setXY(e,xo.x,xo.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)ke.fromBufferAttribute(this,e),ke.applyMatrix3(t),this.setXYZ(e,ke.x,ke.y,ke.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)ke.fromBufferAttribute(this,e),ke.applyMatrix4(t),this.setXYZ(e,ke.x,ke.y,ke.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)ke.fromBufferAttribute(this,e),ke.applyNormalMatrix(t),this.setXYZ(e,ke.x,ke.y,ke.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)ke.fromBufferAttribute(this,e),ke.transformDirection(t),this.setXYZ(e,ke.x,ke.y,ke.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Js(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=dn(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Js(e,this.array)),e}setX(t,e){return this.normalized&&(e=dn(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Js(e,this.array)),e}setY(t,e){return this.normalized&&(e=dn(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Js(e,this.array)),e}setZ(t,e){return this.normalized&&(e=dn(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Js(e,this.array)),e}setW(t,e){return this.normalized&&(e=dn(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=dn(e,this.array),n=dn(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=dn(e,this.array),n=dn(n,this.array),s=dn(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=dn(e,this.array),n=dn(n,this.array),s=dn(s,this.array),r=dn(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==fl&&(t.usage=this.usage),t}dispose(){this.dispatchEvent({type:"dispose"})}};var fr=class extends fn{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var pr=class extends fn{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var re=class extends fn{constructor(t,e,n){super(new Float32Array(t),e,n)}},Hf=new Rn,js=new D,Kc=new D,Pi=class{constructor(t=new D,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):Hf.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;js.subVectors(t,this.center);let e=js.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(js,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Kc.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(js.copy(t.center).add(Kc)),this.expandByPoint(js.copy(t.center).sub(Kc))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},kf=0,An=new ne,Qc=new rn,vs=new D,_n=new Rn,tr=new Rn,Xe=new D,Oe=class i extends Kn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:kf++}),this.uuid=Hs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Tf(t)?pr:fr)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new jt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return An.makeRotationFromQuaternion(t),this.applyMatrix4(An),this}rotateX(t){return An.makeRotationX(t),this.applyMatrix4(An),this}rotateY(t){return An.makeRotationY(t),this.applyMatrix4(An),this}rotateZ(t){return An.makeRotationZ(t),this.applyMatrix4(An),this}translate(t,e,n){return An.makeTranslation(t,e,n),this.applyMatrix4(An),this}scale(t,e,n){return An.makeScale(t,e,n),this.applyMatrix4(An),this}lookAt(t){return Qc.lookAt(t),Qc.updateMatrix(),this.applyMatrix4(Qc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(vs).negate(),this.translate(vs.x,vs.y,vs.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let o=t[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new re(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&Jt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Rn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){$t("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];_n.setFromBufferAttribute(r),this.morphTargetsRelative?(Xe.addVectors(this.boundingBox.min,_n.min),this.boundingBox.expandByPoint(Xe),Xe.addVectors(this.boundingBox.max,_n.max),this.boundingBox.expandByPoint(Xe)):(this.boundingBox.expandByPoint(_n.min),this.boundingBox.expandByPoint(_n.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&$t('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Pi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){$t("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(t){let n=this.boundingSphere.center;if(_n.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];tr.setFromBufferAttribute(a),this.morphTargetsRelative?(Xe.addVectors(_n.min,tr.min),_n.expandByPoint(Xe),Xe.addVectors(_n.max,tr.max),_n.expandByPoint(Xe)):(_n.expandByPoint(tr.min),_n.expandByPoint(tr.max))}_n.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)Xe.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Xe));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],c=this.morphTargetsRelative;for(let l=0,h=a.count;l<h;l++)Xe.fromBufferAttribute(a,l),c&&(vs.fromBufferAttribute(t,l),Xe.add(vs)),s=Math.max(s,n.distanceToSquared(Xe))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&$t('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){$t("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new fn(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],c=[];for(let _=0;_<n.count;_++)a[_]=new D,c[_]=new D;let l=new D,h=new D,d=new D,u=new xt,f=new xt,g=new xt,y=new D,p=new D;function m(_,E,w){l.fromBufferAttribute(n,_),h.fromBufferAttribute(n,E),d.fromBufferAttribute(n,w),u.fromBufferAttribute(r,_),f.fromBufferAttribute(r,E),g.fromBufferAttribute(r,w),h.sub(l),d.sub(l),f.sub(u),g.sub(u);let C=1/(f.x*g.y-g.x*f.y);isFinite(C)&&(y.copy(h).multiplyScalar(g.y).addScaledVector(d,-f.y).multiplyScalar(C),p.copy(d).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(C),a[_].add(y),a[E].add(y),a[w].add(y),c[_].add(p),c[E].add(p),c[w].add(p))}let M=this.groups;M.length===0&&(M=[{start:0,count:t.count}]);for(let _=0,E=M.length;_<E;++_){let w=M[_],C=w.start,P=w.count;for(let O=C,z=C+P;O<z;O+=3)m(t.getX(O+0),t.getX(O+1),t.getX(O+2))}let b=new D,x=new D,T=new D,S=new D;function R(_){T.fromBufferAttribute(s,_),S.copy(T);let E=a[_];b.copy(E),b.sub(T.multiplyScalar(T.dot(E))).normalize(),x.crossVectors(S,E);let C=x.dot(c[_])<0?-1:1;o.setXYZW(_,b.x,b.y,b.z,C)}for(let _=0,E=M.length;_<E;++_){let w=M[_],C=w.start,P=w.count;for(let O=C,z=C+P;O<z;O+=3)R(t.getX(O+0)),R(t.getX(O+1)),R(t.getX(O+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new fn(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let u=0,f=n.count;u<f;u++)n.setXYZ(u,0,0,0);let s=new D,r=new D,o=new D,a=new D,c=new D,l=new D,h=new D,d=new D;if(t)for(let u=0,f=t.count;u<f;u+=3){let g=t.getX(u+0),y=t.getX(u+1),p=t.getX(u+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,y),o.fromBufferAttribute(e,p),h.subVectors(o,r),d.subVectors(s,r),h.cross(d),a.fromBufferAttribute(n,g),c.fromBufferAttribute(n,y),l.fromBufferAttribute(n,p),a.add(h),c.add(h),l.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(y,c.x,c.y,c.z),n.setXYZ(p,l.x,l.y,l.z)}else for(let u=0,f=e.count;u<f;u+=3)s.fromBufferAttribute(e,u+0),r.fromBufferAttribute(e,u+1),o.fromBufferAttribute(e,u+2),h.subVectors(o,r),d.subVectors(s,r),h.cross(d),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Xe.fromBufferAttribute(t,e),Xe.normalize(),t.setXYZ(e,Xe.x,Xe.y,Xe.z)}toNonIndexed(){function t(a,c){let l=a.array,h=a.itemSize,d=a.normalized,u=new l.constructor(c.length*h),f=0,g=0;for(let y=0,p=c.length;y<p;y++){a.isInterleavedBufferAttribute?f=c[y]*a.data.stride+a.offset:f=c[y]*h;for(let m=0;m<h;m++)u[g++]=l[f++]}return new fn(u,h,d)}if(this.index===null)return Jt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let a in s){let c=s[a],l=t(c,n);e.setAttribute(a,l)}let r=this.morphAttributes;for(let a in r){let c=[],l=r[a];for(let h=0,d=l.length;h<d;h++){let u=l[h],f=t(u,n);c.push(f)}e.morphAttributes[a]=c}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,c=o.length;a<c;a++){let l=o[a];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let c in n){let l=n[c];t.data.attributes[c]=l.toJSON(t.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],h=[];for(let d=0,u=l.length;d<u;d++){let f=l[d];h.push(f.toJSON(t.data))}h.length>0&&(s[c]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let l in s){let h=s[l];this.setAttribute(l,h.clone(e))}let r=t.morphAttributes;for(let l in r){let h=[],d=r[l];for(let u=0,f=d.length;u<f;u++)h.push(d[u].clone(e));this.morphAttributes[l]=h}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let l=0,h=o.length;l<h;l++){let d=o[l];this.addGroup(d.start,d.count,d.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var Gf=0,pi=class extends Kn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Gf++}),this.uuid=Hs(),this.name="",this.type="Material",this.blending=Ki,this.side=fi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=No,this.blendDst=Fo,this.blendEquation=Ii,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Vt(0,0,0),this.blendAlpha=0,this.depthFunc=Qi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=dl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Zi,this.stencilZFail=Zi,this.stencilZPass=Zi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){Jt(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Jt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Ki&&(n.blending=this.blending),this.side!==fi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==No&&(n.blendSrc=this.blendSrc),this.blendDst!==Fo&&(n.blendDst=this.blendDst),this.blendEquation!==Ii&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Qi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==dl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Zi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Zi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Zi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let c=r[a];delete c.metadata,o.push(c)}return o}if(e){let r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Vt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new xt().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new xt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var ui=new D,jc=new D,_o=new D,Ai=new D,tl=new D,yo=new D,el=new D,mr=class{constructor(t=new D,e=new D(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ui)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=ui.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(ui.copy(this.origin).addScaledVector(this.direction,e),ui.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){jc.copy(t).add(e).multiplyScalar(.5),_o.copy(e).sub(t).normalize(),Ai.copy(this.origin).sub(jc);let r=t.distanceTo(e)*.5,o=-this.direction.dot(_o),a=Ai.dot(this.direction),c=-Ai.dot(_o),l=Ai.lengthSq(),h=Math.abs(1-o*o),d,u,f,g;if(h>0)if(d=o*c-a,u=o*a-c,g=r*h,d>=0)if(u>=-g)if(u<=g){let y=1/h;d*=y,u*=y,f=d*(d+o*u+2*a)+u*(o*d+u+2*c)+l}else u=r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*c)+l;else u=-r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*c)+l;else u<=-g?(d=Math.max(0,-(-o*r+a)),u=d>0?-r:Math.min(Math.max(-r,-c),r),f=-d*d+u*(u+2*c)+l):u<=g?(d=0,u=Math.min(Math.max(-r,-c),r),f=u*(u+2*c)+l):(d=Math.max(0,-(o*r+a)),u=d>0?r:Math.min(Math.max(-r,-c),r),f=-d*d+u*(u+2*c)+l);else u=o>0?-r:r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(jc).addScaledVector(_o,u),f}intersectSphere(t,e){ui.subVectors(t.center,this.origin);let n=ui.dot(this.direction),s=ui.dot(ui)-n*n,r=t.radius*t.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,c,l=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return l>=0?(n=(t.min.x-u.x)*l,s=(t.max.x-u.x)*l):(n=(t.max.x-u.x)*l,s=(t.min.x-u.x)*l),h>=0?(r=(t.min.y-u.y)*h,o=(t.max.y-u.y)*h):(r=(t.max.y-u.y)*h,o=(t.min.y-u.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),d>=0?(a=(t.min.z-u.z)*d,c=(t.max.z-u.z)*d):(a=(t.max.z-u.z)*d,c=(t.min.z-u.z)*d),n>c||a>s)||((a>n||n!==n)&&(n=a),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,ui)!==null}intersectTriangle(t,e,n,s,r){tl.subVectors(e,t),yo.subVectors(n,t),el.crossVectors(tl,yo);let o=this.direction.dot(el),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Ai.subVectors(this.origin,t);let c=a*this.direction.dot(yo.crossVectors(Ai,yo));if(c<0)return null;let l=a*this.direction.dot(tl.cross(Ai));if(l<0||c+l>o)return null;let h=-a*Ai.dot(el);return h<0?null:this.at(h/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Cn=class extends pi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Vt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Te,this.combine=ya,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Yh=new ne,qi=new mr,vo=new Pi,Zh=new D,Mo=new D,So=new D,bo=new D,nl=new D,Eo=new D,$h=new D,wo=new D,pt=class extends rn{constructor(t=new Oe,e=new Cn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let a=this.morphTargetInfluences;if(r&&a){Eo.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let h=a[c],d=r[c];h!==0&&(nl.fromBufferAttribute(d,t),o?Eo.addScaledVector(nl,h):Eo.addScaledVector(nl.sub(e),h))}e.add(Eo)}return e}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),vo.copy(n.boundingSphere),vo.applyMatrix4(r),qi.copy(t.ray).recast(t.near),!(vo.containsPoint(qi.origin)===!1&&(qi.intersectSphere(vo,Zh)===null||qi.origin.distanceToSquared(Zh)>(t.far-t.near)**2))&&(Yh.copy(r).invert(),qi.copy(t.ray).applyMatrix4(Yh),!(n.boundingBox!==null&&qi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,qi)))}_computeIntersections(t,e,n){let s,r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,u=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,y=u.length;g<y;g++){let p=u[g],m=o[p.materialIndex],M=Math.max(p.start,f.start),b=Math.min(a.count,Math.min(p.start+p.count,f.start+f.count));for(let x=M,T=b;x<T;x+=3){let S=a.getX(x),R=a.getX(x+1),_=a.getX(x+2);s=To(this,m,t,n,l,h,d,S,R,_),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{let g=Math.max(0,f.start),y=Math.min(a.count,f.start+f.count);for(let p=g,m=y;p<m;p+=3){let M=a.getX(p),b=a.getX(p+1),x=a.getX(p+2);s=To(this,o,t,n,l,h,d,M,b,x),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,y=u.length;g<y;g++){let p=u[g],m=o[p.materialIndex],M=Math.max(p.start,f.start),b=Math.min(c.count,Math.min(p.start+p.count,f.start+f.count));for(let x=M,T=b;x<T;x+=3){let S=x,R=x+1,_=x+2;s=To(this,m,t,n,l,h,d,S,R,_),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{let g=Math.max(0,f.start),y=Math.min(c.count,f.start+f.count);for(let p=g,m=y;p<m;p+=3){let M=p,b=p+1,x=p+2;s=To(this,o,t,n,l,h,d,M,b,x),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}}};function Vf(i,t,e,n,s,r,o,a){let c;if(t.side===Ke?c=n.intersectTriangle(o,r,s,!0,a):c=n.intersectTriangle(s,r,o,t.side===fi,a),c===null)return null;wo.copy(a),wo.applyMatrix4(i.matrixWorld);let l=e.ray.origin.distanceTo(wo);return l<e.near||l>e.far?null:{distance:l,point:wo.clone(),object:i}}function To(i,t,e,n,s,r,o,a,c,l){i.getVertexPosition(a,Mo),i.getVertexPosition(c,So),i.getVertexPosition(l,bo);let h=Vf(i,t,e,n,Mo,So,bo,$h);if(h){let d=new D;Ci.getBarycoord($h,Mo,So,bo,d),s&&(h.uv=Ci.getInterpolatedAttribute(s,a,c,l,d,new xt)),r&&(h.uv1=Ci.getInterpolatedAttribute(r,a,c,l,d,new xt)),o&&(h.normal=Ci.getInterpolatedAttribute(o,a,c,l,d,new D),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let u={a,b:c,c:l,normal:new D,materialIndex:0};Ci.getNormal(Mo,So,bo,u.normal),h.face=u,h.barycoord=d}return h}var gr=class extends cn{constructor(t=null,e=1,n=1,s,r,o,a,c,l=qe,h=qe,d,u){super(null,o,a,c,l,h,s,r,d,u),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var xr=class extends fn{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Ms=new ne,Jh=new ne,Ao=[],Kh=new Rn,Wf=new ne,er=new pt,nr=new Pi,ze=class extends pt{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new xr(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Wf)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Rn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ms),Kh.copy(t.boundingBox).applyMatrix4(Ms),this.boundingBox.union(Kh)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Pi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ms),nr.copy(t.boundingSphere).applyMatrix4(Ms),this.boundingSphere.union(nr)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=t*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(t,e){let n=this.matrixWorld,s=this.count;if(er.geometry=this.geometry,er.material=this.material,er.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),nr.copy(this.boundingSphere),nr.applyMatrix4(n),t.ray.intersectsSphere(nr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ms),Jh.multiplyMatrices(n,Ms),er.matrixWorld=Jh,er.raycast(t,Ao);for(let o=0,a=Ao.length;o<a;o++){let c=Ao[o];c.instanceId=r,c.object=this,e.push(c)}Ao.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new xr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new gr(new Float32Array(s*this.count),s,this.count,Ta,In));let r=this.morphTexture.source.data.data,o=0;for(let l=0;l<n.length;l++)o+=n[l];let a=this.geometry.morphTargetsRelative?1:1-o,c=s*t;return r[c]=a,r.set(n,c+1),this}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},il=new D,Xf=new D,qf=new jt,Zn=class{constructor(t=new D(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=il.subVectors(n,e).cross(Xf.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let s=t.delta(il),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let o=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(s,o)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||qf.getNormalMatrix(t),s=this.coplanarPoint(il).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},Yi=new Pi,Yf=new xt(.5,.5),Ro=new D,Ps=class{constructor(t=new Zn,e=new Zn,n=new Zn,s=new Zn,r=new Zn,o=new Zn){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=zn,n=!1){let s=this.planes,r=t.elements,o=r[0],a=r[1],c=r[2],l=r[3],h=r[4],d=r[5],u=r[6],f=r[7],g=r[8],y=r[9],p=r[10],m=r[11],M=r[12],b=r[13],x=r[14],T=r[15];if(s[0].setComponents(l-o,f-h,m-g,T-M).normalize(),s[1].setComponents(l+o,f+h,m+g,T+M).normalize(),s[2].setComponents(l+a,f+d,m+y,T+b).normalize(),s[3].setComponents(l-a,f-d,m-y,T-b).normalize(),n)s[4].setComponents(c,u,p,x).normalize(),s[5].setComponents(l-c,f-u,m-p,T-x).normalize();else if(s[4].setComponents(l-c,f-u,m-p,T-x).normalize(),e===zn)s[5].setComponents(l+c,f+u,m+p,T+x).normalize();else if(e===Ts)s[5].setComponents(c,u,p,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Yi.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Yi.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Yi)}intersectsSprite(t){Yi.center.set(0,0,0);let e=Yf.distanceTo(t.center);return Yi.radius=.7071067811865476+e,Yi.applyMatrix4(t.matrixWorld),this.intersectsSphere(Yi)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(Ro.x=s.normal.x>0?t.max.x:t.min.x,Ro.y=s.normal.y>0?t.max.y:t.min.y,Ro.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Ro)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var _r=class extends cn{constructor(t=[],e=Bi,n,s,r,o,a,c,l,h){super(t,e,n,s,r,o,a,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Qn=class extends cn{constructor(t,e,n,s,r,o,a,c,l){super(t,e,n,s,r,o,a,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}};var mi=class extends cn{constructor(t,e,n=kn,s,r,o,a=qe,c=qe,l,h=Jn,d=1){if(h!==Jn&&h!==Oi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:e,depth:d};super(u,s,r,o,a,c,h,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Rs(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}},Jo=class extends mi{constructor(t,e=kn,n=Bi,s,r,o=qe,a=qe,c,l=Jn){let h={width:t,height:t,depth:1},d=[h,h,h,h,h,h];super(t,t,e,n,s,r,o,a,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},yr=class extends cn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},ut=class i extends Oe{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let c=[],l=[],h=[],d=[],u=0,f=0;g("z","y","x",-1,-1,n,e,t,o,r,0),g("z","y","x",1,-1,n,e,-t,o,r,1),g("x","z","y",1,1,t,n,e,s,o,2),g("x","z","y",1,-1,t,n,-e,s,o,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new re(l,3)),this.setAttribute("normal",new re(h,3)),this.setAttribute("uv",new re(d,2));function g(y,p,m,M,b,x,T,S,R,_,E){let w=x/R,C=T/_,P=x/2,O=T/2,z=S/2,L=R+1,N=_+1,U=0,G=0,Z=new D;for(let q=0;q<N;q++){let J=q*C-O;for(let K=0;K<L;K++){let ct=K*w-P;Z[y]=ct*M,Z[p]=J*b,Z[m]=z,l.push(Z.x,Z.y,Z.z),Z[y]=0,Z[p]=0,Z[m]=S>0?1:-1,h.push(Z.x,Z.y,Z.z),d.push(K/R),d.push(1-q/_),U+=1}}for(let q=0;q<_;q++)for(let J=0;J<R;J++){let K=u+J+L*q,ct=u+J+L*(q+1),mt=u+(J+1)+L*(q+1),rt=u+(J+1)+L*q;c.push(K,ct,rt),c.push(ct,mt,rt),G+=6}a.addGroup(f,G,E),f+=G,u+=U}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Re=class i extends Oe{constructor(t=1,e=1,n=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:t,height:e,capSegments:n,radialSegments:s,heightSegments:r},e=Math.max(0,e),n=Math.max(1,Math.floor(n)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));let o=[],a=[],c=[],l=[],h=e/2,d=Math.PI/2*t,u=e,f=2*d+u,g=n*2+r,y=s+1,p=new D,m=new D;for(let M=0;M<=g;M++){let b=0,x=0,T=0,S=0;if(M<=n){let E=M/n,w=E*Math.PI/2;x=-h-t*Math.cos(w),T=t*Math.sin(w),S=-t*Math.cos(w),b=E*d}else if(M<=n+r){let E=(M-n)/r;x=-h+E*e,T=t,S=0,b=d+E*u}else{let E=(M-n-r)/n,w=E*Math.PI/2;x=h+t*Math.sin(w),T=t*Math.cos(w),S=t*Math.sin(w),b=d+u+E*d}let R=Math.max(0,Math.min(1,b/f)),_=0;M===0?_=.5/s:M===g&&(_=-.5/s);for(let E=0;E<=s;E++){let w=E/s,C=w*Math.PI*2,P=Math.sin(C),O=Math.cos(C);m.x=-T*O,m.y=x,m.z=T*P,a.push(m.x,m.y,m.z),p.set(-T*O,S,T*P),p.normalize(),c.push(p.x,p.y,p.z),l.push(w+_,R)}if(M>0){let E=(M-1)*y;for(let w=0;w<s;w++){let C=E+w,P=E+w+1,O=M*y+w,z=M*y+w+1;o.push(C,P,O),o.push(P,z,O)}}}this.setIndex(o),this.setAttribute("position",new re(a,3)),this.setAttribute("normal",new re(c,3)),this.setAttribute("uv",new re(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},Li=class i extends Oe{constructor(t=1,e=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:s},e=Math.max(3,e);let r=[],o=[],a=[],c=[],l=new D,h=new xt;o.push(0,0,0),a.push(0,0,1),c.push(.5,.5);for(let d=0,u=3;d<=e;d++,u+=3){let f=n+d/e*s;l.x=t*Math.cos(f),l.y=t*Math.sin(f),o.push(l.x,l.y,l.z),a.push(0,0,1),h.x=(o[u]/t+1)/2,h.y=(o[u+1]/t+1)/2,c.push(h.x,h.y)}for(let d=1;d<=e;d++)r.push(d,d+1,0);this.setIndex(r),this.setAttribute("position",new re(o,3)),this.setAttribute("normal",new re(a,3)),this.setAttribute("uv",new re(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.segments,t.thetaStart,t.thetaLength)}},qt=class i extends Oe{constructor(t=1,e=1,n=1,s=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};let l=this;s=Math.floor(s),r=Math.floor(r);let h=[],d=[],u=[],f=[],g=0,y=[],p=n/2,m=0;M(),o===!1&&(t>0&&b(!0),e>0&&b(!1)),this.setIndex(h),this.setAttribute("position",new re(d,3)),this.setAttribute("normal",new re(u,3)),this.setAttribute("uv",new re(f,2));function M(){let x=new D,T=new D,S=0,R=(e-t)/n;for(let _=0;_<=r;_++){let E=[],w=_/r,C=w*(e-t)+t;for(let P=0;P<=s;P++){let O=P/s,z=O*c+a,L=Math.sin(z),N=Math.cos(z);T.x=C*L,T.y=-w*n+p,T.z=C*N,d.push(T.x,T.y,T.z),x.set(L,R,N).normalize(),u.push(x.x,x.y,x.z),f.push(O,1-w),E.push(g++)}y.push(E)}for(let _=0;_<s;_++)for(let E=0;E<r;E++){let w=y[E][_],C=y[E+1][_],P=y[E+1][_+1],O=y[E][_+1];(t>0||E!==0)&&(h.push(w,C,O),S+=3),(e>0||E!==r-1)&&(h.push(C,P,O),S+=3)}l.addGroup(m,S,0),m+=S}function b(x){let T=g,S=new xt,R=new D,_=0,E=x===!0?t:e,w=x===!0?1:-1;for(let P=1;P<=s;P++)d.push(0,p*w,0),u.push(0,w,0),f.push(.5,.5),g++;let C=g;for(let P=0;P<=s;P++){let z=P/s*c+a,L=Math.cos(z),N=Math.sin(z);R.x=E*N,R.y=p*w,R.z=E*L,d.push(R.x,R.y,R.z),u.push(0,w,0),S.x=L*.5+.5,S.y=N*.5*w+.5,f.push(S.x,S.y),g++}for(let P=0;P<s;P++){let O=T+P,z=C+P;x===!0?h.push(z,z+1,O):h.push(z+1,z,O),_+=3}l.addGroup(m,_,x===!0?1:2),m+=_}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},gi=class i extends qt{constructor(t=1,e=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new i(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Ko=class i extends Oe{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};let r=[],o=[];a(s),l(n),h(),this.setAttribute("position",new re(r,3)),this.setAttribute("normal",new re(r.slice(),3)),this.setAttribute("uv",new re(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(M){let b=new D,x=new D,T=new D;for(let S=0;S<e.length;S+=3)f(e[S+0],b),f(e[S+1],x),f(e[S+2],T),c(b,x,T,M)}function c(M,b,x,T){let S=T+1,R=[];for(let _=0;_<=S;_++){R[_]=[];let E=M.clone().lerp(x,_/S),w=b.clone().lerp(x,_/S),C=S-_;for(let P=0;P<=C;P++)P===0&&_===S?R[_][P]=E:R[_][P]=E.clone().lerp(w,P/C)}for(let _=0;_<S;_++)for(let E=0;E<2*(S-_)-1;E++){let w=Math.floor(E/2);E%2===0?(u(R[_][w+1]),u(R[_+1][w]),u(R[_][w])):(u(R[_][w+1]),u(R[_+1][w+1]),u(R[_+1][w]))}}function l(M){let b=new D;for(let x=0;x<r.length;x+=3)b.x=r[x+0],b.y=r[x+1],b.z=r[x+2],b.normalize().multiplyScalar(M),r[x+0]=b.x,r[x+1]=b.y,r[x+2]=b.z}function h(){let M=new D;for(let b=0;b<r.length;b+=3){M.x=r[b+0],M.y=r[b+1],M.z=r[b+2];let x=p(M)/2/Math.PI+.5,T=m(M)/Math.PI+.5;o.push(x,1-T)}g(),d()}function d(){for(let M=0;M<o.length;M+=6){let b=o[M+0],x=o[M+2],T=o[M+4],S=Math.max(b,x,T),R=Math.min(b,x,T);S>.9&&R<.1&&(b<.2&&(o[M+0]+=1),x<.2&&(o[M+2]+=1),T<.2&&(o[M+4]+=1))}}function u(M){r.push(M.x,M.y,M.z)}function f(M,b){let x=M*3;b.x=t[x+0],b.y=t[x+1],b.z=t[x+2]}function g(){let M=new D,b=new D,x=new D,T=new D,S=new xt,R=new xt,_=new xt;for(let E=0,w=0;E<r.length;E+=9,w+=6){M.set(r[E+0],r[E+1],r[E+2]),b.set(r[E+3],r[E+4],r[E+5]),x.set(r[E+6],r[E+7],r[E+8]),S.set(o[w+0],o[w+1]),R.set(o[w+2],o[w+3]),_.set(o[w+4],o[w+5]),T.copy(M).add(b).add(x).divideScalar(3);let C=p(T);y(S,w+0,M,C),y(R,w+2,b,C),y(_,w+4,x,C)}}function y(M,b,x,T){T<0&&M.x===1&&(o[b]=M.x-1),x.x===0&&x.z===0&&(o[b]=T/2/Math.PI+.5)}function p(M){return Math.atan2(M.z,-M.x)}function m(M){return Math.atan2(-M.y,Math.sqrt(M.x*M.x+M.z*M.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.vertices,t.indices,t.radius,t.detail)}};var vn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Jt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,s=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let n=this.getLengths(),s=0,r=n.length,o;e?o=e:o=t*n[r-1];let a=0,c=r-1,l;for(;a<=c;)if(s=Math.floor(a+(c-a)/2),l=n[s]-o,l<0)a=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,n[s]===o)return s/(r-1);let h=n[s],u=n[s+1]-h,f=(o-h)/u;return(s+f)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),c=e||(o.isVector2?new xt:new D);return c.copy(a).sub(o).normalize(),c}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){let n=new D,s=[],r=[],o=[],a=new D,c=new ne;for(let f=0;f<=t;f++){let g=f/t;s[f]=this.getTangentAt(g,new D)}r[0]=new D,o[0]=new D;let l=Number.MAX_VALUE,h=Math.abs(s[0].x),d=Math.abs(s[0].y),u=Math.abs(s[0].z);h<=l&&(l=h,n.set(1,0,0)),d<=l&&(l=d,n.set(0,1,0)),u<=l&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(s[f-1],s[f]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(le(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(c.makeRotationAxis(a,g))}o[f].crossVectors(s[f],r[f])}if(e===!0){let f=Math.acos(le(r[0].dot(r[t]),-1,1));f/=t,s[0].dot(a.crossVectors(r[0],r[t]))>0&&(f=-f);for(let g=1;g<=t;g++)r[g].applyMatrix4(c.makeRotationAxis(s[g],f*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},Ls=class extends vn{constructor(t=0,e=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=c}getPoint(t,e=new xt){let n=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+t*r,c=this.aX+this.xRadius*Math.cos(a),l=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),u=c-this.aX,f=l-this.aY;c=u*h-f*d+this.aX,l=u*d+f*h+this.aY}return n.set(c,l)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Qo=class extends Ls{constructor(t,e,n,s,r,o){super(t,e,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function kl(){let i=0,t=0,e=0,n=0;function s(r,o,a,c){i=r,t=a,e=-3*r+3*o-2*a-c,n=2*r-2*o+a+c}return{initCatmullRom:function(r,o,a,c,l){s(o,a,l*(a-r),l*(c-o))},initNonuniformCatmullRom:function(r,o,a,c,l,h,d){let u=(o-r)/l-(a-r)/(l+h)+(a-o)/h,f=(a-o)/h-(c-o)/(h+d)+(c-a)/d;u*=h,f*=h,s(o,a,u,f)},calc:function(r){let o=r*r,a=o*r;return i+t*r+e*o+n*a}}}var Qh=new D,jh=new D,sl=new kl,rl=new kl,ol=new kl,jo=class extends vn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new D){let n=e,s=this.points,r=s.length,o=(r-(this.closed?0:1))*t,a=Math.floor(o),c=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:c===0&&a===r-1&&(a=r-2,c=1);let l,h;this.closed||a>0?l=s[(a-1)%r]:(jh.subVectors(s[0],s[1]).add(s[0]),l=jh);let d=s[a%r],u=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(Qh.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=Qh),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,g=Math.pow(l.distanceToSquared(d),f),y=Math.pow(d.distanceToSquared(u),f),p=Math.pow(u.distanceToSquared(h),f);y<1e-4&&(y=1),g<1e-4&&(g=y),p<1e-4&&(p=y),sl.initNonuniformCatmullRom(l.x,d.x,u.x,h.x,g,y,p),rl.initNonuniformCatmullRom(l.y,d.y,u.y,h.y,g,y,p),ol.initNonuniformCatmullRom(l.z,d.z,u.z,h.z,g,y,p)}else this.curveType==="catmullrom"&&(sl.initCatmullRom(l.x,d.x,u.x,h.x,this.tension),rl.initCatmullRom(l.y,d.y,u.y,h.y,this.tension),ol.initCatmullRom(l.z,d.z,u.z,h.z,this.tension));return n.set(sl.calc(c),rl.calc(c),ol.calc(c)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new D().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function tu(i,t,e,n,s){let r=(n-t)*.5,o=(s-e)*.5,a=i*i,c=i*a;return(2*e-2*n+r+o)*c+(-3*e+3*n-2*r-o)*a+r*i+e}function Zf(i,t){let e=1-i;return e*e*t}function $f(i,t){return 2*(1-i)*i*t}function Jf(i,t){return i*i*t}function sr(i,t,e,n){return Zf(i,t)+$f(i,e)+Jf(i,n)}function Kf(i,t){let e=1-i;return e*e*e*t}function Qf(i,t){let e=1-i;return 3*e*e*i*t}function jf(i,t){return 3*(1-i)*i*i*t}function tp(i,t){return i*i*i*t}function rr(i,t,e,n,s){return Kf(i,t)+Qf(i,e)+jf(i,n)+tp(i,s)}var vr=class extends vn{constructor(t=new xt,e=new xt,n=new xt,s=new xt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new xt){let n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(rr(t,s.x,r.x,o.x,a.x),rr(t,s.y,r.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},ta=class extends vn{constructor(t=new D,e=new D,n=new D,s=new D){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new D){let n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(rr(t,s.x,r.x,o.x,a.x),rr(t,s.y,r.y,o.y,a.y),rr(t,s.z,r.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Mr=class extends vn{constructor(t=new xt,e=new xt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new xt){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new xt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},ea=class extends vn{constructor(t=new D,e=new D){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new D){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new D){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Sr=class extends vn{constructor(t=new xt,e=new xt,n=new xt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new xt){let n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(sr(t,s.x,r.x,o.x),sr(t,s.y,r.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},na=class extends vn{constructor(t=new D,e=new D,n=new D){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new D){let n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(sr(t,s.x,r.x,o.x),sr(t,s.y,r.y,o.y),sr(t,s.z,r.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},br=class extends vn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new xt){let n=e,s=this.points,r=(s.length-1)*t,o=Math.floor(r),a=r-o,c=s[o===0?o:o-1],l=s[o],h=s[o>s.length-2?s.length-1:o+1],d=s[o>s.length-3?s.length-1:o+2];return n.set(tu(a,c.x,l.x,h.x,d.x),tu(a,c.y,l.y,h.y,d.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new xt().fromArray(s))}return this}},pl=Object.freeze({__proto__:null,ArcCurve:Qo,CatmullRomCurve3:jo,CubicBezierCurve:vr,CubicBezierCurve3:ta,EllipseCurve:Ls,LineCurve:Mr,LineCurve3:ea,QuadraticBezierCurve:Sr,QuadraticBezierCurve3:na,SplineCurve:br}),ia=class extends vn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new pl[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let o=s[r]-n,a=this.curves[r],c=a.getLength(),l=c===0?0:1-o/c;return a.getPointAt(l,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,c=o.getPoints(a);for(let l=0;l<c.length;l++){let h=c[l];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(new pl[s.type]().fromJSON(s))}return this}},Er=class extends ia{constructor(t){super(),this.type="Path",this.currentPoint=new xt,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let n=new Mr(this.currentPoint.clone(),new xt(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){let r=new Sr(this.currentPoint.clone(),new xt(t,e),new xt(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,o){let a=new vr(this.currentPoint.clone(),new xt(t,e),new xt(n,s),new xt(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),n=new br(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,o){let a=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(t+a,e+c,n,s,r,o),this}absarc(t,e,n,s,r,o){return this.absellipse(t,e,n,n,s,r,o),this}ellipse(t,e,n,s,r,o,a,c){let l=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+l,e+h,n,s,r,o,a,c),this}absellipse(t,e,n,s,r,o,a,c){let l=new Ls(t,e,n,s,r,o,a,c);if(this.curves.length>0){let d=l.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(l);let h=l.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},Ds=class extends Er{constructor(t){super(t),this.uuid=Hs(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){let s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(new Er().fromJSON(s))}return this}};function ep(i,t,e=2){let n=t&&t.length,s=n?t[0]*e:i.length,r=Yu(i,0,s,e,!0),o=[];if(!r||r.next===r.prev)return o;let a,c,l;if(n&&(r=op(i,t,r,e)),i.length>80*e){a=i[0],c=i[1];let h=a,d=c;for(let u=e;u<s;u+=e){let f=i[u],g=i[u+1];f<a&&(a=f),g<c&&(c=g),f>h&&(h=f),g>d&&(d=g)}l=Math.max(h-a,d-c),l=l!==0?32767/l:0}return wr(r,o,e,a,c,l,0),o}function Yu(i,t,e,n,s){let r;if(s===xp(i,t,e,n)>0)for(let o=t;o<e;o+=n)r=eu(o/n|0,i[o],i[o+1],r);else for(let o=e-n;o>=t;o-=n)r=eu(o/n|0,i[o],i[o+1],r);return r&&Us(r,r.next)&&(Ar(r),r=r.next),r}function ji(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(Us(e,e.next)||Ae(e.prev,e,e.next)===0)){if(Ar(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function wr(i,t,e,n,s,r,o){if(!i)return;!o&&r&&up(i,n,s,r);let a=i;for(;i.prev!==i.next;){let c=i.prev,l=i.next;if(r?ip(i,n,s,r):np(i)){t.push(c.i,i.i,l.i),Ar(i),i=l.next,a=l.next;continue}if(i=l,i===a){o?o===1?(i=sp(ji(i),t),wr(i,t,e,n,s,r,2)):o===2&&rp(i,t,e,n,s,r):wr(ji(i),t,e,n,s,r,1);break}}}function np(i){let t=i.prev,e=i,n=i.next;if(Ae(t,e,n)>=0)return!1;let s=t.x,r=e.x,o=n.x,a=t.y,c=e.y,l=n.y,h=Math.min(s,r,o),d=Math.min(a,c,l),u=Math.max(s,r,o),f=Math.max(a,c,l),g=n.next;for(;g!==t;){if(g.x>=h&&g.x<=u&&g.y>=d&&g.y<=f&&ir(s,a,r,c,o,l,g.x,g.y)&&Ae(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function ip(i,t,e,n){let s=i.prev,r=i,o=i.next;if(Ae(s,r,o)>=0)return!1;let a=s.x,c=r.x,l=o.x,h=s.y,d=r.y,u=o.y,f=Math.min(a,c,l),g=Math.min(h,d,u),y=Math.max(a,c,l),p=Math.max(h,d,u),m=ml(f,g,t,e,n),M=ml(y,p,t,e,n),b=i.prevZ,x=i.nextZ;for(;b&&b.z>=m&&x&&x.z<=M;){if(b.x>=f&&b.x<=y&&b.y>=g&&b.y<=p&&b!==s&&b!==o&&ir(a,h,c,d,l,u,b.x,b.y)&&Ae(b.prev,b,b.next)>=0||(b=b.prevZ,x.x>=f&&x.x<=y&&x.y>=g&&x.y<=p&&x!==s&&x!==o&&ir(a,h,c,d,l,u,x.x,x.y)&&Ae(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;b&&b.z>=m;){if(b.x>=f&&b.x<=y&&b.y>=g&&b.y<=p&&b!==s&&b!==o&&ir(a,h,c,d,l,u,b.x,b.y)&&Ae(b.prev,b,b.next)>=0)return!1;b=b.prevZ}for(;x&&x.z<=M;){if(x.x>=f&&x.x<=y&&x.y>=g&&x.y<=p&&x!==s&&x!==o&&ir(a,h,c,d,l,u,x.x,x.y)&&Ae(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function sp(i,t){let e=i;do{let n=e.prev,s=e.next.next;!Us(n,s)&&$u(n,e,e.next,s)&&Tr(n,s)&&Tr(s,n)&&(t.push(n.i,e.i,s.i),Ar(e),Ar(e.next),e=i=s),e=e.next}while(e!==i);return ji(e)}function rp(i,t,e,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&pp(o,a)){let c=Ju(o,a);o=ji(o,o.next),c=ji(c,c.next),wr(o,t,e,n,s,r,0),wr(c,t,e,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function op(i,t,e,n){let s=[];for(let r=0,o=t.length;r<o;r++){let a=t[r]*n,c=r<o-1?t[r+1]*n:i.length,l=Yu(i,a,c,n,!1);l===l.next&&(l.steiner=!0),s.push(fp(l))}s.sort(ap);for(let r=0;r<s.length;r++)e=cp(s[r],e);return e}function ap(i,t){let e=i.x-t.x;if(e===0&&(e=i.y-t.y,e===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(t.next.y-t.y)/(t.next.x-t.x);e=n-s}return e}function cp(i,t){let e=lp(i,t);if(!e)return t;let n=Ju(e,i);return ji(n,n.next),ji(e,e.next)}function lp(i,t){let e=t,n=i.x,s=i.y,r=-1/0,o;if(Us(i,e))return e;do{if(Us(i,e.next))return e.next;if(s<=e.y&&s>=e.next.y&&e.next.y!==e.y){let d=e.x+(s-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(d<=n&&d>r&&(r=d,o=e.x<e.next.x?e:e.next,d===n))return o}e=e.next}while(e!==t);if(!o)return null;let a=o,c=o.x,l=o.y,h=1/0;e=o;do{if(n>=e.x&&e.x>=c&&n!==e.x&&Zu(s<l?n:r,s,c,l,s<l?r:n,s,e.x,e.y)){let d=Math.abs(s-e.y)/(n-e.x);Tr(e,i)&&(d<h||d===h&&(e.x>o.x||e.x===o.x&&hp(o,e)))&&(o=e,h=d)}e=e.next}while(e!==a);return o}function hp(i,t){return Ae(i.prev,i,t.prev)<0&&Ae(t.next,i,i.next)<0}function up(i,t,e,n){let s=i;do s.z===0&&(s.z=ml(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,dp(s)}function dp(i){let t,e=1;do{let n=i,s;i=null;let r=null;for(t=0;n;){t++;let o=n,a=0;for(let l=0;l<e&&(a++,o=o.nextZ,!!o);l++);let c=e;for(;a>0||c>0&&o;)a!==0&&(c===0||!o||n.z<=o.z)?(s=n,n=n.nextZ,a--):(s=o,o=o.nextZ,c--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=o}r.nextZ=null,e*=2}while(t>1);return i}function ml(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function fp(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function Zu(i,t,e,n,s,r,o,a){return(s-o)*(t-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(s-o)*(n-a)}function ir(i,t,e,n,s,r,o,a){return!(i===o&&t===a)&&Zu(i,t,e,n,s,r,o,a)}function pp(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!mp(i,t)&&(Tr(i,t)&&Tr(t,i)&&gp(i,t)&&(Ae(i.prev,i,t.prev)||Ae(i,t.prev,t))||Us(i,t)&&Ae(i.prev,i,i.next)>0&&Ae(t.prev,t,t.next)>0)}function Ae(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function Us(i,t){return i.x===t.x&&i.y===t.y}function $u(i,t,e,n){let s=Io(Ae(i,t,e)),r=Io(Ae(i,t,n)),o=Io(Ae(e,n,i)),a=Io(Ae(e,n,t));return!!(s!==r&&o!==a||s===0&&Co(i,e,t)||r===0&&Co(i,n,t)||o===0&&Co(e,i,n)||a===0&&Co(e,t,n))}function Co(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function Io(i){return i>0?1:i<0?-1:0}function mp(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&$u(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function Tr(i,t){return Ae(i.prev,i,i.next)<0?Ae(i,t,i.next)>=0&&Ae(i,i.prev,t)>=0:Ae(i,t,i.prev)<0||Ae(i,i.next,t)<0}function gp(i,t){let e=i,n=!1,s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function Ju(i,t){let e=gl(i.i,i.x,i.y),n=gl(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function eu(i,t,e,n){let s=gl(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Ar(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function gl(i,t,e){return{i,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function xp(i,t,e,n){let s=0;for(let r=t,o=e-n;r<e;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}var xl=class{static triangulate(t,e,n=2){return ep(t,e,n)}},$i=class i{static area(t){let e=t.length,n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return i.area(t)<0}static triangulateShape(t,e){let n=[],s=[],r=[];nu(t),iu(n,t);let o=t.length;e.forEach(nu);for(let c=0;c<e.length;c++)s.push(o),o+=e[c].length,iu(n,e[c]);let a=xl.triangulate(n,s);for(let c=0;c<a.length;c+=3)r.push(a.slice(c,c+3));return r}};function nu(i){let t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function iu(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}var Ns=class i extends Oe{constructor(t=new Ds([new xt(.5,.5),new xt(-.5,.5),new xt(-.5,-.5),new xt(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let n=this,s=[],r=[];for(let a=0,c=t.length;a<c;a++){let l=t[a];o(l)}this.setAttribute("position",new re(s,3)),this.setAttribute("uv",new re(r,2)),this.computeVertexNormals();function o(a){let c=[],l=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,d=e.depth!==void 0?e.depth:1,u=e.bevelEnabled!==void 0?e.bevelEnabled:!0,f=e.bevelThickness!==void 0?e.bevelThickness:.2,g=e.bevelSize!==void 0?e.bevelSize:f-.1,y=e.bevelOffset!==void 0?e.bevelOffset:0,p=e.bevelSegments!==void 0?e.bevelSegments:3,m=e.extrudePath,M=e.UVGenerator!==void 0?e.UVGenerator:_p,b,x=!1,T,S,R,_;if(m){b=m.getSpacedPoints(h),x=!0,u=!1;let et=m.isCatmullRomCurve3?m.closed:!1;T=m.computeFrenetFrames(h,et),S=new D,R=new D,_=new D}u||(p=0,f=0,g=0,y=0);let E=a.extractPoints(l),w=E.shape,C=E.holes;if(!$i.isClockWise(w)){w=w.reverse();for(let et=0,ot=C.length;et<ot;et++){let lt=C[et];$i.isClockWise(lt)&&(C[et]=lt.reverse())}}function O(et){let lt=10000000000000001e-36,St=et[0];for(let Mt=1;Mt<=et.length;Mt++){let Zt=Mt%et.length,Ht=et[Zt],Qt=Ht.x-St.x,ee=Ht.y-St.y,F=Qt*Qt+ee*ee,pe=Math.max(Math.abs(Ht.x),Math.abs(Ht.y),Math.abs(St.x),Math.abs(St.y)),ce=lt*pe*pe;if(F<=ce){et.splice(Zt,1),Mt--;continue}St=Ht}}O(w),C.forEach(O);let z=C.length,L=w;for(let et=0;et<z;et++){let ot=C[et];w=w.concat(ot)}function N(et,ot,lt){return ot||$t("ExtrudeGeometry: vec does not exist"),et.clone().addScaledVector(ot,lt)}let U=w.length;function G(et,ot,lt){let St,Mt,Zt,Ht=et.x-ot.x,Qt=et.y-ot.y,ee=lt.x-et.x,F=lt.y-et.y,pe=Ht*Ht+Qt*Qt,ce=Ht*F-Qt*ee;if(Math.abs(ce)>Number.EPSILON){let I=Math.sqrt(pe),v=Math.sqrt(ee*ee+F*F),V=ot.x-Qt/I,Y=ot.y+Ht/I,Q=lt.x-F/v,ft=lt.y+ee/v,_t=((Q-V)*F-(ft-Y)*ee)/(Ht*F-Qt*ee);St=V+Ht*_t-et.x,Mt=Y+Qt*_t-et.y;let j=St*St+Mt*Mt;if(j<=2)return new xt(St,Mt);Zt=Math.sqrt(j/2)}else{let I=!1;Ht>Number.EPSILON?ee>Number.EPSILON&&(I=!0):Ht<-Number.EPSILON?ee<-Number.EPSILON&&(I=!0):Math.sign(Qt)===Math.sign(F)&&(I=!0),I?(St=-Qt,Mt=Ht,Zt=Math.sqrt(pe)):(St=Ht,Mt=Qt,Zt=Math.sqrt(pe/2))}return new xt(St/Zt,Mt/Zt)}let Z=[];for(let et=0,ot=L.length,lt=ot-1,St=et+1;et<ot;et++,lt++,St++)lt===ot&&(lt=0),St===ot&&(St=0),Z[et]=G(L[et],L[lt],L[St]);let q=[],J,K=Z.concat();for(let et=0,ot=z;et<ot;et++){let lt=C[et];J=[];for(let St=0,Mt=lt.length,Zt=Mt-1,Ht=St+1;St<Mt;St++,Zt++,Ht++)Zt===Mt&&(Zt=0),Ht===Mt&&(Ht=0),J[St]=G(lt[St],lt[Zt],lt[Ht]);q.push(J),K=K.concat(J)}let ct;if(p===0)ct=$i.triangulateShape(L,C);else{let et=[],ot=[];for(let lt=0;lt<p;lt++){let St=lt/p,Mt=f*Math.cos(St*Math.PI/2),Zt=g*Math.sin(St*Math.PI/2)+y;for(let Ht=0,Qt=L.length;Ht<Qt;Ht++){let ee=N(L[Ht],Z[Ht],Zt);gt(ee.x,ee.y,-Mt),St===0&&et.push(ee)}for(let Ht=0,Qt=z;Ht<Qt;Ht++){let ee=C[Ht];J=q[Ht];let F=[];for(let pe=0,ce=ee.length;pe<ce;pe++){let I=N(ee[pe],J[pe],Zt);gt(I.x,I.y,-Mt),St===0&&F.push(I)}St===0&&ot.push(F)}}ct=$i.triangulateShape(et,ot)}let mt=ct.length,rt=g+y;for(let et=0;et<U;et++){let ot=u?N(w[et],K[et],rt):w[et];x?(R.copy(T.normals[0]).multiplyScalar(ot.x),S.copy(T.binormals[0]).multiplyScalar(ot.y),_.copy(b[0]).add(R).add(S),gt(_.x,_.y,_.z)):gt(ot.x,ot.y,0)}for(let et=1;et<=h;et++)for(let ot=0;ot<U;ot++){let lt=u?N(w[ot],K[ot],rt):w[ot];x?(R.copy(T.normals[et]).multiplyScalar(lt.x),S.copy(T.binormals[et]).multiplyScalar(lt.y),_.copy(b[et]).add(R).add(S),gt(_.x,_.y,_.z)):gt(lt.x,lt.y,d/h*et)}for(let et=p-1;et>=0;et--){let ot=et/p,lt=f*Math.cos(ot*Math.PI/2),St=g*Math.sin(ot*Math.PI/2)+y;for(let Mt=0,Zt=L.length;Mt<Zt;Mt++){let Ht=N(L[Mt],Z[Mt],St);gt(Ht.x,Ht.y,d+lt)}for(let Mt=0,Zt=C.length;Mt<Zt;Mt++){let Ht=C[Mt];J=q[Mt];for(let Qt=0,ee=Ht.length;Qt<ee;Qt++){let F=N(Ht[Qt],J[Qt],St);x?gt(F.x,F.y+b[h-1].y,b[h-1].x+lt):gt(F.x,F.y,d+lt)}}}k(),nt();function k(){let et=s.length/3;if(u){let ot=0,lt=U*ot;for(let St=0;St<mt;St++){let Mt=ct[St];yt(Mt[2]+lt,Mt[1]+lt,Mt[0]+lt)}ot=h+p*2,lt=U*ot;for(let St=0;St<mt;St++){let Mt=ct[St];yt(Mt[0]+lt,Mt[1]+lt,Mt[2]+lt)}}else{for(let ot=0;ot<mt;ot++){let lt=ct[ot];yt(lt[2],lt[1],lt[0])}for(let ot=0;ot<mt;ot++){let lt=ct[ot];yt(lt[0]+U*h,lt[1]+U*h,lt[2]+U*h)}}n.addGroup(et,s.length/3-et,0)}function nt(){let et=s.length/3,ot=0;tt(L,ot),ot+=L.length;for(let lt=0,St=C.length;lt<St;lt++){let Mt=C[lt];tt(Mt,ot),ot+=Mt.length}n.addGroup(et,s.length/3-et,1)}function tt(et,ot){let lt=et.length;for(;--lt>=0;){let St=lt,Mt=lt-1;Mt<0&&(Mt=et.length-1);for(let Zt=0,Ht=h+p*2;Zt<Ht;Zt++){let Qt=U*Zt,ee=U*(Zt+1),F=ot+St+Qt,pe=ot+Mt+Qt,ce=ot+Mt+ee,I=ot+St+ee;dt(F,pe,ce,I)}}}function gt(et,ot,lt){c.push(et),c.push(ot),c.push(lt)}function yt(et,ot,lt){Yt(et),Yt(ot),Yt(lt);let St=s.length/3,Mt=M.generateTopUV(n,s,St-3,St-2,St-1);Nt(Mt[0]),Nt(Mt[1]),Nt(Mt[2])}function dt(et,ot,lt,St){Yt(et),Yt(ot),Yt(St),Yt(ot),Yt(lt),Yt(St);let Mt=s.length/3,Zt=M.generateSideWallUV(n,s,Mt-6,Mt-3,Mt-2,Mt-1);Nt(Zt[0]),Nt(Zt[1]),Nt(Zt[3]),Nt(Zt[1]),Nt(Zt[2]),Nt(Zt[3])}function Yt(et){s.push(c[et*3+0]),s.push(c[et*3+1]),s.push(c[et*3+2])}function Nt(et){r.push(et.x),r.push(et.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return yp(e,n,t)}static fromJSON(t,e){let n=[];for(let r=0,o=t.shapes.length;r<o;r++){let a=e[t.shapes[r]];n.push(a)}let s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new pl[s.type]().fromJSON(s)),new i(n,t.options)}},_p={generateTopUV:function(i,t,e,n,s){let r=t[e*3],o=t[e*3+1],a=t[n*3],c=t[n*3+1],l=t[s*3],h=t[s*3+1];return[new xt(r,o),new xt(a,c),new xt(l,h)]},generateSideWallUV:function(i,t,e,n,s,r){let o=t[e*3],a=t[e*3+1],c=t[e*3+2],l=t[n*3],h=t[n*3+1],d=t[n*3+2],u=t[s*3],f=t[s*3+1],g=t[s*3+2],y=t[r*3],p=t[r*3+1],m=t[r*3+2];return Math.abs(a-h)<Math.abs(o-l)?[new xt(o,1-c),new xt(l,1-d),new xt(u,1-g),new xt(y,1-m)]:[new xt(a,1-c),new xt(h,1-d),new xt(f,1-g),new xt(p,1-m)]}};function yp(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var Rr=class i extends Ko{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};var be=class i extends Oe{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,o=e/2,a=Math.floor(n),c=Math.floor(s),l=a+1,h=c+1,d=t/a,u=e/c,f=[],g=[],y=[],p=[];for(let m=0;m<h;m++){let M=m*u-o;for(let b=0;b<l;b++){let x=b*d-r;g.push(x,-M,0),y.push(0,0,1),p.push(b/a),p.push(1-m/c)}}for(let m=0;m<c;m++)for(let M=0;M<a;M++){let b=M+l*m,x=M+l*(m+1),T=M+1+l*(m+1),S=M+1+l*m;f.push(b,x,S),f.push(x,T,S)}this.setIndex(f),this.setAttribute("position",new re(g,3)),this.setAttribute("normal",new re(y,3)),this.setAttribute("uv",new re(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}};var fe=class i extends Oe{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let c=Math.min(o+a,Math.PI),l=0,h=[],d=new D,u=new D,f=[],g=[],y=[],p=[];for(let m=0;m<=n;m++){let M=[],b=m/n,x=o+b*a,T=t*Math.cos(x),S=Math.sqrt(t*t-T*T),R=0;m===0&&o===0?R=.5/e:m===n&&c===Math.PI&&(R=-.5/e);for(let _=0;_<=e;_++){let E=_/e,w=s+E*r;d.x=-S*Math.cos(w),d.y=T,d.z=S*Math.sin(w),g.push(d.x,d.y,d.z),u.copy(d).normalize(),y.push(u.x,u.y,u.z),p.push(E+R,1-b),M.push(l++)}h.push(M)}for(let m=0;m<n;m++)for(let M=0;M<e;M++){let b=h[m][M+1],x=h[m][M],T=h[m+1][M],S=h[m+1][M+1];(m!==0||o>0)&&f.push(b,x,S),(m!==n-1||c<Math.PI)&&f.push(x,T,S)}this.setIndex(f),this.setAttribute("position",new re(g,3)),this.setAttribute("normal",new re(y,3)),this.setAttribute("uv",new re(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var Cr=class i extends Oe{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r,thetaStart:o,thetaLength:a},n=Math.floor(n),s=Math.floor(s);let c=[],l=[],h=[],d=[],u=new D,f=new D,g=new D;for(let y=0;y<=n;y++){let p=o+y/n*a;for(let m=0;m<=s;m++){let M=m/s*r;f.x=(t+e*Math.cos(p))*Math.cos(M),f.y=(t+e*Math.cos(p))*Math.sin(M),f.z=e*Math.sin(p),l.push(f.x,f.y,f.z),u.x=t*Math.cos(M),u.y=t*Math.sin(M),g.subVectors(f,u).normalize(),h.push(g.x,g.y,g.z),d.push(m/s),d.push(y/n)}}for(let y=1;y<=n;y++)for(let p=1;p<=s;p++){let m=(s+1)*y+p-1,M=(s+1)*(y-1)+p-1,b=(s+1)*(y-1)+p,x=(s+1)*y+p;c.push(m,M,x),c.push(M,b,x)}this.setIndex(c),this.setAttribute("position",new re(l,3)),this.setAttribute("normal",new re(h,3)),this.setAttribute("uv",new re(d,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}};function es(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];if(su(s))s.isRenderTargetTexture?(Jt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(su(s[0])){let r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function on(i){let t={};for(let e=0;e<i.length;e++){let n=es(i[e]);for(let s in n)t[s]=n[s]}return t}function su(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function vp(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Gl(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:he.workingColorSpace}var Ku={clone:es,merge:on},Mp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Sp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,ln=class extends pi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Mp,this.fragmentShader=Sp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=es(t.uniforms),this.uniformsGroups=vp(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new Vt().setHex(s.value);break;case"v2":this.uniforms[n].value=new xt().fromArray(s.value);break;case"v3":this.uniforms[n].value=new D().fromArray(s.value);break;case"v4":this.uniforms[n].value=new we().fromArray(s.value);break;case"m3":this.uniforms[n].value=new jt().fromArray(s.value);break;case"m4":this.uniforms[n].value=new ne().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},sa=class extends ln{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Ct=class extends pi{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Vt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Vt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Yr,this.normalScale=new xt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Te,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var Ue=class extends pi{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Vt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Vt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Yr,this.normalScale=new xt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Te,this.combine=ya,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},ra=class extends pi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Uu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},oa=class extends pi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Po(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}var Di=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let o;e:{i:if(!(t<s)){for(let a=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=e[++n],t<s)break t}o=e.length;break e}if(!(t>=r)){let a=e[1];t<a&&(n=2,r=a);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=e[--n-1],t>=r)break t}o=n,n=0;break e}break n}for(;n<o;){let a=n+o>>>1;t<e[a]?o=a:n=a+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let o=0;o!==s;++o)e[o]=n[r+o];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},aa=class extends Di{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ll,endingEnd:ll}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,o=t+1,a=s[r],c=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case hl:r=t,a=2*e-n;break;case ul:r=s.length-2,a=e+s[r]-s[r+1];break;default:r=t,a=n}if(c===void 0)switch(this.getSettings_().endingEnd){case hl:o=t,c=2*n-e;break;case ul:o=1,c=n+s[1]-s[0];break;default:o=t-1,c=e}let l=(n-e)*.5,h=this.valueSize;this._weightPrev=l/(e-a),this._weightNext=l/(c-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=t*a,l=c-a,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,f=this._weightNext,g=(n-e)/(s-e),y=g*g,p=y*g,m=-u*p+2*u*y-u*g,M=(1+u)*p+(-1.5-2*u)*y+(-.5+u)*g+1,b=(-1-f)*p+(1.5+f)*y+.5*g,x=f*p-f*y;for(let T=0;T!==a;++T)r[T]=m*o[h+T]+M*o[l+T]+b*o[c+T]+x*o[d+T];return r}},ca=class extends Di{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=t*a,l=c-a,h=(n-e)/(s-e),d=1-h;for(let u=0;u!==a;++u)r[u]=o[l+u]*d+o[c+u]*h;return r}},la=class extends Di{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},ha=class extends Di{interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=t*a,l=c-a,h=this.inTangents,d=this.outTangents;if(!h||!d){let g=(n-e)/(s-e),y=1-g;for(let p=0;p!==a;++p)r[p]=o[l+p]*y+o[c+p]*g;return r}let u=a*2,f=t-1;for(let g=0;g!==a;++g){let y=o[l+g],p=o[c+g],m=f*u+g*2,M=d[m],b=d[m+1],x=t*u+g*2,T=h[x],S=h[x+1],R=(n-e)/(s-e),_,E,w,C,P;for(let O=0;O<8;O++){_=R*R,E=_*R,w=1-R,C=w*w,P=C*w;let L=P*e+3*C*R*M+3*w*_*T+E*s-n;if(Math.abs(L)<1e-10)break;let N=3*C*(M-e)+6*w*R*(T-M)+3*_*(s-T);if(Math.abs(N)<1e-10)break;R=R-L/N,R=Math.max(0,Math.min(1,R))}r[g]=P*y+3*C*R*b+3*w*_*S+E*p}return r}},Mn=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Po(e,this.TimeBufferType),this.values=Po(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:Po(t.times,Array),values:Po(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s)}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new la(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new ca(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new aa(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new ha(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case or:e=this.InterpolantFactoryMethodDiscrete;break;case Xo:e=this.InterpolantFactoryMethodLinear;break;case Uo:e=this.InterpolantFactoryMethodSmooth;break;case cl:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Jt("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return or;case this.InterpolantFactoryMethodLinear:return Xo;case this.InterpolantFactoryMethodSmooth:return Uo;case this.InterpolantFactoryMethodBezier:return cl}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t}return this}trim(t,e){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<t;)++r;for(;o!==-1&&n[o]>e;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&($t("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&($t("KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let c=n[a];if(typeof c=="number"&&isNaN(c)){$t("KeyframeTrack: Time is not a valid number.",this,a,c),t=!1;break}if(o!==null&&o>c){$t("KeyframeTrack: Out of order keys.",this,a,c,o),t=!1;break}o=c}if(s!==void 0&&Af(s))for(let a=0,c=s.length;a!==c;++a){let l=s[a];if(isNaN(l)){$t("KeyframeTrack: Value is not a valid number.",this,a,l),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Uo,r=t.length-1,o=1;for(let a=1;a<r;++a){let c=!1,l=t[a],h=t[a+1];if(l!==h&&(a!==1||l!==t[0]))if(s)c=!0;else{let d=a*n,u=d-n,f=d+n;for(let g=0;g!==n;++g){let y=e[d+g];if(y!==e[u+g]||y!==e[f+g]){c=!0;break}}}if(c){if(a!==o){t[o]=t[a];let d=a*n,u=o*n;for(let f=0;f!==n;++f)e[u+f]=e[d+f]}++o}}if(r>0){t[o]=t[r];for(let a=r*n,c=o*n,l=0;l!==n;++l)e[c+l]=e[a+l];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,s}};Mn.prototype.ValueTypeName="";Mn.prototype.TimeBufferType=Float32Array;Mn.prototype.ValueBufferType=Float32Array;Mn.prototype.DefaultInterpolation=Xo;var Ui=class extends Mn{constructor(t,e,n){super(t,e,n)}};Ui.prototype.ValueTypeName="bool";Ui.prototype.ValueBufferType=Array;Ui.prototype.DefaultInterpolation=or;Ui.prototype.InterpolantFactoryMethodLinear=void 0;Ui.prototype.InterpolantFactoryMethodSmooth=void 0;var ua=class extends Mn{constructor(t,e,n,s){super(t,e,n,s)}};ua.prototype.ValueTypeName="color";var da=class extends Mn{constructor(t,e,n,s){super(t,e,n,s)}};da.prototype.ValueTypeName="number";var fa=class extends Di{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(n-e)/(s-e),l=t*a;for(let h=l+a;l!==h;l+=4)Se.slerpFlat(r,0,o,l-a,o,l,c);return r}},Ir=class extends Mn{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new fa(this.times,this.values,this.getValueSize(),t)}};Ir.prototype.ValueTypeName="quaternion";Ir.prototype.InterpolantFactoryMethodSmooth=void 0;var Ni=class extends Mn{constructor(t,e,n){super(t,e,n)}};Ni.prototype.ValueTypeName="string";Ni.prototype.ValueBufferType=Array;Ni.prototype.DefaultInterpolation=or;Ni.prototype.InterpolantFactoryMethodLinear=void 0;Ni.prototype.InterpolantFactoryMethodSmooth=void 0;var pa=class extends Mn{constructor(t,e,n,s){super(t,e,n,s)}};pa.prototype.ValueTypeName="vector";var ma=class{constructor(t,e,n){let s=this,r=!1,o=0,a=0,c,l=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,d){return l.push(h,d),this},this.removeHandler=function(h){let d=l.indexOf(h);return d!==-1&&l.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=l.length;d<u;d+=2){let f=l[d],g=l[d+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Qu=new ma,ga=class{constructor(t){this.manager=t!==void 0?t:Qu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};ga.DEFAULT_MATERIAL_NAME="__DEFAULT";var Pr=class extends rn{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Vt(t),this.intensity=e}dispose(){this.dispatchEvent({type:"dispose"})}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},Lr=class extends Pr{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(rn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Vt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},al=new ne,ru=new D,ou=new D,_l=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new xt(512,512),this.mapType=pn,this.map=null,this.mapPass=null,this.matrix=new ne,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ps,this._frameExtents=new xt(1,1),this._viewportCount=1,this._viewports=[new we(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera,n=this.matrix;ru.setFromMatrixPosition(t.matrixWorld),e.position.copy(ru),ou.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(ou),e.updateMatrixWorld(),al.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(al,e.coordinateSystem,e.reversedDepth),e.coordinateSystem===Ts||e.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(al)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Lo=new D,Do=new Se,Yn=new D,Dr=class extends rn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ne,this.projectionMatrix=new ne,this.projectionMatrixInverse=new ne,this.coordinateSystem=zn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Lo,Do,Yn),Yn.x===1&&Yn.y===1&&Yn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Lo,Do,Yn.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(Lo,Do,Yn),Yn.x===1&&Yn.y===1&&Yn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Lo,Do,Yn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Ri=new D,au=new xt,cu=new xt,sn=class extends Dr{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=qo*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Nc*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return qo*2*Math.atan(Math.tan(Nc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Ri.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Ri.x,Ri.y).multiplyScalar(-t/Ri.z),Ri.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ri.x,Ri.y).multiplyScalar(-t/Ri.z)}getViewSize(t,e){return this.getViewBounds(t,au,cu),e.subVectors(cu,au)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Nc*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*s/c,e-=o.offsetY*n/l,s*=o.width/c,n*=o.height/l}let a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var Fi=class extends Dr{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,o=n+t,a=s+e,c=s-e;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=h*this.view.offsetY,c=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},yl=class extends _l{constructor(){super(new Fi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ur=class extends Pr{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(rn.DEFAULT_UP),this.updateMatrix(),this.target=new rn,this.shadow=new yl}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var Ss=-90,bs=1,Fs=class extends rn{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new sn(Ss,bs,t,e);s.layers=this.layers,this.add(s);let r=new sn(Ss,bs,t,e);r.layers=this.layers,this.add(r);let o=new sn(Ss,bs,t,e);o.layers=this.layers,this.add(o);let a=new sn(Ss,bs,t,e);a.layers=this.layers,this.add(a);let c=new sn(Ss,bs,t,e);c.layers=this.layers,this.add(c);let l=new sn(Ss,bs,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,c]=e;for(let l of e)this.remove(l);if(t===zn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===Ts)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let l of e)this.add(l),l.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,c,l,h]=this.children,d=t.getRenderTarget(),u=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let p=!1;t.isWebGLRenderer===!0?p=t.state.buffers.depth.getReversed():p=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,2,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,3,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),t.setRenderTarget(n,4,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),n.texture.generateMipmaps=y,t.setRenderTarget(n,5,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(d,u,f),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},xa=class extends sn{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var Vl="\\[\\]\\.:\\/",bp=new RegExp("["+Vl+"]","g"),Wl="[^"+Vl+"]",Ep="[^"+Vl.replace("\\.","")+"]",wp=/((?:WC+[\/:])*)/.source.replace("WC",Wl),Tp=/(WCOD+)?/.source.replace("WCOD",Ep),Ap=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Wl),Rp=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Wl),Cp=new RegExp("^"+wp+Tp+Ap+Rp+"$"),Ip=["material","materials","bones","map"],vl=class{constructor(t,e,n){let s=n||Ee.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},Ee=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(bp,"")}static parseTrackName(t){let e=Cp.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Ip.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let c=n(a.children);if(c)return c}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Jt("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=e.objectIndex;switch(n){case"materials":if(!t.material){$t("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){$t("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){$t("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===l){l=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){$t("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){$t("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){$t("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(l!==void 0){if(t[l]===void 0){$t("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[l]}}let o=t[s];if(o===void 0){let l=e.nodeName;$t("PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){$t("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){$t("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Ee.Composite=vl;Ee.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Ee.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Ee.prototype.GetterByBindingType=[Ee.prototype._getValue_direct,Ee.prototype._getValue_array,Ee.prototype._getValue_arrayElement,Ee.prototype._getValue_toArray];Ee.prototype.SetterByBindingTypeAndVersioning=[[Ee.prototype._setValue_direct,Ee.prototype._setValue_direct_setNeedsUpdate,Ee.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ee.prototype._setValue_array,Ee.prototype._setValue_array_setNeedsUpdate,Ee.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ee.prototype._setValue_arrayElement,Ee.prototype._setValue_arrayElement_setNeedsUpdate,Ee.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ee.prototype._setValue_fromArray,Ee.prototype._setValue_fromArray_setNeedsUpdate,Ee.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var py=new Float32Array(1);var lu=new ne,Nr=class{constructor(t,e,n=0,s=1/0){this.ray=new mr(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new Cs,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):$t("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return lu.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(lu),this}intersectObject(t,e=!0,n=[]){return Ml(t,this,n,e),n.sort(hu),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)Ml(t[s],this,n,e);return n.sort(hu),n}};function hu(i,t){return i.distance-t.distance}function Ml(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let o=0,a=r.length;o<a;o++)Ml(r[o],t,e,!0)}}var Sl=class i{static{i.prototype.isMatrix2=!0}constructor(t,e,n,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=s,this}};function Xl(i,t,e,n){let s=Pp(n);switch(e){case Bl:return i*t;case Ta:return i*t/s.components*s.byteLength;case Aa:return i*t/s.components*s.byteLength;case zi:return i*t*2/s.components*s.byteLength;case Ra:return i*t*2/s.components*s.byteLength;case Ol:return i*t*3/s.components*s.byteLength;case Pn:return i*t*4/s.components*s.byteLength;case Ca:return i*t*4/s.components*s.byteLength;case kr:case Gr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Vr:case Wr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Pa:case Da:return Math.max(i,16)*Math.max(t,8)/4;case Ia:case La:return Math.max(i,8)*Math.max(t,8)/2;case Ua:case Na:case Ba:case Oa:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Fa:case Xr:case za:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Ha:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case ka:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Ga:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Va:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Wa:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case Xa:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case qa:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Ya:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Za:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case $a:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Ja:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Ka:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Qa:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case ja:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case tc:case ec:case nc:return Math.ceil(i/4)*Math.ceil(t/4)*16;case ic:case sc:return Math.ceil(i/4)*Math.ceil(t/4)*8;case qr:case rc:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Pp(i){switch(i){case pn:case Dl:return{byteLength:1,components:1};case Os:case Ul:case ei:return{byteLength:2,components:1};case Ea:case wa:return{byteLength:2,components:4};case kn:case ba:case In:return{byteLength:4,components:1};case Nl:case Fl:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"185"}}));typeof window<"u"&&(window.__THREE__?Jt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="185");function Md(){let i=null,t=!1,e=null,n=null;function s(r,o){e(r,o),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Dp(i){let t=new WeakMap;function e(a,c){let l=a.array,h=a.usage,d=l.byteLength,u=i.createBuffer();i.bindBuffer(c,u),i.bufferData(c,l,h),a.onUploadCallback();let f;if(l instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=i.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=i.SHORT;else if(l instanceof Uint32Array)f=i.UNSIGNED_INT;else if(l instanceof Int32Array)f=i.INT;else if(l instanceof Int8Array)f=i.BYTE;else if(l instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:u,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:d}}function n(a,c,l){let h=c.array,d=c.updateRanges;if(i.bindBuffer(l,a),d.length===0)i.bufferSubData(l,0,h);else{d.sort((f,g)=>f.start-g.start);let u=0;for(let f=1;f<d.length;f++){let g=d[u],y=d[f];y.start<=g.start+g.count+1?g.count=Math.max(g.count,y.start+y.count-g.start):(++u,d[u]=y)}d.length=u+1;for(let f=0,g=d.length;f<g;f++){let y=d[f];i.bufferSubData(l,y.start*h.BYTES_PER_ELEMENT,h,y.start,y.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let c=t.get(a);c&&(i.deleteBuffer(c.buffer),t.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let l=t.get(a);if(l===void 0)t.set(a,e(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,a,c),l.version=a.version}}return{get:s,remove:r,update:o}}var Up=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Np=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Fp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Bp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Op=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,zp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Hp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,kp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Gp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Vp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Wp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Xp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,qp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Yp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Zp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,$p=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Jp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Kp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Qp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,jp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,tm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,em=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,nm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,im=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,sm=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,rm=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,om=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,am=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,cm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,lm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,hm="gl_FragColor = linearToOutputTexel( gl_FragColor );",um=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,dm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,fm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,pm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,mm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,gm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,xm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,_m=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,ym=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,vm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Mm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Sm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,bm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Em=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,wm=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Tm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Am=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Rm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Cm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Im=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Pm=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Lm=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Dm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Um=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Nm=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Fm=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Bm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Om=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,zm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Hm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,km=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Gm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Vm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Wm=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Xm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,qm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Ym=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Zm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,$m=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Jm=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Km=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Qm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,jm=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,t0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,e0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,n0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,i0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,s0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,r0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,o0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,a0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,c0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,l0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,h0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,u0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,d0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,f0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,p0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,m0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,g0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,x0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,_0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,y0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,v0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,M0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,S0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,b0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,E0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,w0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,T0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,A0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,R0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,C0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,I0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,P0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,L0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,D0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,U0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,N0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,F0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,B0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,O0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,z0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,H0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,k0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,G0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,V0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,W0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,X0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,q0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Y0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Z0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,$0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,J0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,K0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Q0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,j0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,tg=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,eg=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,ng=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ig=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,sg=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,rg=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,og=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ag=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,cg=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,lg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,hg=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ug=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,dg=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,fg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,oe={alphahash_fragment:Up,alphahash_pars_fragment:Np,alphamap_fragment:Fp,alphamap_pars_fragment:Bp,alphatest_fragment:Op,alphatest_pars_fragment:zp,aomap_fragment:Hp,aomap_pars_fragment:kp,batching_pars_vertex:Gp,batching_vertex:Vp,begin_vertex:Wp,beginnormal_vertex:Xp,bsdfs:qp,iridescence_fragment:Yp,bumpmap_pars_fragment:Zp,clipping_planes_fragment:$p,clipping_planes_pars_fragment:Jp,clipping_planes_pars_vertex:Kp,clipping_planes_vertex:Qp,color_fragment:jp,color_pars_fragment:tm,color_pars_vertex:em,color_vertex:nm,common:im,cube_uv_reflection_fragment:sm,defaultnormal_vertex:rm,displacementmap_pars_vertex:om,displacementmap_vertex:am,emissivemap_fragment:cm,emissivemap_pars_fragment:lm,colorspace_fragment:hm,colorspace_pars_fragment:um,envmap_fragment:dm,envmap_common_pars_fragment:fm,envmap_pars_fragment:pm,envmap_pars_vertex:mm,envmap_physical_pars_fragment:Tm,envmap_vertex:gm,fog_vertex:xm,fog_pars_vertex:_m,fog_fragment:ym,fog_pars_fragment:vm,gradientmap_pars_fragment:Mm,lightmap_pars_fragment:Sm,lights_lambert_fragment:bm,lights_lambert_pars_fragment:Em,lights_pars_begin:wm,lights_toon_fragment:Am,lights_toon_pars_fragment:Rm,lights_phong_fragment:Cm,lights_phong_pars_fragment:Im,lights_physical_fragment:Pm,lights_physical_pars_fragment:Lm,lights_fragment_begin:Dm,lights_fragment_maps:Um,lights_fragment_end:Nm,lightprobes_pars_fragment:Fm,logdepthbuf_fragment:Bm,logdepthbuf_pars_fragment:Om,logdepthbuf_pars_vertex:zm,logdepthbuf_vertex:Hm,map_fragment:km,map_pars_fragment:Gm,map_particle_fragment:Vm,map_particle_pars_fragment:Wm,metalnessmap_fragment:Xm,metalnessmap_pars_fragment:qm,morphinstance_vertex:Ym,morphcolor_vertex:Zm,morphnormal_vertex:$m,morphtarget_pars_vertex:Jm,morphtarget_vertex:Km,normal_fragment_begin:Qm,normal_fragment_maps:jm,normal_pars_fragment:t0,normal_pars_vertex:e0,normal_vertex:n0,normalmap_pars_fragment:i0,clearcoat_normal_fragment_begin:s0,clearcoat_normal_fragment_maps:r0,clearcoat_pars_fragment:o0,iridescence_pars_fragment:a0,opaque_fragment:c0,packing:l0,premultiplied_alpha_fragment:h0,project_vertex:u0,dithering_fragment:d0,dithering_pars_fragment:f0,roughnessmap_fragment:p0,roughnessmap_pars_fragment:m0,shadowmap_pars_fragment:g0,shadowmap_pars_vertex:x0,shadowmap_vertex:_0,shadowmask_pars_fragment:y0,skinbase_vertex:v0,skinning_pars_vertex:M0,skinning_vertex:S0,skinnormal_vertex:b0,specularmap_fragment:E0,specularmap_pars_fragment:w0,tonemapping_fragment:T0,tonemapping_pars_fragment:A0,transmission_fragment:R0,transmission_pars_fragment:C0,uv_pars_fragment:I0,uv_pars_vertex:P0,uv_vertex:L0,worldpos_vertex:D0,background_vert:U0,background_frag:N0,backgroundCube_vert:F0,backgroundCube_frag:B0,cube_vert:O0,cube_frag:z0,depth_vert:H0,depth_frag:k0,distance_vert:G0,distance_frag:V0,equirect_vert:W0,equirect_frag:X0,linedashed_vert:q0,linedashed_frag:Y0,meshbasic_vert:Z0,meshbasic_frag:$0,meshlambert_vert:J0,meshlambert_frag:K0,meshmatcap_vert:Q0,meshmatcap_frag:j0,meshnormal_vert:tg,meshnormal_frag:eg,meshphong_vert:ng,meshphong_frag:ig,meshphysical_vert:sg,meshphysical_frag:rg,meshtoon_vert:og,meshtoon_frag:ag,points_vert:cg,points_frag:lg,shadow_vert:hg,shadow_frag:ug,sprite_vert:dg,sprite_frag:fg},At={common:{diffuse:{value:new Vt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new jt},alphaMap:{value:null},alphaMapTransform:{value:new jt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new jt}},envmap:{envMap:{value:null},envMapRotation:{value:new jt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new jt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new jt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new jt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new jt},normalScale:{value:new xt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new jt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new jt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new jt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new jt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Vt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new D},probesMax:{value:new D},probesResolution:{value:new D}},points:{diffuse:{value:new Vt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new jt},alphaTest:{value:0},uvTransform:{value:new jt}},sprite:{diffuse:{value:new Vt(16777215)},opacity:{value:1},center:{value:new xt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new jt},alphaMap:{value:null},alphaMapTransform:{value:new jt},alphaTest:{value:0}}},ii={basic:{uniforms:on([At.common,At.specularmap,At.envmap,At.aomap,At.lightmap,At.fog]),vertexShader:oe.meshbasic_vert,fragmentShader:oe.meshbasic_frag},lambert:{uniforms:on([At.common,At.specularmap,At.envmap,At.aomap,At.lightmap,At.emissivemap,At.bumpmap,At.normalmap,At.displacementmap,At.fog,At.lights,{emissive:{value:new Vt(0)},envMapIntensity:{value:1}}]),vertexShader:oe.meshlambert_vert,fragmentShader:oe.meshlambert_frag},phong:{uniforms:on([At.common,At.specularmap,At.envmap,At.aomap,At.lightmap,At.emissivemap,At.bumpmap,At.normalmap,At.displacementmap,At.fog,At.lights,{emissive:{value:new Vt(0)},specular:{value:new Vt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:oe.meshphong_vert,fragmentShader:oe.meshphong_frag},standard:{uniforms:on([At.common,At.envmap,At.aomap,At.lightmap,At.emissivemap,At.bumpmap,At.normalmap,At.displacementmap,At.roughnessmap,At.metalnessmap,At.fog,At.lights,{emissive:{value:new Vt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:oe.meshphysical_vert,fragmentShader:oe.meshphysical_frag},toon:{uniforms:on([At.common,At.aomap,At.lightmap,At.emissivemap,At.bumpmap,At.normalmap,At.displacementmap,At.gradientmap,At.fog,At.lights,{emissive:{value:new Vt(0)}}]),vertexShader:oe.meshtoon_vert,fragmentShader:oe.meshtoon_frag},matcap:{uniforms:on([At.common,At.bumpmap,At.normalmap,At.displacementmap,At.fog,{matcap:{value:null}}]),vertexShader:oe.meshmatcap_vert,fragmentShader:oe.meshmatcap_frag},points:{uniforms:on([At.points,At.fog]),vertexShader:oe.points_vert,fragmentShader:oe.points_frag},dashed:{uniforms:on([At.common,At.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:oe.linedashed_vert,fragmentShader:oe.linedashed_frag},depth:{uniforms:on([At.common,At.displacementmap]),vertexShader:oe.depth_vert,fragmentShader:oe.depth_frag},normal:{uniforms:on([At.common,At.bumpmap,At.normalmap,At.displacementmap,{opacity:{value:1}}]),vertexShader:oe.meshnormal_vert,fragmentShader:oe.meshnormal_frag},sprite:{uniforms:on([At.sprite,At.fog]),vertexShader:oe.sprite_vert,fragmentShader:oe.sprite_frag},background:{uniforms:{uvTransform:{value:new jt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:oe.background_vert,fragmentShader:oe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new jt}},vertexShader:oe.backgroundCube_vert,fragmentShader:oe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:oe.cube_vert,fragmentShader:oe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:oe.equirect_vert,fragmentShader:oe.equirect_frag},distance:{uniforms:on([At.common,At.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:oe.distance_vert,fragmentShader:oe.distance_frag},shadow:{uniforms:on([At.lights,At.fog,{color:{value:new Vt(0)},opacity:{value:1}}]),vertexShader:oe.shadow_vert,fragmentShader:oe.shadow_frag}};ii.physical={uniforms:on([ii.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new jt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new jt},clearcoatNormalScale:{value:new xt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new jt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new jt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new jt},sheen:{value:0},sheenColor:{value:new Vt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new jt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new jt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new jt},transmissionSamplerSize:{value:new xt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new jt},attenuationDistance:{value:0},attenuationColor:{value:new Vt(0)},specularColor:{value:new Vt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new jt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new jt},anisotropyVector:{value:new xt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new jt}}]),vertexShader:oe.meshphysical_vert,fragmentShader:oe.meshphysical_frag};var cc={r:0,b:0,g:0},pg=new ne,Sd=new jt;Sd.set(-1,0,0,0,1,0,0,0,1);function mg(i,t,e,n,s,r){let o=new Vt(0),a=s===!0?0:1,c,l,h=null,d=0,u=null;function f(M){let b=M.isScene===!0?M.background:null;if(b&&b.isTexture){let x=M.backgroundBlurriness>0;b=t.get(b,x)}return b}function g(M){let b=!1,x=f(M);x===null?p(o,a):x&&x.isColor&&(p(x,1),b=!0);let T=i.xr.getEnvironmentBlendMode();T==="additive"?e.buffers.color.setClear(0,0,0,1,r):T==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||b)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function y(M,b){let x=f(b);x&&(x.isCubeTexture||x.mapping===zr)?(l===void 0&&(l=new pt(new ut(1,1,1),new ln({name:"BackgroundCubeMaterial",uniforms:es(ii.backgroundCube.uniforms),vertexShader:ii.backgroundCube.vertexShader,fragmentShader:ii.backgroundCube.fragmentShader,side:Ke,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(T,S,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(l)),l.material.uniforms.envMap.value=x,l.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(pg.makeRotationFromEuler(b.backgroundRotation)).transpose(),x.isCubeTexture&&x.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Sd),l.material.toneMapped=he.getTransfer(x.colorSpace)!==de,(h!==x||d!==x.version||u!==i.toneMapping)&&(l.material.needsUpdate=!0,h=x,d=x.version,u=i.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null)):x&&x.isTexture&&(c===void 0&&(c=new pt(new be(2,2),new ln({name:"BackgroundMaterial",uniforms:es(ii.background.uniforms),vertexShader:ii.background.vertexShader,fragmentShader:ii.background.fragmentShader,side:fi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=x,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.toneMapped=he.getTransfer(x.colorSpace)!==de,x.matrixAutoUpdate===!0&&x.updateMatrix(),c.material.uniforms.uvTransform.value.copy(x.matrix),(h!==x||d!==x.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,h=x,d=x.version,u=i.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null))}function p(M,b){M.getRGB(cc,Gl(i)),e.buffers.color.setClear(cc.r,cc.g,cc.b,b,r)}function m(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(M,b=1){o.set(M),a=b,p(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(M){a=M,p(o,a)},render:g,addToRenderList:y,dispose:m}}function gg(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null),r=s,o=!1;function a(C,P,O,z,L){let N=!1,U=d(C,z,O,P);r!==U&&(r=U,l(r.object)),N=f(C,z,O,L),N&&g(C,z,O,L),L!==null&&t.update(L,i.ELEMENT_ARRAY_BUFFER),(N||o)&&(o=!1,x(C,P,O,z),L!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(L).buffer))}function c(){return i.createVertexArray()}function l(C){return i.bindVertexArray(C)}function h(C){return i.deleteVertexArray(C)}function d(C,P,O,z){let L=z.wireframe===!0,N=n[P.id];N===void 0&&(N={},n[P.id]=N);let U=C.isInstancedMesh===!0?C.id:0,G=N[U];G===void 0&&(G={},N[U]=G);let Z=G[O.id];Z===void 0&&(Z={},G[O.id]=Z);let q=Z[L];return q===void 0&&(q=u(c()),Z[L]=q),q}function u(C){let P=[],O=[],z=[];for(let L=0;L<e;L++)P[L]=0,O[L]=0,z[L]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:O,attributeDivisors:z,object:C,attributes:{},index:null}}function f(C,P,O,z){let L=r.attributes,N=P.attributes,U=0,G=O.getAttributes();for(let Z in G)if(G[Z].location>=0){let J=L[Z],K=N[Z];if(K===void 0&&(Z==="instanceMatrix"&&C.instanceMatrix&&(K=C.instanceMatrix),Z==="instanceColor"&&C.instanceColor&&(K=C.instanceColor)),J===void 0||J.attribute!==K||K&&J.data!==K.data)return!0;U++}return r.attributesNum!==U||r.index!==z}function g(C,P,O,z){let L={},N=P.attributes,U=0,G=O.getAttributes();for(let Z in G)if(G[Z].location>=0){let J=N[Z];J===void 0&&(Z==="instanceMatrix"&&C.instanceMatrix&&(J=C.instanceMatrix),Z==="instanceColor"&&C.instanceColor&&(J=C.instanceColor));let K={};K.attribute=J,J&&J.data&&(K.data=J.data),L[Z]=K,U++}r.attributes=L,r.attributesNum=U,r.index=z}function y(){let C=r.newAttributes;for(let P=0,O=C.length;P<O;P++)C[P]=0}function p(C){m(C,0)}function m(C,P){let O=r.newAttributes,z=r.enabledAttributes,L=r.attributeDivisors;O[C]=1,z[C]===0&&(i.enableVertexAttribArray(C),z[C]=1),L[C]!==P&&(i.vertexAttribDivisor(C,P),L[C]=P)}function M(){let C=r.newAttributes,P=r.enabledAttributes;for(let O=0,z=P.length;O<z;O++)P[O]!==C[O]&&(i.disableVertexAttribArray(O),P[O]=0)}function b(C,P,O,z,L,N,U){U===!0?i.vertexAttribIPointer(C,P,O,L,N):i.vertexAttribPointer(C,P,O,z,L,N)}function x(C,P,O,z){y();let L=z.attributes,N=O.getAttributes(),U=P.defaultAttributeValues;for(let G in N){let Z=N[G];if(Z.location>=0){let q=L[G];if(q===void 0&&(G==="instanceMatrix"&&C.instanceMatrix&&(q=C.instanceMatrix),G==="instanceColor"&&C.instanceColor&&(q=C.instanceColor)),q!==void 0){let J=q.normalized,K=q.itemSize,ct=t.get(q);if(ct===void 0)continue;let mt=ct.buffer,rt=ct.type,k=ct.bytesPerElement,nt=rt===i.INT||rt===i.UNSIGNED_INT||q.gpuType===ba;if(q.isInterleavedBufferAttribute){let tt=q.data,gt=tt.stride,yt=q.offset;if(tt.isInstancedInterleavedBuffer){for(let dt=0;dt<Z.locationSize;dt++)m(Z.location+dt,tt.meshPerAttribute);C.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=tt.meshPerAttribute*tt.count)}else for(let dt=0;dt<Z.locationSize;dt++)p(Z.location+dt);i.bindBuffer(i.ARRAY_BUFFER,mt);for(let dt=0;dt<Z.locationSize;dt++)b(Z.location+dt,K/Z.locationSize,rt,J,gt*k,(yt+K/Z.locationSize*dt)*k,nt)}else{if(q.isInstancedBufferAttribute){for(let tt=0;tt<Z.locationSize;tt++)m(Z.location+tt,q.meshPerAttribute);C.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=q.meshPerAttribute*q.count)}else for(let tt=0;tt<Z.locationSize;tt++)p(Z.location+tt);i.bindBuffer(i.ARRAY_BUFFER,mt);for(let tt=0;tt<Z.locationSize;tt++)b(Z.location+tt,K/Z.locationSize,rt,J,K*k,K/Z.locationSize*tt*k,nt)}}else if(U!==void 0){let J=U[G];if(J!==void 0)switch(J.length){case 2:i.vertexAttrib2fv(Z.location,J);break;case 3:i.vertexAttrib3fv(Z.location,J);break;case 4:i.vertexAttrib4fv(Z.location,J);break;default:i.vertexAttrib1fv(Z.location,J)}}}}M()}function T(){E();for(let C in n){let P=n[C];for(let O in P){let z=P[O];for(let L in z){let N=z[L];for(let U in N)h(N[U].object),delete N[U];delete z[L]}}delete n[C]}}function S(C){if(n[C.id]===void 0)return;let P=n[C.id];for(let O in P){let z=P[O];for(let L in z){let N=z[L];for(let U in N)h(N[U].object),delete N[U];delete z[L]}}delete n[C.id]}function R(C){for(let P in n){let O=n[P];for(let z in O){let L=O[z];if(L[C.id]===void 0)continue;let N=L[C.id];for(let U in N)h(N[U].object),delete N[U];delete L[C.id]}}}function _(C){for(let P in n){let O=n[P],z=C.isInstancedMesh===!0?C.id:0,L=O[z];if(L!==void 0){for(let N in L){let U=L[N];for(let G in U)h(U[G].object),delete U[G];delete L[N]}delete O[z],Object.keys(O).length===0&&delete n[P]}}}function E(){w(),o=!0,r!==s&&(r=s,l(r.object))}function w(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:E,resetDefaultState:w,dispose:T,releaseStatesOfGeometry:S,releaseStatesOfObject:_,releaseStatesOfProgram:R,initAttributes:y,enableAttribute:p,disableUnusedAttributes:M}}function xg(i,t,e){let n;function s(c){n=c}function r(c,l){i.drawArrays(n,c,l),e.update(l,n,1)}function o(c,l,h){h!==0&&(i.drawArraysInstanced(n,c,l,h),e.update(l,n,h))}function a(c,l,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,l,0,h);let u=0;for(let f=0;f<h;f++)u+=l[f];e.update(u,n,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function _g(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let R=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(R){return!(R!==Pn&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(R){let _=R===ei&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(R!==pn&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&R!==In&&!_)}function c(R){if(R==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=e.precision!==void 0?e.precision:"highp",h=c(l);h!==l&&(Jt("WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);let d=e.logarithmicDepthBuffer===!0,u=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&u===!1&&Jt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=i.getParameter(i.MAX_TEXTURE_SIZE),p=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),b=i.getParameter(i.MAX_VARYING_VECTORS),x=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),T=i.getParameter(i.MAX_SAMPLES),S=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:g,maxTextureSize:y,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:M,maxVaryings:b,maxFragmentUniforms:x,maxSamples:T,samples:S}}function yg(i){let t=this,e=null,n=0,s=!1,r=!1,o=new Zn,a=new jt,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){let f=d.length!==0||u||n!==0||s;return s=u,n=d.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,u){e=h(d,u,0)},this.setState=function(d,u,f){let g=d.clippingPlanes,y=d.clipIntersection,p=d.clipShadows,m=i.get(d);if(!s||g===null||g.length===0||r&&!p)r?h(null):l();else{let M=r?0:n,b=M*4,x=m.clippingState||null;c.value=x,x=h(g,u,b,f);for(let T=0;T!==b;++T)x[T]=e[T];m.clippingState=x,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=M}};function l(){c.value!==e&&(c.value=e,c.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(d,u,f,g){let y=d!==null?d.length:0,p=null;if(y!==0){if(p=c.value,g!==!0||p===null){let m=f+y*4,M=u.matrixWorldInverse;a.getNormalMatrix(M),(p===null||p.length<m)&&(p=new Float32Array(m));for(let b=0,x=f;b!==y;++b,x+=4)o.copy(d[b]).applyMatrix4(M,a),o.normal.toArray(p,x),p[x+3]=o.constant}c.value=p,c.needsUpdate=!0}return t.numPlanes=y,t.numIntersection=0,p}}var Hi=4,ju=[.125,.215,.35,.446,.526,.582],ns=20,vg=256,Zr=new Fi,td=new Vt,ql=null,Yl=0,Zl=0,$l=!1,Mg=new D,hc=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){let{size:o=256,position:a=Mg}=r;ql=this._renderer.getRenderTarget(),Yl=this._renderer.getActiveCubeFace(),Zl=this._renderer.getActiveMipmapLevel(),$l=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(t,n,s,c,a),e>0&&this._blur(c,0,0,e),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=id(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=nd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(ql,Yl,Zl),this._renderer.xr.enabled=$l,t.scissorTest=!1,ks(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Bi||t.mapping===ts?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),ql=this._renderer.getRenderTarget(),Yl=this._renderer.getActiveCubeFace(),Zl=this._renderer.getActiveMipmapLevel(),$l=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Je,minFilter:Je,generateMipmaps:!1,type:ei,format:Pn,colorSpace:ar,depthBuffer:!1},s=ed(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ed(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=Sg(r)),this._blurMaterial=Eg(r,t,e),this._ggxMaterial=bg(r,t,e)}return s}_compileMaterial(t){let e=new pt(new Oe,t);this._renderer.compile(e,Zr)}_sceneToCubeUV(t,e,n,s,r){let c=new sn(90,1,e,n),l=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,f=d.toneMapping;d.getClearColor(td),d.toneMapping=Hn,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new pt(new ut,new Cn({name:"PMREM.Background",side:Ke,depthWrite:!1,depthTest:!1})));let y=this._backgroundBox,p=y.material,m=!1,M=t.background;M?M.isColor&&(p.color.copy(M),t.background=null,m=!0):(p.color.copy(td),m=!0);for(let b=0;b<6;b++){let x=b%3;x===0?(c.up.set(0,l[b],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+h[b],r.y,r.z)):x===1?(c.up.set(0,0,l[b]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+h[b],r.z)):(c.up.set(0,l[b],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+h[b]));let T=this._cubeSize;ks(s,x*T,b>2?T:0,T,T),d.setRenderTarget(s),m&&d.render(y,c),d.render(t,c)}d.toneMapping=f,d.autoClear=u,t.background=M}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===Bi||t.mapping===ts;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=id()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=nd());let r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=t;let c=this._cubeSize;ks(e,0,0,3*c,2*c),n.setRenderTarget(e),n.render(o,Zr)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;let c=o.uniforms,l=n/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),d=Math.sqrt(l*l-h*h),u=0+l*1.25,f=d*u,{_lodMax:g}=this,y=this._sizeLods[n],p=3*y*(n>g-Hi?n-g+Hi:0),m=4*(this._cubeSize-y);c.envMap.value=t.texture,c.roughness.value=f,c.mipInt.value=g-e,ks(r,p,m,3*y,2*y),s.setRenderTarget(r),s.render(a,Zr),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=g-n,ks(t,p,m,3*y,2*y),s.setRenderTarget(t),s.render(a,Zr)}_blur(t,e,n,s,r){let o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,s,"latitudinal",r),this._halfBlur(o,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,o,a){let c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&$t("blur direction must be either latitudinal or longitudinal!");let h=3,d=this._lodMeshes[s];d.material=l;let u=l.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*ns-1),y=r/g,p=isFinite(r)?1+Math.floor(h*y):ns;p>ns&&Jt(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${ns}`);let m=[],M=0;for(let R=0;R<ns;++R){let _=R/y,E=Math.exp(-_*_/2);m.push(E),R===0?M+=E:R<p&&(M+=2*E)}for(let R=0;R<m.length;R++)m[R]=m[R]/M;u.envMap.value=t.texture,u.samples.value=p,u.weights.value=m,u.latitudinal.value=o==="latitudinal",a&&(u.poleAxis.value=a);let{_lodMax:b}=this;u.dTheta.value=g,u.mipInt.value=b-n;let x=this._sizeLods[s],T=3*x*(s>b-Hi?s-b+Hi:0),S=4*(this._cubeSize-x);ks(e,T,S,3*x,2*x),c.setRenderTarget(e),c.render(d,Zr)}};function Sg(i){let t=[],e=[],n=[],s=i,r=i-Hi+1+ju.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);t.push(a);let c=1/a;o>i-Hi?c=ju[o-i+Hi-1]:o===0&&(c=0),e.push(c);let l=1/(a-2),h=-l,d=1+l,u=[h,h,d,h,d,d,h,h,d,d,h,d],f=6,g=6,y=3,p=2,m=1,M=new Float32Array(y*g*f),b=new Float32Array(p*g*f),x=new Float32Array(m*g*f);for(let S=0;S<f;S++){let R=S%3*2/3-1,_=S>2?0:-1,E=[R,_,0,R+2/3,_,0,R+2/3,_+1,0,R,_,0,R+2/3,_+1,0,R,_+1,0];M.set(E,y*g*S),b.set(u,p*g*S);let w=[S,S,S,S,S,S];x.set(w,m*g*S)}let T=new Oe;T.setAttribute("position",new fn(M,y)),T.setAttribute("uv",new fn(b,p)),T.setAttribute("faceIndex",new fn(x,m)),n.push(new pt(T,null)),s>Hi&&s--}return{lodMeshes:n,sizeLods:t,sigmas:e}}function ed(i,t,e){let n=new yn(i,t,e);return n.texture.mapping=zr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ks(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function bg(i,t,e){return new ln({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:vg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:dc(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:jn,depthTest:!1,depthWrite:!1})}function Eg(i,t,e){let n=new Float32Array(ns),s=new D(0,1,0);return new ln({name:"SphericalGaussianBlur",defines:{n:ns,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:dc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:jn,depthTest:!1,depthWrite:!1})}function nd(){return new ln({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:dc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:jn,depthTest:!1,depthWrite:!1})}function id(){return new ln({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:dc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:jn,depthTest:!1,depthWrite:!1})}function dc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}var Vs=class extends yn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new _r(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new ut(5,5,5),r=new ln({name:"CubemapFromEquirect",uniforms:es(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ke,blending:jn});r.uniforms.tEquirect.value=e;let o=new pt(s,r),a=e.minFilter;return e.minFilter===ti&&(e.minFilter=Je),new Fs(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}};function wg(i){let t=new WeakMap,e=new WeakMap,n=null;function s(u,f=!1){return u==null?null:f?o(u):r(u)}function r(u){if(u&&u.isTexture){let f=u.mapping;if(f===va||f===Ma)if(t.has(u)){let g=t.get(u).texture;return a(g,u.mapping)}else{let g=u.image;if(g&&g.height>0){let y=new Vs(g.height);return y.fromEquirectangularTexture(i,u),t.set(u,y),u.addEventListener("dispose",l),a(y.texture,u.mapping)}else return null}}return u}function o(u){if(u&&u.isTexture){let f=u.mapping,g=f===va||f===Ma,y=f===Bi||f===ts;if(g||y){let p=e.get(u),m=p!==void 0?p.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==m)return n===null&&(n=new hc(i)),p=g?n.fromEquirectangular(u,p):n.fromCubemap(u,p),p.texture.pmremVersion=u.pmremVersion,e.set(u,p),p.texture;if(p!==void 0)return p.texture;{let M=u.image;return g&&M&&M.height>0||y&&M&&c(M)?(n===null&&(n=new hc(i)),p=g?n.fromEquirectangular(u):n.fromCubemap(u),p.texture.pmremVersion=u.pmremVersion,e.set(u,p),u.addEventListener("dispose",h),p.texture):null}}}return u}function a(u,f){return f===va?u.mapping=Bi:f===Ma&&(u.mapping=ts),u}function c(u){let f=0,g=6;for(let y=0;y<g;y++)u[y]!==void 0&&f++;return f===g}function l(u){let f=u.target;f.removeEventListener("dispose",l);let g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function h(u){let f=u.target;f.removeEventListener("dispose",h);let g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function d(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:d}}function Tg(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&Ji("WebGLRenderer: "+n+" extension not supported."),s}}}function Ag(i,t,e,n){let s={},r=new WeakMap;function o(d){let u=d.target;u.index!==null&&t.remove(u.index);for(let g in u.attributes)t.remove(u.attributes[g]);u.removeEventListener("dispose",o),delete s[u.id];let f=r.get(u);f&&(t.remove(f),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function a(d,u){return s[u.id]===!0||(u.addEventListener("dispose",o),s[u.id]=!0,e.memory.geometries++),u}function c(d){let u=d.attributes;for(let f in u)t.update(u[f],i.ARRAY_BUFFER)}function l(d){let u=[],f=d.index,g=d.attributes.position,y=0;if(g===void 0)return;if(f!==null){let M=f.array;y=f.version;for(let b=0,x=M.length;b<x;b+=3){let T=M[b+0],S=M[b+1],R=M[b+2];u.push(T,S,S,R,R,T)}}else{let M=g.array;y=g.version;for(let b=0,x=M.length/3-1;b<x;b+=3){let T=b+0,S=b+1,R=b+2;u.push(T,S,S,R,R,T)}}let p=new(g.count>=65535?pr:fr)(u,1);p.version=y;let m=r.get(d);m&&t.remove(m),r.set(d,p)}function h(d){let u=r.get(d);if(u){let f=d.index;f!==null&&u.version<f.version&&l(d)}else l(d);return r.get(d)}return{get:a,update:c,getWireframeAttribute:h}}function Rg(i,t,e){let n;function s(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function c(d,u){i.drawElements(n,u,r,d*o),e.update(u,n,1)}function l(d,u,f){f!==0&&(i.drawElementsInstanced(n,u,r,d*o,f),e.update(u,n,f))}function h(d,u,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,r,d,0,f);let y=0;for(let p=0;p<f;p++)y+=u[p];e.update(y,n,1)}this.setMode=s,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=h}function Cg(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:$t("WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Ig(i,t,e){let n=new WeakMap,s=new we;function r(o,a,c){let l=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=h!==void 0?h.length:0,u=n.get(a);if(u===void 0||u.count!==d){let E=function(){R.dispose(),n.delete(a),a.removeEventListener("dispose",E)};u!==void 0&&u.texture.dispose();let f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,y=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],M=a.morphAttributes.color||[],b=0;f===!0&&(b=1),g===!0&&(b=2),y===!0&&(b=3);let x=a.attributes.position.count*b,T=1;x>t.maxTextureSize&&(T=Math.ceil(x/t.maxTextureSize),x=t.maxTextureSize);let S=new Float32Array(x*T*4*d),R=new hr(S,x,T,d);R.type=In,R.needsUpdate=!0;let _=b*4;for(let w=0;w<d;w++){let C=p[w],P=m[w],O=M[w],z=x*T*4*w;for(let L=0;L<C.count;L++){let N=L*_;f===!0&&(s.fromBufferAttribute(C,L),S[z+N+0]=s.x,S[z+N+1]=s.y,S[z+N+2]=s.z,S[z+N+3]=0),g===!0&&(s.fromBufferAttribute(P,L),S[z+N+4]=s.x,S[z+N+5]=s.y,S[z+N+6]=s.z,S[z+N+7]=0),y===!0&&(s.fromBufferAttribute(O,L),S[z+N+8]=s.x,S[z+N+9]=s.y,S[z+N+10]=s.z,S[z+N+11]=O.itemSize===4?s.w:1)}}u={count:d,texture:R,size:new xt(x,T)},n.set(a,u),a.addEventListener("dispose",E)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let f=0;for(let y=0;y<l.length;y++)f+=l[y];let g=a.morphTargetsRelative?1:1-f;c.getUniforms().setValue(i,"morphTargetBaseInfluence",g),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",u.texture,e),c.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:r}}function Pg(i,t,e,n,s){let r=new WeakMap;function o(l){let h=s.render.frame,d=l.geometry,u=t.get(l,d);if(r.get(u)!==h&&(t.update(u),r.set(u,h)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==h&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,h))),l.isSkinnedMesh){let f=l.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return u}function a(){r=new WeakMap}function c(l){let h=l.target;h.removeEventListener("dispose",c),n.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:o,dispose:a}}var Lg={[Tl]:"LINEAR_TONE_MAPPING",[Al]:"REINHARD_TONE_MAPPING",[Rl]:"CINEON_TONE_MAPPING",[Or]:"ACES_FILMIC_TONE_MAPPING",[Il]:"AGX_TONE_MAPPING",[Pl]:"NEUTRAL_TONE_MAPPING",[Cl]:"CUSTOM_TONE_MAPPING"};function Dg(i,t,e,n,s,r){let o=new yn(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,depthTexture:s?new mi(t,e):void 0}),a=new yn(t,e,{type:ei,depthBuffer:!1,stencilBuffer:!1}),c=new Oe;c.setAttribute("position",new re([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new re([0,2,0,0,2,0],2));let l=new sa({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),h=new pt(c,l),d=new Fi(-1,1,1,-1,0,1),u=null,f=null,g=!1,y,p=null,m=[],M=!1;this.setSize=function(b,x){o.setSize(b,x),a.setSize(b,x);for(let T=0;T<m.length;T++){let S=m[T];S.setSize&&S.setSize(b,x)}},this.setEffects=function(b){m=b,M=m.length>0&&m[0].isRenderPass===!0;let x=o.width,T=o.height;for(let S=0;S<m.length;S++){let R=m[S];R.setSize&&R.setSize(x,T)}},this.begin=function(b,x){if(g||b.toneMapping===Hn&&m.length===0)return!1;if(p=x,x!==null){let T=x.width,S=x.height;(o.width!==T||o.height!==S)&&this.setSize(T,S)}return M===!1&&b.setRenderTarget(o),y=b.toneMapping,b.toneMapping=Hn,!0},this.hasRenderPass=function(){return M},this.end=function(b,x){b.toneMapping=y,g=!0;let T=o,S=a;for(let R=0;R<m.length;R++){let _=m[R];if(_.enabled!==!1&&(_.render(b,S,T,x),_.needsSwap!==!1)){let E=T;T=S,S=E}}if(u!==b.outputColorSpace||f!==b.toneMapping){u=b.outputColorSpace,f=b.toneMapping,l.defines={},he.getTransfer(u)===de&&(l.defines.SRGB_TRANSFER="");let R=Lg[f];R&&(l.defines[R]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=T.texture,b.setRenderTarget(p),b.render(h,d),p=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){o.depthTexture&&o.depthTexture.dispose(),o.dispose(),a.dispose(),c.dispose(),l.dispose()}}var bd=new cn,Ql=new mi(1,1),Ed=new hr,wd=new $o,Td=new _r,sd=[],rd=[],od=new Float32Array(16),ad=new Float32Array(9),cd=new Float32Array(4);function Ws(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=sd[s];if(r===void 0&&(r=new Float32Array(s),sd[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function Ge(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Ve(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function fc(i,t){let e=rd[t];e===void 0&&(e=new Int32Array(t),rd[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Ug(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Ng(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ge(e,t))return;i.uniform2fv(this.addr,t),Ve(e,t)}}function Fg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ge(e,t))return;i.uniform3fv(this.addr,t),Ve(e,t)}}function Bg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ge(e,t))return;i.uniform4fv(this.addr,t),Ve(e,t)}}function Og(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ge(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Ve(e,t)}else{if(Ge(e,n))return;cd.set(n),i.uniformMatrix2fv(this.addr,!1,cd),Ve(e,n)}}function zg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ge(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Ve(e,t)}else{if(Ge(e,n))return;ad.set(n),i.uniformMatrix3fv(this.addr,!1,ad),Ve(e,n)}}function Hg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ge(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Ve(e,t)}else{if(Ge(e,n))return;od.set(n),i.uniformMatrix4fv(this.addr,!1,od),Ve(e,n)}}function kg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Gg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ge(e,t))return;i.uniform2iv(this.addr,t),Ve(e,t)}}function Vg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ge(e,t))return;i.uniform3iv(this.addr,t),Ve(e,t)}}function Wg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ge(e,t))return;i.uniform4iv(this.addr,t),Ve(e,t)}}function Xg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function qg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ge(e,t))return;i.uniform2uiv(this.addr,t),Ve(e,t)}}function Yg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ge(e,t))return;i.uniform3uiv(this.addr,t),Ve(e,t)}}function Zg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ge(e,t))return;i.uniform4uiv(this.addr,t),Ve(e,t)}}function $g(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Ql.compareFunction=e.isReversedDepthBuffer()?ac:oc,r=Ql):r=bd,e.setTexture2D(t||r,s)}function Jg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||wd,s)}function Kg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Td,s)}function Qg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Ed,s)}function jg(i){switch(i){case 5126:return Ug;case 35664:return Ng;case 35665:return Fg;case 35666:return Bg;case 35674:return Og;case 35675:return zg;case 35676:return Hg;case 5124:case 35670:return kg;case 35667:case 35671:return Gg;case 35668:case 35672:return Vg;case 35669:case 35673:return Wg;case 5125:return Xg;case 36294:return qg;case 36295:return Yg;case 36296:return Zg;case 35678:case 36198:case 36298:case 36306:case 35682:return $g;case 35679:case 36299:case 36307:return Jg;case 35680:case 36300:case 36308:case 36293:return Kg;case 36289:case 36303:case 36311:case 36292:return Qg}}function tx(i,t){i.uniform1fv(this.addr,t)}function ex(i,t){let e=Ws(t,this.size,2);i.uniform2fv(this.addr,e)}function nx(i,t){let e=Ws(t,this.size,3);i.uniform3fv(this.addr,e)}function ix(i,t){let e=Ws(t,this.size,4);i.uniform4fv(this.addr,e)}function sx(i,t){let e=Ws(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function rx(i,t){let e=Ws(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function ox(i,t){let e=Ws(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function ax(i,t){i.uniform1iv(this.addr,t)}function cx(i,t){i.uniform2iv(this.addr,t)}function lx(i,t){i.uniform3iv(this.addr,t)}function hx(i,t){i.uniform4iv(this.addr,t)}function ux(i,t){i.uniform1uiv(this.addr,t)}function dx(i,t){i.uniform2uiv(this.addr,t)}function fx(i,t){i.uniform3uiv(this.addr,t)}function px(i,t){i.uniform4uiv(this.addr,t)}function mx(i,t,e){let n=this.cache,s=t.length,r=fc(e,s);Ge(n,r)||(i.uniform1iv(this.addr,r),Ve(n,r));let o;this.type===i.SAMPLER_2D_SHADOW?o=Ql:o=bd;for(let a=0;a!==s;++a)e.setTexture2D(t[a]||o,r[a])}function gx(i,t,e){let n=this.cache,s=t.length,r=fc(e,s);Ge(n,r)||(i.uniform1iv(this.addr,r),Ve(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||wd,r[o])}function xx(i,t,e){let n=this.cache,s=t.length,r=fc(e,s);Ge(n,r)||(i.uniform1iv(this.addr,r),Ve(n,r));for(let o=0;o!==s;++o)e.setTextureCube(t[o]||Td,r[o])}function _x(i,t,e){let n=this.cache,s=t.length,r=fc(e,s);Ge(n,r)||(i.uniform1iv(this.addr,r),Ve(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||Ed,r[o])}function yx(i){switch(i){case 5126:return tx;case 35664:return ex;case 35665:return nx;case 35666:return ix;case 35674:return sx;case 35675:return rx;case 35676:return ox;case 5124:case 35670:return ax;case 35667:case 35671:return cx;case 35668:case 35672:return lx;case 35669:case 35673:return hx;case 5125:return ux;case 36294:return dx;case 36295:return fx;case 36296:return px;case 35678:case 36198:case 36298:case 36306:case 35682:return mx;case 35679:case 36299:case 36307:return gx;case 35680:case 36300:case 36308:case 36293:return xx;case 36289:case 36303:case 36311:case 36292:return _x}}var jl=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=jg(e.type)}},th=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=yx(e.type)}},eh=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(t,e[a.id],n)}}},Jl=/(\w+)(\])?(\[|\.)?/g;function ld(i,t){i.seq.push(t),i.map[t.id]=t}function vx(i,t,e){let n=i.name,s=n.length;for(Jl.lastIndex=0;;){let r=Jl.exec(n),o=Jl.lastIndex,a=r[1],c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===s){ld(e,l===void 0?new jl(a,i,t):new th(a,i,t));break}else{let d=e.map[a];d===void 0&&(d=new eh(a),ld(e,d)),e=d}}}var Gs=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=t.getActiveUniform(e,o),c=t.getUniformLocation(e,a.name);vx(a,c,this)}let s=[],r=[];for(let o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){let a=e[r],c=n[a.id];c.needsUpdate!==!1&&a.setValue(t,c.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let o=t[s];o.id in e&&n.push(o)}return n}};function hd(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var Mx=37297,Sx=0;function bx(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}var ud=new jt;function Ex(i){he._getMatrix(ud,he.workingColorSpace,i);let t=`mat3( ${ud.elements.map(e=>e.toFixed(4))} )`;switch(he.getTransfer(i)){case cr:return[t,"LinearTransferOETF"];case de:return[t,"sRGBTransferOETF"];default:return Jt("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function dd(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return e.toUpperCase()+`

`+r+`

`+bx(i.getShaderSource(t),a)}else return r}function wx(i,t){let e=Ex(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var Tx={[Tl]:"Linear",[Al]:"Reinhard",[Rl]:"Cineon",[Or]:"ACESFilmic",[Il]:"AgX",[Pl]:"Neutral",[Cl]:"Custom"};function Ax(i,t){let e=Tx[t];return e===void 0?(Jt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var lc=new D;function Rx(){he.getLuminanceCoefficients(lc);let i=lc.x.toFixed(4),t=lc.y.toFixed(4),e=lc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Cx(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Jr).join(`
`)}function Ix(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Px(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function Jr(i){return i!==""}function fd(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function pd(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Lx=/^[ \t]*#include +<([\w\d./]+)>/gm;function nh(i){return i.replace(Lx,Ux)}var Dx=new Map;function Ux(i,t){let e=oe[t];if(e===void 0){let n=Dx.get(t);if(n!==void 0)e=oe[n],Jt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return nh(e)}var Nx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function md(i){return i.replace(Nx,Fx)}function Fx(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function gd(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var Bx={[Fr]:"SHADOWMAP_TYPE_PCF",[Bs]:"SHADOWMAP_TYPE_VSM"};function Ox(i){return Bx[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var zx={[Bi]:"ENVMAP_TYPE_CUBE",[ts]:"ENVMAP_TYPE_CUBE",[zr]:"ENVMAP_TYPE_CUBE_UV"};function Hx(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":zx[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var kx={[ts]:"ENVMAP_MODE_REFRACTION"};function Gx(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":kx[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Vx={[ya]:"ENVMAP_BLENDING_MULTIPLY",[Pu]:"ENVMAP_BLENDING_MIX",[Lu]:"ENVMAP_BLENDING_ADD"};function Wx(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":Vx[i.combine]||"ENVMAP_BLENDING_NONE"}function Xx(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function qx(i,t,e,n){let s=i.getContext(),r=e.defines,o=e.vertexShader,a=e.fragmentShader,c=Ox(e),l=Hx(e),h=Gx(e),d=Wx(e),u=Xx(e),f=Cx(e),g=Ix(r),y=s.createProgram(),p,m,M=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Jr).join(`
`),p.length>0&&(p+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Jr).join(`
`),m.length>0&&(m+=`
`)):(p=[gd(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Jr).join(`
`),m=[gd(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.envMap?"#define "+h:"",e.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Hn?"#define TONE_MAPPING":"",e.toneMapping!==Hn?oe.tonemapping_pars_fragment:"",e.toneMapping!==Hn?Ax("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",oe.colorspace_pars_fragment,wx("linearToOutputTexel",e.outputColorSpace),Rx(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Jr).join(`
`)),o=nh(o),o=fd(o,e),o=pd(o,e),a=nh(a),a=fd(a,e),a=pd(a,e),o=md(o),a=md(a),e.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,p=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,m=["#define varying in",e.glslVersion===zl?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===zl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let b=M+p+o,x=M+m+a,T=hd(s,s.VERTEX_SHADER,b),S=hd(s,s.FRAGMENT_SHADER,x);s.attachShader(y,T),s.attachShader(y,S),e.index0AttributeName!==void 0?s.bindAttribLocation(y,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(y,0,"position"),s.linkProgram(y);function R(C){if(i.debug.checkShaderErrors){let P=s.getProgramInfoLog(y)||"",O=s.getShaderInfoLog(T)||"",z=s.getShaderInfoLog(S)||"",L=P.trim(),N=O.trim(),U=z.trim(),G=!0,Z=!0;if(s.getProgramParameter(y,s.LINK_STATUS)===!1)if(G=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,y,T,S);else{let q=dd(s,T,"vertex"),J=dd(s,S,"fragment");$t("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(y,s.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+L+`
`+q+`
`+J)}else L!==""?Jt("WebGLProgram: Program Info Log:",L):(N===""||U==="")&&(Z=!1);Z&&(C.diagnostics={runnable:G,programLog:L,vertexShader:{log:N,prefix:p},fragmentShader:{log:U,prefix:m}})}s.deleteShader(T),s.deleteShader(S),_=new Gs(s,y),E=Px(s,y)}let _;this.getUniforms=function(){return _===void 0&&R(this),_};let E;this.getAttributes=function(){return E===void 0&&R(this),E};let w=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return w===!1&&(w=s.getProgramParameter(y,Mx)),w},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(y),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Sx++,this.cacheKey=t,this.usedTimes=1,this.program=y,this.vertexShader=T,this.fragmentShader=S,this}var Yx=0,ih=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new sh(t),e.set(t,n)),n}},sh=class{constructor(t){this.id=Yx++,this.code=t,this.usedTimes=0}};function Zx(i){return i===zi||i===Xr||i===qr}function $x(i,t,e,n,s,r){let o=new Cs,a=new ih,c=new Set,l=[],h=new Map,d=n.logarithmicDepthBuffer,u=n.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(_){return c.add(_),_===0?"uv":`uv${_}`}function y(_,E,w,C,P,O){let z=C.fog,L=P.geometry,N=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?C.environment:null,U=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,G=t.get(_.envMap||N,U),Z=G&&G.mapping===zr?G.image.height:null,q=f[_.type];_.precision!==null&&(u=n.getMaxPrecision(_.precision),u!==_.precision&&Jt("WebGLProgram.getParameters:",_.precision,"not supported, using",u,"instead."));let J=L.morphAttributes.position||L.morphAttributes.normal||L.morphAttributes.color,K=J!==void 0?J.length:0,ct=0;L.morphAttributes.position!==void 0&&(ct=1),L.morphAttributes.normal!==void 0&&(ct=2),L.morphAttributes.color!==void 0&&(ct=3);let mt,rt,k,nt;if(q){let Bt=ii[q];mt=Bt.vertexShader,rt=Bt.fragmentShader}else{mt=_.vertexShader,rt=_.fragmentShader;let Bt=a.getVertexShaderStage(_),Pe=a.getFragmentShaderStage(_);a.update(_,Bt,Pe),k=Bt.id,nt=Pe.id}let tt=i.getRenderTarget(),gt=i.state.buffers.depth.getReversed(),yt=P.isInstancedMesh===!0,dt=P.isBatchedMesh===!0,Yt=!!_.map,Nt=!!_.matcap,et=!!G,ot=!!_.aoMap,lt=!!_.lightMap,St=!!_.bumpMap&&_.wireframe===!1,Mt=!!_.normalMap,Zt=!!_.displacementMap,Ht=!!_.emissiveMap,Qt=!!_.metalnessMap,ee=!!_.roughnessMap,F=_.anisotropy>0,pe=_.clearcoat>0,ce=_.dispersion>0,I=_.iridescence>0,v=_.sheen>0,V=_.transmission>0,Y=F&&!!_.anisotropyMap,Q=pe&&!!_.clearcoatMap,ft=pe&&!!_.clearcoatNormalMap,_t=pe&&!!_.clearcoatRoughnessMap,j=I&&!!_.iridescenceMap,st=I&&!!_.iridescenceThicknessMap,bt=v&&!!_.sheenColorMap,kt=v&&!!_.sheenRoughnessMap,Tt=!!_.specularMap,Et=!!_.specularColorMap,Xt=!!_.specularIntensityMap,Kt=V&&!!_.transmissionMap,ie=V&&!!_.thicknessMap,B=!!_.gradientMap,vt=!!_.alphaMap,it=_.alphaTest>0,wt=!!_.alphaHash,Pt=!!_.extensions,ht=Hn;_.toneMapped&&(tt===null||tt.isXRRenderTarget===!0)&&(ht=i.toneMapping);let zt={shaderID:q,shaderType:_.type,shaderName:_.name,vertexShader:mt,fragmentShader:rt,defines:_.defines,customVertexShaderID:k,customFragmentShaderID:nt,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:u,batching:dt,batchingColor:dt&&P._colorsTexture!==null,instancing:yt,instancingColor:yt&&P.instanceColor!==null,instancingMorph:yt&&P.morphTexture!==null,outputColorSpace:tt===null?i.outputColorSpace:tt.isXRRenderTarget===!0?tt.texture.colorSpace:he.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:Yt,matcap:Nt,envMap:et,envMapMode:et&&G.mapping,envMapCubeUVHeight:Z,aoMap:ot,lightMap:lt,bumpMap:St,normalMap:Mt,displacementMap:Zt,emissiveMap:Ht,normalMapObjectSpace:Mt&&_.normalMapType===Nu,normalMapTangentSpace:Mt&&_.normalMapType===Yr,packedNormalMap:Mt&&_.normalMapType===Yr&&Zx(_.normalMap.format),metalnessMap:Qt,roughnessMap:ee,anisotropy:F,anisotropyMap:Y,clearcoat:pe,clearcoatMap:Q,clearcoatNormalMap:ft,clearcoatRoughnessMap:_t,dispersion:ce,iridescence:I,iridescenceMap:j,iridescenceThicknessMap:st,sheen:v,sheenColorMap:bt,sheenRoughnessMap:kt,specularMap:Tt,specularColorMap:Et,specularIntensityMap:Xt,transmission:V,transmissionMap:Kt,thicknessMap:ie,gradientMap:B,opaque:_.transparent===!1&&_.blending===Ki&&_.alphaToCoverage===!1,alphaMap:vt,alphaTest:it,alphaHash:wt,combine:_.combine,mapUv:Yt&&g(_.map.channel),aoMapUv:ot&&g(_.aoMap.channel),lightMapUv:lt&&g(_.lightMap.channel),bumpMapUv:St&&g(_.bumpMap.channel),normalMapUv:Mt&&g(_.normalMap.channel),displacementMapUv:Zt&&g(_.displacementMap.channel),emissiveMapUv:Ht&&g(_.emissiveMap.channel),metalnessMapUv:Qt&&g(_.metalnessMap.channel),roughnessMapUv:ee&&g(_.roughnessMap.channel),anisotropyMapUv:Y&&g(_.anisotropyMap.channel),clearcoatMapUv:Q&&g(_.clearcoatMap.channel),clearcoatNormalMapUv:ft&&g(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:_t&&g(_.clearcoatRoughnessMap.channel),iridescenceMapUv:j&&g(_.iridescenceMap.channel),iridescenceThicknessMapUv:st&&g(_.iridescenceThicknessMap.channel),sheenColorMapUv:bt&&g(_.sheenColorMap.channel),sheenRoughnessMapUv:kt&&g(_.sheenRoughnessMap.channel),specularMapUv:Tt&&g(_.specularMap.channel),specularColorMapUv:Et&&g(_.specularColorMap.channel),specularIntensityMapUv:Xt&&g(_.specularIntensityMap.channel),transmissionMapUv:Kt&&g(_.transmissionMap.channel),thicknessMapUv:ie&&g(_.thicknessMap.channel),alphaMapUv:vt&&g(_.alphaMap.channel),vertexTangents:!!L.attributes.tangent&&(Mt||F),vertexNormals:!!L.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!L.attributes.color&&L.attributes.color.itemSize===4,pointsUvs:P.isPoints===!0&&!!L.attributes.uv&&(Yt||vt),fog:!!z,useFog:_.fog===!0,fogExp2:!!z&&z.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||L.attributes.normal===void 0&&Mt===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:gt,skinning:P.isSkinnedMesh===!0,hasPositionAttribute:L.attributes.position!==void 0,morphTargets:L.morphAttributes.position!==void 0,morphNormals:L.morphAttributes.normal!==void 0,morphColors:L.morphAttributes.color!==void 0,morphTargetsCount:K,morphTextureStride:ct,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:O.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&w.length>0,shadowMapType:i.shadowMap.type,toneMapping:ht,decodeVideoTexture:Yt&&_.map.isVideoTexture===!0&&he.getTransfer(_.map.colorSpace)===de,decodeVideoTextureEmissive:Ht&&_.emissiveMap.isVideoTexture===!0&&he.getTransfer(_.emissiveMap.colorSpace)===de,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Ce,flipSided:_.side===Ke,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:Pt&&_.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Pt&&_.extensions.multiDraw===!0||dt)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return zt.vertexUv1s=c.has(1),zt.vertexUv2s=c.has(2),zt.vertexUv3s=c.has(3),c.clear(),zt}function p(_){let E=[];if(_.shaderID?E.push(_.shaderID):(E.push(_.customVertexShaderID),E.push(_.customFragmentShaderID)),_.defines!==void 0)for(let w in _.defines)E.push(w),E.push(_.defines[w]);return _.isRawShaderMaterial===!1&&(m(E,_),M(E,_),E.push(i.outputColorSpace)),E.push(_.customProgramCacheKey),E.join()}function m(_,E){_.push(E.precision),_.push(E.outputColorSpace),_.push(E.envMapMode),_.push(E.envMapCubeUVHeight),_.push(E.mapUv),_.push(E.alphaMapUv),_.push(E.lightMapUv),_.push(E.aoMapUv),_.push(E.bumpMapUv),_.push(E.normalMapUv),_.push(E.displacementMapUv),_.push(E.emissiveMapUv),_.push(E.metalnessMapUv),_.push(E.roughnessMapUv),_.push(E.anisotropyMapUv),_.push(E.clearcoatMapUv),_.push(E.clearcoatNormalMapUv),_.push(E.clearcoatRoughnessMapUv),_.push(E.iridescenceMapUv),_.push(E.iridescenceThicknessMapUv),_.push(E.sheenColorMapUv),_.push(E.sheenRoughnessMapUv),_.push(E.specularMapUv),_.push(E.specularColorMapUv),_.push(E.specularIntensityMapUv),_.push(E.transmissionMapUv),_.push(E.thicknessMapUv),_.push(E.combine),_.push(E.fogExp2),_.push(E.sizeAttenuation),_.push(E.morphTargetsCount),_.push(E.morphAttributeCount),_.push(E.numDirLights),_.push(E.numPointLights),_.push(E.numSpotLights),_.push(E.numSpotLightMaps),_.push(E.numHemiLights),_.push(E.numRectAreaLights),_.push(E.numDirLightShadows),_.push(E.numPointLightShadows),_.push(E.numSpotLightShadows),_.push(E.numSpotLightShadowsWithMaps),_.push(E.numLightProbes),_.push(E.shadowMapType),_.push(E.toneMapping),_.push(E.numClippingPlanes),_.push(E.numClipIntersection),_.push(E.depthPacking)}function M(_,E){o.disableAll(),E.instancing&&o.enable(0),E.instancingColor&&o.enable(1),E.instancingMorph&&o.enable(2),E.matcap&&o.enable(3),E.envMap&&o.enable(4),E.normalMapObjectSpace&&o.enable(5),E.normalMapTangentSpace&&o.enable(6),E.clearcoat&&o.enable(7),E.iridescence&&o.enable(8),E.alphaTest&&o.enable(9),E.vertexColors&&o.enable(10),E.vertexAlphas&&o.enable(11),E.vertexUv1s&&o.enable(12),E.vertexUv2s&&o.enable(13),E.vertexUv3s&&o.enable(14),E.vertexTangents&&o.enable(15),E.anisotropy&&o.enable(16),E.alphaHash&&o.enable(17),E.batching&&o.enable(18),E.dispersion&&o.enable(19),E.batchingColor&&o.enable(20),E.gradientMap&&o.enable(21),E.packedNormalMap&&o.enable(22),E.vertexNormals&&o.enable(23),_.push(o.mask),o.disableAll(),E.fog&&o.enable(0),E.useFog&&o.enable(1),E.flatShading&&o.enable(2),E.logarithmicDepthBuffer&&o.enable(3),E.reversedDepthBuffer&&o.enable(4),E.skinning&&o.enable(5),E.morphTargets&&o.enable(6),E.morphNormals&&o.enable(7),E.morphColors&&o.enable(8),E.premultipliedAlpha&&o.enable(9),E.shadowMapEnabled&&o.enable(10),E.doubleSided&&o.enable(11),E.flipSided&&o.enable(12),E.useDepthPacking&&o.enable(13),E.dithering&&o.enable(14),E.transmission&&o.enable(15),E.sheen&&o.enable(16),E.opaque&&o.enable(17),E.pointsUvs&&o.enable(18),E.decodeVideoTexture&&o.enable(19),E.decodeVideoTextureEmissive&&o.enable(20),E.alphaToCoverage&&o.enable(21),E.numLightProbeGrids>0&&o.enable(22),E.hasPositionAttribute&&o.enable(23),_.push(o.mask)}function b(_){let E=f[_.type],w;if(E){let C=ii[E];w=Ku.clone(C.uniforms)}else w=_.uniforms;return w}function x(_,E){let w=h.get(E);return w!==void 0?++w.usedTimes:(w=new qx(i,E,_,s),l.push(w),h.set(E,w)),w}function T(_){if(--_.usedTimes===0){let E=l.indexOf(_);l[E]=l[l.length-1],l.pop(),h.delete(_.cacheKey),_.destroy()}}function S(_){a.remove(_)}function R(){a.dispose()}return{getParameters:y,getProgramCacheKey:p,getUniforms:b,acquireProgram:x,releaseProgram:T,releaseShaderCache:S,programs:l,dispose:R}}function Jx(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,c){i.get(o)[a]=c}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function Kx(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function xd(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function _d(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(u){let f=0;return u.isInstancedMesh&&(f+=2),u.isSkinnedMesh&&(f+=1),f}function a(u,f,g,y,p,m){let M=i[t];return M===void 0?(M={id:u.id,object:u,geometry:f,material:g,materialVariant:o(u),groupOrder:y,renderOrder:u.renderOrder,z:p,group:m},i[t]=M):(M.id=u.id,M.object=u,M.geometry=f,M.material=g,M.materialVariant=o(u),M.groupOrder=y,M.renderOrder=u.renderOrder,M.z=p,M.group=m),t++,M}function c(u,f,g,y,p,m){let M=a(u,f,g,y,p,m);g.transmission>0?n.push(M):g.transparent===!0?s.push(M):e.push(M)}function l(u,f,g,y,p,m){let M=a(u,f,g,y,p,m);g.transmission>0?n.unshift(M):g.transparent===!0?s.unshift(M):e.unshift(M)}function h(u,f,g){e.length>1&&e.sort(u||Kx),n.length>1&&n.sort(f||xd),s.length>1&&s.sort(f||xd),g&&(e.reverse(),n.reverse(),s.reverse())}function d(){for(let u=t,f=i.length;u<f;u++){let g=i[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:c,unshift:l,finish:d,sort:h}}function Qx(){let i=new WeakMap;function t(n,s){let r=i.get(n),o;return r===void 0?(o=new _d,i.set(n,[o])):s>=r.length?(o=new _d,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function jx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new D,color:new Vt};break;case"SpotLight":e={position:new D,direction:new D,color:new Vt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new D,color:new Vt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new D,skyColor:new Vt,groundColor:new Vt};break;case"RectAreaLight":e={color:new Vt,position:new D,halfWidth:new D,halfHeight:new D};break}return i[t.id]=e,e}}}function t_(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new xt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new xt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new xt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var e_=0;function n_(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function i_(i){let t=new jx,e=t_(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new D);let s=new D,r=new ne,o=new ne;function a(l){let h=0,d=0,u=0;for(let E=0;E<9;E++)n.probe[E].set(0,0,0);let f=0,g=0,y=0,p=0,m=0,M=0,b=0,x=0,T=0,S=0,R=0;l.sort(n_);for(let E=0,w=l.length;E<w;E++){let C=l[E],P=C.color,O=C.intensity,z=C.distance,L=null;if(C.shadow&&C.shadow.map&&(C.shadow.map.texture.format===zi?L=C.shadow.map.texture:L=C.shadow.map.depthTexture||C.shadow.map.texture),C.isAmbientLight)h+=P.r*O,d+=P.g*O,u+=P.b*O;else if(C.isLightProbe){for(let N=0;N<9;N++)n.probe[N].addScaledVector(C.sh.coefficients[N],O);R++}else if(C.isDirectionalLight){let N=t.get(C);if(N.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let U=C.shadow,G=e.get(C);G.shadowIntensity=U.intensity,G.shadowBias=U.bias,G.shadowNormalBias=U.normalBias,G.shadowRadius=U.radius,G.shadowMapSize=U.mapSize,n.directionalShadow[f]=G,n.directionalShadowMap[f]=L,n.directionalShadowMatrix[f]=C.shadow.matrix,M++}n.directional[f]=N,f++}else if(C.isSpotLight){let N=t.get(C);N.position.setFromMatrixPosition(C.matrixWorld),N.color.copy(P).multiplyScalar(O),N.distance=z,N.coneCos=Math.cos(C.angle),N.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),N.decay=C.decay,n.spot[y]=N;let U=C.shadow;if(C.map&&(n.spotLightMap[T]=C.map,T++,U.updateMatrices(C),C.castShadow&&S++),n.spotLightMatrix[y]=U.matrix,C.castShadow){let G=e.get(C);G.shadowIntensity=U.intensity,G.shadowBias=U.bias,G.shadowNormalBias=U.normalBias,G.shadowRadius=U.radius,G.shadowMapSize=U.mapSize,n.spotShadow[y]=G,n.spotShadowMap[y]=L,x++}y++}else if(C.isRectAreaLight){let N=t.get(C);N.color.copy(P).multiplyScalar(O),N.halfWidth.set(C.width*.5,0,0),N.halfHeight.set(0,C.height*.5,0),n.rectArea[p]=N,p++}else if(C.isPointLight){let N=t.get(C);if(N.color.copy(C.color).multiplyScalar(C.intensity),N.distance=C.distance,N.decay=C.decay,C.castShadow){let U=C.shadow,G=e.get(C);G.shadowIntensity=U.intensity,G.shadowBias=U.bias,G.shadowNormalBias=U.normalBias,G.shadowRadius=U.radius,G.shadowMapSize=U.mapSize,G.shadowCameraNear=U.camera.near,G.shadowCameraFar=U.camera.far,n.pointShadow[g]=G,n.pointShadowMap[g]=L,n.pointShadowMatrix[g]=C.shadow.matrix,b++}n.point[g]=N,g++}else if(C.isHemisphereLight){let N=t.get(C);N.skyColor.copy(C.color).multiplyScalar(O),N.groundColor.copy(C.groundColor).multiplyScalar(O),n.hemi[m]=N,m++}}p>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=At.LTC_FLOAT_1,n.rectAreaLTC2=At.LTC_FLOAT_2):(n.rectAreaLTC1=At.LTC_HALF_1,n.rectAreaLTC2=At.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=d,n.ambient[2]=u;let _=n.hash;(_.directionalLength!==f||_.pointLength!==g||_.spotLength!==y||_.rectAreaLength!==p||_.hemiLength!==m||_.numDirectionalShadows!==M||_.numPointShadows!==b||_.numSpotShadows!==x||_.numSpotMaps!==T||_.numLightProbes!==R)&&(n.directional.length=f,n.spot.length=y,n.rectArea.length=p,n.point.length=g,n.hemi.length=m,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.pointShadow.length=b,n.pointShadowMap.length=b,n.spotShadow.length=x,n.spotShadowMap.length=x,n.directionalShadowMatrix.length=M,n.pointShadowMatrix.length=b,n.spotLightMatrix.length=x+T-S,n.spotLightMap.length=T,n.numSpotLightShadowsWithMaps=S,n.numLightProbes=R,_.directionalLength=f,_.pointLength=g,_.spotLength=y,_.rectAreaLength=p,_.hemiLength=m,_.numDirectionalShadows=M,_.numPointShadows=b,_.numSpotShadows=x,_.numSpotMaps=T,_.numLightProbes=R,n.version=e_++)}function c(l,h){let d=0,u=0,f=0,g=0,y=0,p=h.matrixWorldInverse;for(let m=0,M=l.length;m<M;m++){let b=l[m];if(b.isDirectionalLight){let x=n.directional[d];x.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),x.direction.sub(s),x.direction.transformDirection(p),d++}else if(b.isSpotLight){let x=n.spot[f];x.position.setFromMatrixPosition(b.matrixWorld),x.position.applyMatrix4(p),x.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),x.direction.sub(s),x.direction.transformDirection(p),f++}else if(b.isRectAreaLight){let x=n.rectArea[g];x.position.setFromMatrixPosition(b.matrixWorld),x.position.applyMatrix4(p),o.identity(),r.copy(b.matrixWorld),r.premultiply(p),o.extractRotation(r),x.halfWidth.set(b.width*.5,0,0),x.halfHeight.set(0,b.height*.5,0),x.halfWidth.applyMatrix4(o),x.halfHeight.applyMatrix4(o),g++}else if(b.isPointLight){let x=n.point[u];x.position.setFromMatrixPosition(b.matrixWorld),x.position.applyMatrix4(p),u++}else if(b.isHemisphereLight){let x=n.hemi[y];x.direction.setFromMatrixPosition(b.matrixWorld),x.direction.transformDirection(p),y++}}}return{setup:a,setupView:c,state:n}}function yd(i){let t=new i_(i),e=[],n=[],s=[];function r(u){d.camera=u,e.length=0,n.length=0,s.length=0}function o(u){e.push(u)}function a(u){n.push(u)}function c(u){s.push(u)}function l(){t.setup(e)}function h(u){t.setupView(e,u)}let d={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:l,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:c}}function s_(i){let t=new WeakMap;function e(s,r=0){let o=t.get(s),a;return o===void 0?(a=new yd(i),t.set(s,[a])):r>=o.length?(a=new yd(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}var r_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,o_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,a_=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],c_=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],vd=new ne,$r=new D,Kl=new D;function l_(i,t,e){let n=new Ps,s=new xt,r=new xt,o=new we,a=new ra,c=new oa,l={},h=e.maxTextureSize,d={[fi]:Ke,[Ke]:fi,[Ce]:Ce},u=new ln({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new xt},radius:{value:4}},vertexShader:r_,fragmentShader:o_}),f=u.clone();f.defines.HORIZONTAL_PASS=1;let g=new Oe;g.setAttribute("position",new fn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new pt(g,u),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Fr;let m=this.type;this.render=function(S,R,_){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||S.length===0)return;this.type===_a&&(Jt("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Fr);let E=i.getRenderTarget(),w=i.getActiveCubeFace(),C=i.getActiveMipmapLevel(),P=i.state;P.setBlending(jn),P.buffers.depth.getReversed()===!0?P.buffers.color.setClear(0,0,0,0):P.buffers.color.setClear(1,1,1,1),P.buffers.depth.setTest(!0),P.setScissorTest(!1);let O=m!==this.type;O&&R.traverse(function(z){z.material&&(Array.isArray(z.material)?z.material.forEach(L=>L.needsUpdate=!0):z.material.needsUpdate=!0)});for(let z=0,L=S.length;z<L;z++){let N=S[z],U=N.shadow;if(U===void 0){Jt("WebGLShadowMap:",N,"has no shadow.");continue}if(U.autoUpdate===!1&&U.needsUpdate===!1)continue;s.copy(U.mapSize);let G=U.getFrameExtents();s.multiply(G),r.copy(U.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/G.x),s.x=r.x*G.x,U.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/G.y),s.y=r.y*G.y,U.mapSize.y=r.y));let Z=i.state.buffers.depth.getReversed();if(U.camera._reversedDepth=Z,U.map===null||O===!0){if(U.map!==null&&(U.map.depthTexture!==null&&(U.map.depthTexture.dispose(),U.map.depthTexture=null),U.map.dispose()),this.type===Bs){if(N.isPointLight){Jt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}U.map=new yn(s.x,s.y,{format:zi,type:ei,minFilter:Je,magFilter:Je,generateMipmaps:!1}),U.map.texture.name=N.name+".shadowMap",U.map.depthTexture=new mi(s.x,s.y,In),U.map.depthTexture.name=N.name+".shadowMapDepth",U.map.depthTexture.format=Jn,U.map.depthTexture.compareFunction=null,U.map.depthTexture.minFilter=qe,U.map.depthTexture.magFilter=qe}else N.isPointLight?(U.map=new Vs(s.x),U.map.depthTexture=new Jo(s.x,kn)):(U.map=new yn(s.x,s.y),U.map.depthTexture=new mi(s.x,s.y,kn)),U.map.depthTexture.name=N.name+".shadowMap",U.map.depthTexture.format=Jn,this.type===Fr?(U.map.depthTexture.compareFunction=Z?ac:oc,U.map.depthTexture.minFilter=Je,U.map.depthTexture.magFilter=Je):(U.map.depthTexture.compareFunction=null,U.map.depthTexture.minFilter=qe,U.map.depthTexture.magFilter=qe);U.camera.updateProjectionMatrix()}let q=U.map.isWebGLCubeRenderTarget?6:1;for(let J=0;J<q;J++){if(U.map.isWebGLCubeRenderTarget)i.setRenderTarget(U.map,J),i.clear();else{J===0&&(i.setRenderTarget(U.map),i.clear());let K=U.getViewport(J);o.set(r.x*K.x,r.y*K.y,r.x*K.z,r.y*K.w),P.viewport(o)}if(N.isPointLight){let K=U.camera,ct=U.matrix,mt=N.distance||K.far;mt!==K.far&&(K.far=mt,K.updateProjectionMatrix()),$r.setFromMatrixPosition(N.matrixWorld),K.position.copy($r),Kl.copy(K.position),Kl.add(a_[J]),K.up.copy(c_[J]),K.lookAt(Kl),K.updateMatrixWorld(),ct.makeTranslation(-$r.x,-$r.y,-$r.z),vd.multiplyMatrices(K.projectionMatrix,K.matrixWorldInverse),U._frustum.setFromProjectionMatrix(vd,K.coordinateSystem,K.reversedDepth)}else U.updateMatrices(N);n=U.getFrustum(),x(R,_,U.camera,N,this.type)}U.isPointLightShadow!==!0&&this.type===Bs&&M(U,_),U.needsUpdate=!1}m=this.type,p.needsUpdate=!1,i.setRenderTarget(E,w,C)};function M(S,R){let _=t.update(y);u.defines.VSM_SAMPLES!==S.blurSamples&&(u.defines.VSM_SAMPLES=S.blurSamples,f.defines.VSM_SAMPLES=S.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),S.mapPass===null&&(S.mapPass=new yn(s.x,s.y,{format:zi,type:ei})),u.uniforms.shadow_pass.value=S.map.depthTexture,u.uniforms.resolution.value=S.mapSize,u.uniforms.radius.value=S.radius,i.setRenderTarget(S.mapPass),i.clear(),i.renderBufferDirect(R,null,_,u,y,null),f.uniforms.shadow_pass.value=S.mapPass.texture,f.uniforms.resolution.value=S.mapSize,f.uniforms.radius.value=S.radius,i.setRenderTarget(S.map),i.clear(),i.renderBufferDirect(R,null,_,f,y,null)}function b(S,R,_,E){let w=null,C=_.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(C!==void 0)w=C;else if(w=_.isPointLight===!0?c:a,i.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){let P=w.uuid,O=R.uuid,z=l[P];z===void 0&&(z={},l[P]=z);let L=z[O];L===void 0&&(L=w.clone(),z[O]=L,R.addEventListener("dispose",T)),w=L}if(w.visible=R.visible,w.wireframe=R.wireframe,E===Bs?w.side=R.shadowSide!==null?R.shadowSide:R.side:w.side=R.shadowSide!==null?R.shadowSide:d[R.side],w.alphaMap=R.alphaMap,w.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,w.map=R.map,w.clipShadows=R.clipShadows,w.clippingPlanes=R.clippingPlanes,w.clipIntersection=R.clipIntersection,w.displacementMap=R.displacementMap,w.displacementScale=R.displacementScale,w.displacementBias=R.displacementBias,w.wireframeLinewidth=R.wireframeLinewidth,w.linewidth=R.linewidth,_.isPointLight===!0&&w.isMeshDistanceMaterial===!0){let P=i.properties.get(w);P.light=_}return w}function x(S,R,_,E,w){if(S.visible===!1)return;if(S.layers.test(R.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&w===Bs)&&(!S.frustumCulled||n.intersectsObject(S))){S.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,S.matrixWorld);let O=t.update(S),z=S.material;if(Array.isArray(z)){let L=O.groups;for(let N=0,U=L.length;N<U;N++){let G=L[N],Z=z[G.materialIndex];if(Z&&Z.visible){let q=b(S,Z,E,w);S.onBeforeShadow(i,S,R,_,O,q,G),i.renderBufferDirect(_,null,O,q,S,G),S.onAfterShadow(i,S,R,_,O,q,G)}}}else if(z.visible){let L=b(S,z,E,w);S.onBeforeShadow(i,S,R,_,O,L,null),i.renderBufferDirect(_,null,O,L,S,null),S.onAfterShadow(i,S,R,_,O,L,null)}}let P=S.children;for(let O=0,z=P.length;O<z;O++)x(P[O],R,_,E,w)}function T(S){S.target.removeEventListener("dispose",T);for(let _ in l){let E=l[_],w=S.target.uuid;w in E&&(E[w].dispose(),delete E[w])}}}function h_(i,t){function e(){let B=!1,vt=new we,it=null,wt=new we(0,0,0,0);return{setMask:function(Pt){it!==Pt&&!B&&(i.colorMask(Pt,Pt,Pt,Pt),it=Pt)},setLocked:function(Pt){B=Pt},setClear:function(Pt,ht,zt,Bt,Pe){Pe===!0&&(Pt*=Bt,ht*=Bt,zt*=Bt),vt.set(Pt,ht,zt,Bt),wt.equals(vt)===!1&&(i.clearColor(Pt,ht,zt,Bt),wt.copy(vt))},reset:function(){B=!1,it=null,wt.set(-1,0,0,0)}}}function n(){let B=!1,vt=!1,it=null,wt=null,Pt=null;return{setReversed:function(ht){if(vt!==ht){let zt=t.get("EXT_clip_control");ht?zt.clipControlEXT(zt.LOWER_LEFT_EXT,zt.ZERO_TO_ONE_EXT):zt.clipControlEXT(zt.LOWER_LEFT_EXT,zt.NEGATIVE_ONE_TO_ONE_EXT),vt=ht;let Bt=Pt;Pt=null,this.setClear(Bt)}},getReversed:function(){return vt},setTest:function(ht){ht?tt(i.DEPTH_TEST):gt(i.DEPTH_TEST)},setMask:function(ht){it!==ht&&!B&&(i.depthMask(ht),it=ht)},setFunc:function(ht){if(vt&&(ht=Xu[ht]),wt!==ht){switch(ht){case Bo:i.depthFunc(i.NEVER);break;case Oo:i.depthFunc(i.ALWAYS);break;case zo:i.depthFunc(i.LESS);break;case Qi:i.depthFunc(i.LEQUAL);break;case Ho:i.depthFunc(i.EQUAL);break;case ko:i.depthFunc(i.GEQUAL);break;case Go:i.depthFunc(i.GREATER);break;case Vo:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}wt=ht}},setLocked:function(ht){B=ht},setClear:function(ht){Pt!==ht&&(Pt=ht,vt&&(ht=1-ht),i.clearDepth(ht))},reset:function(){B=!1,it=null,wt=null,Pt=null,vt=!1}}}function s(){let B=!1,vt=null,it=null,wt=null,Pt=null,ht=null,zt=null,Bt=null,Pe=null;return{setTest:function(ve){B||(ve?tt(i.STENCIL_TEST):gt(i.STENCIL_TEST))},setMask:function(ve){vt!==ve&&!B&&(i.stencilMask(ve),vt=ve)},setFunc:function(ve,Wn,Xn){(it!==ve||wt!==Wn||Pt!==Xn)&&(i.stencilFunc(ve,Wn,Xn),it=ve,wt=Wn,Pt=Xn)},setOp:function(ve,Wn,Xn){(ht!==ve||zt!==Wn||Bt!==Xn)&&(i.stencilOp(ve,Wn,Xn),ht=ve,zt=Wn,Bt=Xn)},setLocked:function(ve){B=ve},setClear:function(ve){Pe!==ve&&(i.clearStencil(ve),Pe=ve)},reset:function(){B=!1,vt=null,it=null,wt=null,Pt=null,ht=null,zt=null,Bt=null,Pe=null}}}let r=new e,o=new n,a=new s,c=new WeakMap,l=new WeakMap,h={},d={},u={},f=new WeakMap,g=[],y=null,p=!1,m=null,M=null,b=null,x=null,T=null,S=null,R=null,_=new Vt(0,0,0),E=0,w=!1,C=null,P=null,O=null,z=null,L=null,N=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),U=!1,G=0,Z=i.getParameter(i.VERSION);Z.indexOf("WebGL")!==-1?(G=parseFloat(/^WebGL (\d)/.exec(Z)[1]),U=G>=1):Z.indexOf("OpenGL ES")!==-1&&(G=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),U=G>=2);let q=null,J={},K=i.getParameter(i.SCISSOR_BOX),ct=i.getParameter(i.VIEWPORT),mt=new we().fromArray(K),rt=new we().fromArray(ct);function k(B,vt,it,wt){let Pt=new Uint8Array(4),ht=i.createTexture();i.bindTexture(B,ht),i.texParameteri(B,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(B,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let zt=0;zt<it;zt++)B===i.TEXTURE_3D||B===i.TEXTURE_2D_ARRAY?i.texImage3D(vt,0,i.RGBA,1,1,wt,0,i.RGBA,i.UNSIGNED_BYTE,Pt):i.texImage2D(vt+zt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Pt);return ht}let nt={};nt[i.TEXTURE_2D]=k(i.TEXTURE_2D,i.TEXTURE_2D,1),nt[i.TEXTURE_CUBE_MAP]=k(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),nt[i.TEXTURE_2D_ARRAY]=k(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),nt[i.TEXTURE_3D]=k(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),tt(i.DEPTH_TEST),o.setFunc(Qi),St(!1),Mt(bl),tt(i.CULL_FACE),ot(jn);function tt(B){h[B]!==!0&&(i.enable(B),h[B]=!0)}function gt(B){h[B]!==!1&&(i.disable(B),h[B]=!1)}function yt(B,vt){return u[B]!==vt?(i.bindFramebuffer(B,vt),u[B]=vt,B===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=vt),B===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=vt),!0):!1}function dt(B,vt){let it=g,wt=!1;if(B){it=f.get(vt),it===void 0&&(it=[],f.set(vt,it));let Pt=B.textures;if(it.length!==Pt.length||it[0]!==i.COLOR_ATTACHMENT0){for(let ht=0,zt=Pt.length;ht<zt;ht++)it[ht]=i.COLOR_ATTACHMENT0+ht;it.length=Pt.length,wt=!0}}else it[0]!==i.BACK&&(it[0]=i.BACK,wt=!0);wt&&i.drawBuffers(it)}function Yt(B){return y!==B?(i.useProgram(B),y=B,!0):!1}let Nt={[Ii]:i.FUNC_ADD,[pu]:i.FUNC_SUBTRACT,[mu]:i.FUNC_REVERSE_SUBTRACT};Nt[gu]=i.MIN,Nt[xu]=i.MAX;let et={[_u]:i.ZERO,[yu]:i.ONE,[vu]:i.SRC_COLOR,[No]:i.SRC_ALPHA,[Tu]:i.SRC_ALPHA_SATURATE,[Eu]:i.DST_COLOR,[Su]:i.DST_ALPHA,[Mu]:i.ONE_MINUS_SRC_COLOR,[Fo]:i.ONE_MINUS_SRC_ALPHA,[wu]:i.ONE_MINUS_DST_COLOR,[bu]:i.ONE_MINUS_DST_ALPHA,[Au]:i.CONSTANT_COLOR,[Ru]:i.ONE_MINUS_CONSTANT_COLOR,[Cu]:i.CONSTANT_ALPHA,[Iu]:i.ONE_MINUS_CONSTANT_ALPHA};function ot(B,vt,it,wt,Pt,ht,zt,Bt,Pe,ve){if(B===jn){p===!0&&(gt(i.BLEND),p=!1);return}if(p===!1&&(tt(i.BLEND),p=!0),B!==fu){if(B!==m||ve!==w){if((M!==Ii||T!==Ii)&&(i.blendEquation(i.FUNC_ADD),M=Ii,T=Ii),ve)switch(B){case Ki:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case El:i.blendFunc(i.ONE,i.ONE);break;case wl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Br:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:$t("WebGLState: Invalid blending: ",B);break}else switch(B){case Ki:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case El:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case wl:$t("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Br:$t("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:$t("WebGLState: Invalid blending: ",B);break}b=null,x=null,S=null,R=null,_.set(0,0,0),E=0,m=B,w=ve}return}Pt=Pt||vt,ht=ht||it,zt=zt||wt,(vt!==M||Pt!==T)&&(i.blendEquationSeparate(Nt[vt],Nt[Pt]),M=vt,T=Pt),(it!==b||wt!==x||ht!==S||zt!==R)&&(i.blendFuncSeparate(et[it],et[wt],et[ht],et[zt]),b=it,x=wt,S=ht,R=zt),(Bt.equals(_)===!1||Pe!==E)&&(i.blendColor(Bt.r,Bt.g,Bt.b,Pe),_.copy(Bt),E=Pe),m=B,w=!1}function lt(B,vt){B.side===Ce?gt(i.CULL_FACE):tt(i.CULL_FACE);let it=B.side===Ke;vt&&(it=!it),St(it),B.blending===Ki&&B.transparent===!1?ot(jn):ot(B.blending,B.blendEquation,B.blendSrc,B.blendDst,B.blendEquationAlpha,B.blendSrcAlpha,B.blendDstAlpha,B.blendColor,B.blendAlpha,B.premultipliedAlpha),o.setFunc(B.depthFunc),o.setTest(B.depthTest),o.setMask(B.depthWrite),r.setMask(B.colorWrite);let wt=B.stencilWrite;a.setTest(wt),wt&&(a.setMask(B.stencilWriteMask),a.setFunc(B.stencilFunc,B.stencilRef,B.stencilFuncMask),a.setOp(B.stencilFail,B.stencilZFail,B.stencilZPass)),Ht(B.polygonOffset,B.polygonOffsetFactor,B.polygonOffsetUnits),B.alphaToCoverage===!0?tt(i.SAMPLE_ALPHA_TO_COVERAGE):gt(i.SAMPLE_ALPHA_TO_COVERAGE)}function St(B){C!==B&&(B?i.frontFace(i.CW):i.frontFace(i.CCW),C=B)}function Mt(B){B!==uu?(tt(i.CULL_FACE),B!==P&&(B===bl?i.cullFace(i.BACK):B===du?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):gt(i.CULL_FACE),P=B}function Zt(B){B!==O&&(U&&i.lineWidth(B),O=B)}function Ht(B,vt,it){B?(tt(i.POLYGON_OFFSET_FILL),(z!==vt||L!==it)&&(z=vt,L=it,o.getReversed()&&(vt=-vt),i.polygonOffset(vt,it))):gt(i.POLYGON_OFFSET_FILL)}function Qt(B){B?tt(i.SCISSOR_TEST):gt(i.SCISSOR_TEST)}function ee(B){B===void 0&&(B=i.TEXTURE0+N-1),q!==B&&(i.activeTexture(B),q=B)}function F(B,vt,it){it===void 0&&(q===null?it=i.TEXTURE0+N-1:it=q);let wt=J[it];wt===void 0&&(wt={type:void 0,texture:void 0},J[it]=wt),(wt.type!==B||wt.texture!==vt)&&(q!==it&&(i.activeTexture(it),q=it),i.bindTexture(B,vt||nt[B]),wt.type=B,wt.texture=vt)}function pe(){let B=J[q];B!==void 0&&B.type!==void 0&&(i.bindTexture(B.type,null),B.type=void 0,B.texture=void 0)}function ce(){try{i.compressedTexImage2D(...arguments)}catch(B){$t("WebGLState:",B)}}function I(){try{i.compressedTexImage3D(...arguments)}catch(B){$t("WebGLState:",B)}}function v(){try{i.texSubImage2D(...arguments)}catch(B){$t("WebGLState:",B)}}function V(){try{i.texSubImage3D(...arguments)}catch(B){$t("WebGLState:",B)}}function Y(){try{i.compressedTexSubImage2D(...arguments)}catch(B){$t("WebGLState:",B)}}function Q(){try{i.compressedTexSubImage3D(...arguments)}catch(B){$t("WebGLState:",B)}}function ft(){try{i.texStorage2D(...arguments)}catch(B){$t("WebGLState:",B)}}function _t(){try{i.texStorage3D(...arguments)}catch(B){$t("WebGLState:",B)}}function j(){try{i.texImage2D(...arguments)}catch(B){$t("WebGLState:",B)}}function st(){try{i.texImage3D(...arguments)}catch(B){$t("WebGLState:",B)}}function bt(B){return d[B]!==void 0?d[B]:i.getParameter(B)}function kt(B,vt){d[B]!==vt&&(i.pixelStorei(B,vt),d[B]=vt)}function Tt(B){mt.equals(B)===!1&&(i.scissor(B.x,B.y,B.z,B.w),mt.copy(B))}function Et(B){rt.equals(B)===!1&&(i.viewport(B.x,B.y,B.z,B.w),rt.copy(B))}function Xt(B,vt){let it=l.get(vt);it===void 0&&(it=new WeakMap,l.set(vt,it));let wt=it.get(B);wt===void 0&&(wt=i.getUniformBlockIndex(vt,B.name),it.set(B,wt))}function Kt(B,vt){let wt=l.get(vt).get(B);c.get(vt)!==wt&&(i.uniformBlockBinding(vt,wt,B.__bindingPointIndex),c.set(vt,wt))}function ie(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},d={},q=null,J={},u={},f=new WeakMap,g=[],y=null,p=!1,m=null,M=null,b=null,x=null,T=null,S=null,R=null,_=new Vt(0,0,0),E=0,w=!1,C=null,P=null,O=null,z=null,L=null,mt.set(0,0,i.canvas.width,i.canvas.height),rt.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:tt,disable:gt,bindFramebuffer:yt,drawBuffers:dt,useProgram:Yt,setBlending:ot,setMaterial:lt,setFlipSided:St,setCullFace:Mt,setLineWidth:Zt,setPolygonOffset:Ht,setScissorTest:Qt,activeTexture:ee,bindTexture:F,unbindTexture:pe,compressedTexImage2D:ce,compressedTexImage3D:I,texImage2D:j,texImage3D:st,pixelStorei:kt,getParameter:bt,updateUBOMapping:Xt,uniformBlockBinding:Kt,texStorage2D:ft,texStorage3D:_t,texSubImage2D:v,texSubImage3D:V,compressedTexSubImage2D:Y,compressedTexSubImage3D:Q,scissor:Tt,viewport:Et,reset:ie}}function u_(i,t,e,n,s,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new xt,h=new WeakMap,d=new Set,u,f=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(I,v){return g?new OffscreenCanvas(I,v):lr("canvas")}function p(I,v,V){let Y=1,Q=ce(I);if((Q.width>V||Q.height>V)&&(Y=V/Math.max(Q.width,Q.height)),Y<1)if(typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&I instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&I instanceof ImageBitmap||typeof VideoFrame<"u"&&I instanceof VideoFrame){let ft=Math.floor(Y*Q.width),_t=Math.floor(Y*Q.height);u===void 0&&(u=y(ft,_t));let j=v?y(ft,_t):u;return j.width=ft,j.height=_t,j.getContext("2d").drawImage(I,0,0,ft,_t),Jt("WebGLRenderer: Texture has been resized from ("+Q.width+"x"+Q.height+") to ("+ft+"x"+_t+")."),j}else return"data"in I&&Jt("WebGLRenderer: Image in DataTexture is too big ("+Q.width+"x"+Q.height+")."),I;return I}function m(I){return I.generateMipmaps}function M(I){i.generateMipmap(I)}function b(I){return I.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:I.isWebGL3DRenderTarget?i.TEXTURE_3D:I.isWebGLArrayRenderTarget||I.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function x(I,v,V,Y,Q,ft=!1){if(I!==null){if(i[I]!==void 0)return i[I];Jt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+I+"'")}let _t;Y&&(_t=t.get("EXT_texture_norm16"),_t||Jt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let j=v;if(v===i.RED&&(V===i.FLOAT&&(j=i.R32F),V===i.HALF_FLOAT&&(j=i.R16F),V===i.UNSIGNED_BYTE&&(j=i.R8),V===i.UNSIGNED_SHORT&&_t&&(j=_t.R16_EXT),V===i.SHORT&&_t&&(j=_t.R16_SNORM_EXT)),v===i.RED_INTEGER&&(V===i.UNSIGNED_BYTE&&(j=i.R8UI),V===i.UNSIGNED_SHORT&&(j=i.R16UI),V===i.UNSIGNED_INT&&(j=i.R32UI),V===i.BYTE&&(j=i.R8I),V===i.SHORT&&(j=i.R16I),V===i.INT&&(j=i.R32I)),v===i.RG&&(V===i.FLOAT&&(j=i.RG32F),V===i.HALF_FLOAT&&(j=i.RG16F),V===i.UNSIGNED_BYTE&&(j=i.RG8),V===i.UNSIGNED_SHORT&&_t&&(j=_t.RG16_EXT),V===i.SHORT&&_t&&(j=_t.RG16_SNORM_EXT)),v===i.RG_INTEGER&&(V===i.UNSIGNED_BYTE&&(j=i.RG8UI),V===i.UNSIGNED_SHORT&&(j=i.RG16UI),V===i.UNSIGNED_INT&&(j=i.RG32UI),V===i.BYTE&&(j=i.RG8I),V===i.SHORT&&(j=i.RG16I),V===i.INT&&(j=i.RG32I)),v===i.RGB_INTEGER&&(V===i.UNSIGNED_BYTE&&(j=i.RGB8UI),V===i.UNSIGNED_SHORT&&(j=i.RGB16UI),V===i.UNSIGNED_INT&&(j=i.RGB32UI),V===i.BYTE&&(j=i.RGB8I),V===i.SHORT&&(j=i.RGB16I),V===i.INT&&(j=i.RGB32I)),v===i.RGBA_INTEGER&&(V===i.UNSIGNED_BYTE&&(j=i.RGBA8UI),V===i.UNSIGNED_SHORT&&(j=i.RGBA16UI),V===i.UNSIGNED_INT&&(j=i.RGBA32UI),V===i.BYTE&&(j=i.RGBA8I),V===i.SHORT&&(j=i.RGBA16I),V===i.INT&&(j=i.RGBA32I)),v===i.RGB&&(V===i.UNSIGNED_SHORT&&_t&&(j=_t.RGB16_EXT),V===i.SHORT&&_t&&(j=_t.RGB16_SNORM_EXT),V===i.UNSIGNED_INT_5_9_9_9_REV&&(j=i.RGB9_E5),V===i.UNSIGNED_INT_10F_11F_11F_REV&&(j=i.R11F_G11F_B10F)),v===i.RGBA){let st=ft?cr:he.getTransfer(Q);V===i.FLOAT&&(j=i.RGBA32F),V===i.HALF_FLOAT&&(j=i.RGBA16F),V===i.UNSIGNED_BYTE&&(j=st===de?i.SRGB8_ALPHA8:i.RGBA8),V===i.UNSIGNED_SHORT&&_t&&(j=_t.RGBA16_EXT),V===i.SHORT&&_t&&(j=_t.RGBA16_SNORM_EXT),V===i.UNSIGNED_SHORT_4_4_4_4&&(j=i.RGBA4),V===i.UNSIGNED_SHORT_5_5_5_1&&(j=i.RGB5_A1)}return(j===i.R16F||j===i.R32F||j===i.RG16F||j===i.RG32F||j===i.RGBA16F||j===i.RGBA32F)&&t.get("EXT_color_buffer_float"),j}function T(I,v){let V;return I?v===null||v===kn||v===zs?V=i.DEPTH24_STENCIL8:v===In?V=i.DEPTH32F_STENCIL8:v===Os&&(V=i.DEPTH24_STENCIL8,Jt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===kn||v===zs?V=i.DEPTH_COMPONENT24:v===In?V=i.DEPTH_COMPONENT32F:v===Os&&(V=i.DEPTH_COMPONENT16),V}function S(I,v){return m(I)===!0||I.isFramebufferTexture&&I.minFilter!==qe&&I.minFilter!==Je?Math.log2(Math.max(v.width,v.height))+1:I.mipmaps!==void 0&&I.mipmaps.length>0?I.mipmaps.length:I.isCompressedTexture&&Array.isArray(I.image)?v.mipmaps.length:1}function R(I){let v=I.target;v.removeEventListener("dispose",R),E(v),v.isVideoTexture&&h.delete(v),v.isHTMLTexture&&d.delete(v)}function _(I){let v=I.target;v.removeEventListener("dispose",_),C(v)}function E(I){let v=n.get(I);if(v.__webglInit===void 0)return;let V=I.source,Y=f.get(V);if(Y){let Q=Y[v.__cacheKey];Q.usedTimes--,Q.usedTimes===0&&w(I),Object.keys(Y).length===0&&f.delete(V)}n.remove(I)}function w(I){let v=n.get(I);i.deleteTexture(v.__webglTexture);let V=I.source,Y=f.get(V);delete Y[v.__cacheKey],o.memory.textures--}function C(I){let v=n.get(I);if(I.depthTexture&&(I.depthTexture.dispose(),n.remove(I.depthTexture)),I.isWebGLCubeRenderTarget)for(let Y=0;Y<6;Y++){if(Array.isArray(v.__webglFramebuffer[Y]))for(let Q=0;Q<v.__webglFramebuffer[Y].length;Q++)i.deleteFramebuffer(v.__webglFramebuffer[Y][Q]);else i.deleteFramebuffer(v.__webglFramebuffer[Y]);v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer[Y])}else{if(Array.isArray(v.__webglFramebuffer))for(let Y=0;Y<v.__webglFramebuffer.length;Y++)i.deleteFramebuffer(v.__webglFramebuffer[Y]);else i.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&i.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let Y=0;Y<v.__webglColorRenderbuffer.length;Y++)v.__webglColorRenderbuffer[Y]&&i.deleteRenderbuffer(v.__webglColorRenderbuffer[Y]);v.__webglDepthRenderbuffer&&i.deleteRenderbuffer(v.__webglDepthRenderbuffer)}let V=I.textures;for(let Y=0,Q=V.length;Y<Q;Y++){let ft=n.get(V[Y]);ft.__webglTexture&&(i.deleteTexture(ft.__webglTexture),o.memory.textures--),n.remove(V[Y])}n.remove(I)}let P=0;function O(){P=0}function z(){return P}function L(I){P=I}function N(){let I=P;return I>=s.maxTextures&&Jt("WebGLTextures: Trying to use "+I+" texture units while this GPU supports only "+s.maxTextures),P+=1,I}function U(I){let v=[];return v.push(I.wrapS),v.push(I.wrapT),v.push(I.wrapR||0),v.push(I.magFilter),v.push(I.minFilter),v.push(I.anisotropy),v.push(I.internalFormat),v.push(I.format),v.push(I.type),v.push(I.generateMipmaps),v.push(I.premultiplyAlpha),v.push(I.flipY),v.push(I.unpackAlignment),v.push(I.colorSpace),v.join()}function G(I,v){let V=n.get(I);if(I.isVideoTexture&&F(I),I.isRenderTargetTexture===!1&&I.isExternalTexture!==!0&&I.version>0&&V.__version!==I.version){let Y=I.image;if(Y===null)Jt("WebGLRenderer: Texture marked for update but no image data found.");else if(Y.complete===!1)Jt("WebGLRenderer: Texture marked for update but image is incomplete");else{gt(V,I,v);return}}else I.isExternalTexture&&(V.__webglTexture=I.sourceTexture?I.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,V.__webglTexture,i.TEXTURE0+v)}function Z(I,v){let V=n.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&V.__version!==I.version){gt(V,I,v);return}else I.isExternalTexture&&(V.__webglTexture=I.sourceTexture?I.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,V.__webglTexture,i.TEXTURE0+v)}function q(I,v){let V=n.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&V.__version!==I.version){gt(V,I,v);return}e.bindTexture(i.TEXTURE_3D,V.__webglTexture,i.TEXTURE0+v)}function J(I,v){let V=n.get(I);if(I.isCubeDepthTexture!==!0&&I.version>0&&V.__version!==I.version){yt(V,I,v);return}e.bindTexture(i.TEXTURE_CUBE_MAP,V.__webglTexture,i.TEXTURE0+v)}let K={[ws]:i.REPEAT,[$n]:i.CLAMP_TO_EDGE,[Wo]:i.MIRRORED_REPEAT},ct={[qe]:i.NEAREST,[Du]:i.NEAREST_MIPMAP_NEAREST,[Hr]:i.NEAREST_MIPMAP_LINEAR,[Je]:i.LINEAR,[Sa]:i.LINEAR_MIPMAP_NEAREST,[ti]:i.LINEAR_MIPMAP_LINEAR},mt={[Fu]:i.NEVER,[ku]:i.ALWAYS,[Bu]:i.LESS,[oc]:i.LEQUAL,[Ou]:i.EQUAL,[ac]:i.GEQUAL,[zu]:i.GREATER,[Hu]:i.NOTEQUAL};function rt(I,v){if(v.type===In&&t.has("OES_texture_float_linear")===!1&&(v.magFilter===Je||v.magFilter===Sa||v.magFilter===Hr||v.magFilter===ti||v.minFilter===Je||v.minFilter===Sa||v.minFilter===Hr||v.minFilter===ti)&&Jt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(I,i.TEXTURE_WRAP_S,K[v.wrapS]),i.texParameteri(I,i.TEXTURE_WRAP_T,K[v.wrapT]),(I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY)&&i.texParameteri(I,i.TEXTURE_WRAP_R,K[v.wrapR]),i.texParameteri(I,i.TEXTURE_MAG_FILTER,ct[v.magFilter]),i.texParameteri(I,i.TEXTURE_MIN_FILTER,ct[v.minFilter]),v.compareFunction&&(i.texParameteri(I,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(I,i.TEXTURE_COMPARE_FUNC,mt[v.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===qe||v.minFilter!==Hr&&v.minFilter!==ti||v.type===In&&t.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||n.get(v).__currentAnisotropy){let V=t.get("EXT_texture_filter_anisotropic");i.texParameterf(I,V.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),n.get(v).__currentAnisotropy=v.anisotropy}}}function k(I,v){let V=!1;I.__webglInit===void 0&&(I.__webglInit=!0,v.addEventListener("dispose",R));let Y=v.source,Q=f.get(Y);Q===void 0&&(Q={},f.set(Y,Q));let ft=U(v);if(ft!==I.__cacheKey){Q[ft]===void 0&&(Q[ft]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,V=!0),Q[ft].usedTimes++;let _t=Q[I.__cacheKey];_t!==void 0&&(Q[I.__cacheKey].usedTimes--,_t.usedTimes===0&&w(v)),I.__cacheKey=ft,I.__webglTexture=Q[ft].texture}return V}function nt(I,v,V){return Math.floor(Math.floor(I/V)/v)}function tt(I,v,V,Y){let ft=I.updateRanges;if(ft.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,v.width,v.height,V,Y,v.data);else{ft.sort((kt,Tt)=>kt.start-Tt.start);let _t=0;for(let kt=1;kt<ft.length;kt++){let Tt=ft[_t],Et=ft[kt],Xt=Tt.start+Tt.count,Kt=nt(Et.start,v.width,4),ie=nt(Tt.start,v.width,4);Et.start<=Xt+1&&Kt===ie&&nt(Et.start+Et.count-1,v.width,4)===Kt?Tt.count=Math.max(Tt.count,Et.start+Et.count-Tt.start):(++_t,ft[_t]=Et)}ft.length=_t+1;let j=e.getParameter(i.UNPACK_ROW_LENGTH),st=e.getParameter(i.UNPACK_SKIP_PIXELS),bt=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,v.width);for(let kt=0,Tt=ft.length;kt<Tt;kt++){let Et=ft[kt],Xt=Math.floor(Et.start/4),Kt=Math.ceil(Et.count/4),ie=Xt%v.width,B=Math.floor(Xt/v.width),vt=Kt,it=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,ie),e.pixelStorei(i.UNPACK_SKIP_ROWS,B),e.texSubImage2D(i.TEXTURE_2D,0,ie,B,vt,it,V,Y,v.data)}I.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,j),e.pixelStorei(i.UNPACK_SKIP_PIXELS,st),e.pixelStorei(i.UNPACK_SKIP_ROWS,bt)}}function gt(I,v,V){let Y=i.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(Y=i.TEXTURE_2D_ARRAY),v.isData3DTexture&&(Y=i.TEXTURE_3D);let Q=k(I,v),ft=v.source;e.bindTexture(Y,I.__webglTexture,i.TEXTURE0+V);let _t=n.get(ft);if(ft.version!==_t.__version||Q===!0){if(e.activeTexture(i.TEXTURE0+V),(typeof ImageBitmap<"u"&&v.image instanceof ImageBitmap)===!1){let it=he.getPrimaries(he.workingColorSpace),wt=v.colorSpace===xi?null:he.getPrimaries(v.colorSpace),Pt=v.colorSpace===xi||it===wt?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Pt)}e.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment);let st=p(v.image,!1,s.maxTextureSize);st=pe(v,st);let bt=r.convert(v.format,v.colorSpace),kt=r.convert(v.type),Tt=x(v.internalFormat,bt,kt,v.normalized,v.colorSpace,v.isVideoTexture);rt(Y,v);let Et,Xt=v.mipmaps,Kt=v.isVideoTexture!==!0,ie=_t.__version===void 0||Q===!0,B=ft.dataReady,vt=S(v,st);if(v.isDepthTexture)Tt=T(v.format===Oi,v.type),ie&&(Kt?e.texStorage2D(i.TEXTURE_2D,1,Tt,st.width,st.height):e.texImage2D(i.TEXTURE_2D,0,Tt,st.width,st.height,0,bt,kt,null));else if(v.isDataTexture)if(Xt.length>0){Kt&&ie&&e.texStorage2D(i.TEXTURE_2D,vt,Tt,Xt[0].width,Xt[0].height);for(let it=0,wt=Xt.length;it<wt;it++)Et=Xt[it],Kt?B&&e.texSubImage2D(i.TEXTURE_2D,it,0,0,Et.width,Et.height,bt,kt,Et.data):e.texImage2D(i.TEXTURE_2D,it,Tt,Et.width,Et.height,0,bt,kt,Et.data);v.generateMipmaps=!1}else Kt?(ie&&e.texStorage2D(i.TEXTURE_2D,vt,Tt,st.width,st.height),B&&tt(v,st,bt,kt)):e.texImage2D(i.TEXTURE_2D,0,Tt,st.width,st.height,0,bt,kt,st.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){Kt&&ie&&e.texStorage3D(i.TEXTURE_2D_ARRAY,vt,Tt,Xt[0].width,Xt[0].height,st.depth);for(let it=0,wt=Xt.length;it<wt;it++)if(Et=Xt[it],v.format!==Pn)if(bt!==null)if(Kt){if(B)if(v.layerUpdates.size>0){let Pt=Xl(Et.width,Et.height,v.format,v.type);for(let ht of v.layerUpdates){let zt=Et.data.subarray(ht*Pt/Et.data.BYTES_PER_ELEMENT,(ht+1)*Pt/Et.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,it,0,0,ht,Et.width,Et.height,1,bt,zt)}v.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,it,0,0,0,Et.width,Et.height,st.depth,bt,Et.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,it,Tt,Et.width,Et.height,st.depth,0,Et.data,0,0);else Jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Kt?B&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,it,0,0,0,Et.width,Et.height,st.depth,bt,kt,Et.data):e.texImage3D(i.TEXTURE_2D_ARRAY,it,Tt,Et.width,Et.height,st.depth,0,bt,kt,Et.data)}else{Kt&&ie&&e.texStorage2D(i.TEXTURE_2D,vt,Tt,Xt[0].width,Xt[0].height);for(let it=0,wt=Xt.length;it<wt;it++)Et=Xt[it],v.format!==Pn?bt!==null?Kt?B&&e.compressedTexSubImage2D(i.TEXTURE_2D,it,0,0,Et.width,Et.height,bt,Et.data):e.compressedTexImage2D(i.TEXTURE_2D,it,Tt,Et.width,Et.height,0,Et.data):Jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Kt?B&&e.texSubImage2D(i.TEXTURE_2D,it,0,0,Et.width,Et.height,bt,kt,Et.data):e.texImage2D(i.TEXTURE_2D,it,Tt,Et.width,Et.height,0,bt,kt,Et.data)}else if(v.isDataArrayTexture)if(Kt){if(ie&&e.texStorage3D(i.TEXTURE_2D_ARRAY,vt,Tt,st.width,st.height,st.depth),B)if(v.layerUpdates.size>0){let it=Xl(st.width,st.height,v.format,v.type);for(let wt of v.layerUpdates){let Pt=st.data.subarray(wt*it/st.data.BYTES_PER_ELEMENT,(wt+1)*it/st.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,wt,st.width,st.height,1,bt,kt,Pt)}v.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,st.width,st.height,st.depth,bt,kt,st.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Tt,st.width,st.height,st.depth,0,bt,kt,st.data);else if(v.isData3DTexture)Kt?(ie&&e.texStorage3D(i.TEXTURE_3D,vt,Tt,st.width,st.height,st.depth),B&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,st.width,st.height,st.depth,bt,kt,st.data)):e.texImage3D(i.TEXTURE_3D,0,Tt,st.width,st.height,st.depth,0,bt,kt,st.data);else if(v.isFramebufferTexture){if(ie)if(Kt)e.texStorage2D(i.TEXTURE_2D,vt,Tt,st.width,st.height);else{let it=st.width,wt=st.height;for(let Pt=0;Pt<vt;Pt++)e.texImage2D(i.TEXTURE_2D,Pt,Tt,it,wt,0,bt,kt,null),it>>=1,wt>>=1}}else if(v.isHTMLTexture){if("texElementImage2D"in i){let it=i.canvas;if(it.hasAttribute("layoutsubtree")||it.setAttribute("layoutsubtree","true"),st.parentNode!==it){it.appendChild(st),d.add(v),it.onpaint=wt=>{let Pt=wt.changedElements;for(let ht of d)Pt.includes(ht.image)&&(ht.needsUpdate=!0)},it.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,st);else{let Pt=i.RGBA,ht=i.RGBA,zt=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Pt,ht,zt,st)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Xt.length>0){if(Kt&&ie){let it=ce(Xt[0]);e.texStorage2D(i.TEXTURE_2D,vt,Tt,it.width,it.height)}for(let it=0,wt=Xt.length;it<wt;it++)Et=Xt[it],Kt?B&&e.texSubImage2D(i.TEXTURE_2D,it,0,0,bt,kt,Et):e.texImage2D(i.TEXTURE_2D,it,Tt,bt,kt,Et);v.generateMipmaps=!1}else if(Kt){if(ie){let it=ce(st);e.texStorage2D(i.TEXTURE_2D,vt,Tt,it.width,it.height)}B&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,bt,kt,st)}else e.texImage2D(i.TEXTURE_2D,0,Tt,bt,kt,st);m(v)&&M(Y),_t.__version=ft.version,v.onUpdate&&v.onUpdate(v)}I.__version=v.version}function yt(I,v,V){if(v.image.length!==6)return;let Y=k(I,v),Q=v.source;e.bindTexture(i.TEXTURE_CUBE_MAP,I.__webglTexture,i.TEXTURE0+V);let ft=n.get(Q);if(Q.version!==ft.__version||Y===!0){e.activeTexture(i.TEXTURE0+V);let _t=he.getPrimaries(he.workingColorSpace),j=v.colorSpace===xi?null:he.getPrimaries(v.colorSpace),st=v.colorSpace===xi||_t===j?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,st);let bt=v.isCompressedTexture||v.image[0].isCompressedTexture,kt=v.image[0]&&v.image[0].isDataTexture,Tt=[];for(let ht=0;ht<6;ht++)!bt&&!kt?Tt[ht]=p(v.image[ht],!0,s.maxCubemapSize):Tt[ht]=kt?v.image[ht].image:v.image[ht],Tt[ht]=pe(v,Tt[ht]);let Et=Tt[0],Xt=r.convert(v.format,v.colorSpace),Kt=r.convert(v.type),ie=x(v.internalFormat,Xt,Kt,v.normalized,v.colorSpace),B=v.isVideoTexture!==!0,vt=ft.__version===void 0||Y===!0,it=Q.dataReady,wt=S(v,Et);rt(i.TEXTURE_CUBE_MAP,v);let Pt;if(bt){B&&vt&&e.texStorage2D(i.TEXTURE_CUBE_MAP,wt,ie,Et.width,Et.height);for(let ht=0;ht<6;ht++){Pt=Tt[ht].mipmaps;for(let zt=0;zt<Pt.length;zt++){let Bt=Pt[zt];v.format!==Pn?Xt!==null?B?it&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,zt,0,0,Bt.width,Bt.height,Xt,Bt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,zt,ie,Bt.width,Bt.height,0,Bt.data):Jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):B?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,zt,0,0,Bt.width,Bt.height,Xt,Kt,Bt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,zt,ie,Bt.width,Bt.height,0,Xt,Kt,Bt.data)}}}else{if(Pt=v.mipmaps,B&&vt){Pt.length>0&&wt++;let ht=ce(Tt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,wt,ie,ht.width,ht.height)}for(let ht=0;ht<6;ht++)if(kt){B?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,0,0,0,Tt[ht].width,Tt[ht].height,Xt,Kt,Tt[ht].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,0,ie,Tt[ht].width,Tt[ht].height,0,Xt,Kt,Tt[ht].data);for(let zt=0;zt<Pt.length;zt++){let Pe=Pt[zt].image[ht].image;B?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,zt+1,0,0,Pe.width,Pe.height,Xt,Kt,Pe.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,zt+1,ie,Pe.width,Pe.height,0,Xt,Kt,Pe.data)}}else{B?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,0,0,0,Xt,Kt,Tt[ht]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,0,ie,Xt,Kt,Tt[ht]);for(let zt=0;zt<Pt.length;zt++){let Bt=Pt[zt];B?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,zt+1,0,0,Xt,Kt,Bt.image[ht]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,zt+1,ie,Xt,Kt,Bt.image[ht])}}}m(v)&&M(i.TEXTURE_CUBE_MAP),ft.__version=Q.version,v.onUpdate&&v.onUpdate(v)}I.__version=v.version}function dt(I,v,V,Y,Q,ft){let _t=r.convert(V.format,V.colorSpace),j=r.convert(V.type),st=x(V.internalFormat,_t,j,V.normalized,V.colorSpace),bt=n.get(v),kt=n.get(V);if(kt.__renderTarget=v,!bt.__hasExternalTextures){let Tt=Math.max(1,v.width>>ft),Et=Math.max(1,v.height>>ft);Q===i.TEXTURE_3D||Q===i.TEXTURE_2D_ARRAY?e.texImage3D(Q,ft,st,Tt,Et,v.depth,0,_t,j,null):e.texImage2D(Q,ft,st,Tt,Et,0,_t,j,null)}e.bindFramebuffer(i.FRAMEBUFFER,I),ee(v)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Y,Q,kt.__webglTexture,0,Qt(v)):(Q===i.TEXTURE_2D||Q>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Q<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,Y,Q,kt.__webglTexture,ft),e.bindFramebuffer(i.FRAMEBUFFER,null)}function Yt(I,v,V){if(i.bindRenderbuffer(i.RENDERBUFFER,I),v.depthBuffer){let Y=v.depthTexture,Q=Y&&Y.isDepthTexture?Y.type:null,ft=T(v.stencilBuffer,Q),_t=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;ee(v)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Qt(v),ft,v.width,v.height):V?i.renderbufferStorageMultisample(i.RENDERBUFFER,Qt(v),ft,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,ft,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,_t,i.RENDERBUFFER,I)}else{let Y=v.textures;for(let Q=0;Q<Y.length;Q++){let ft=Y[Q],_t=r.convert(ft.format,ft.colorSpace),j=r.convert(ft.type),st=x(ft.internalFormat,_t,j,ft.normalized,ft.colorSpace);ee(v)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Qt(v),st,v.width,v.height):V?i.renderbufferStorageMultisample(i.RENDERBUFFER,Qt(v),st,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,st,v.width,v.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Nt(I,v,V){let Y=v.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,I),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let Q=n.get(v.depthTexture);if(Q.__renderTarget=v,(!Q.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),Y){if(Q.__webglInit===void 0&&(Q.__webglInit=!0,v.depthTexture.addEventListener("dispose",R)),Q.__webglTexture===void 0){Q.__webglTexture=i.createTexture(),e.bindTexture(i.TEXTURE_CUBE_MAP,Q.__webglTexture),rt(i.TEXTURE_CUBE_MAP,v.depthTexture);let bt=r.convert(v.depthTexture.format),kt=r.convert(v.depthTexture.type),Tt;v.depthTexture.format===Jn?Tt=i.DEPTH_COMPONENT24:v.depthTexture.format===Oi&&(Tt=i.DEPTH24_STENCIL8);for(let Et=0;Et<6;Et++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Et,0,Tt,v.width,v.height,0,bt,kt,null)}}else G(v.depthTexture,0);let ft=Q.__webglTexture,_t=Qt(v),j=Y?i.TEXTURE_CUBE_MAP_POSITIVE_X+V:i.TEXTURE_2D,st=v.depthTexture.format===Oi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(v.depthTexture.format===Jn)ee(v)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,st,j,ft,0,_t):i.framebufferTexture2D(i.FRAMEBUFFER,st,j,ft,0);else if(v.depthTexture.format===Oi)ee(v)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,st,j,ft,0,_t):i.framebufferTexture2D(i.FRAMEBUFFER,st,j,ft,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function et(I){let v=n.get(I),V=I.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==I.depthTexture){let Y=I.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),Y){let Q=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,Y.removeEventListener("dispose",Q)};Y.addEventListener("dispose",Q),v.__depthDisposeCallback=Q}v.__boundDepthTexture=Y}if(I.depthTexture&&!v.__autoAllocateDepthBuffer)if(V)for(let Y=0;Y<6;Y++)Nt(v.__webglFramebuffer[Y],I,Y);else{let Y=I.texture.mipmaps;Y&&Y.length>0?Nt(v.__webglFramebuffer[0],I,0):Nt(v.__webglFramebuffer,I,0)}else if(V){v.__webglDepthbuffer=[];for(let Y=0;Y<6;Y++)if(e.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[Y]),v.__webglDepthbuffer[Y]===void 0)v.__webglDepthbuffer[Y]=i.createRenderbuffer(),Yt(v.__webglDepthbuffer[Y],I,!1);else{let Q=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ft=v.__webglDepthbuffer[Y];i.bindRenderbuffer(i.RENDERBUFFER,ft),i.framebufferRenderbuffer(i.FRAMEBUFFER,Q,i.RENDERBUFFER,ft)}}else{let Y=I.texture.mipmaps;if(Y&&Y.length>0?e.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=i.createRenderbuffer(),Yt(v.__webglDepthbuffer,I,!1);else{let Q=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ft=v.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ft),i.framebufferRenderbuffer(i.FRAMEBUFFER,Q,i.RENDERBUFFER,ft)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function ot(I,v,V){let Y=n.get(I);v!==void 0&&dt(Y.__webglFramebuffer,I,I.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),V!==void 0&&et(I)}function lt(I){let v=I.texture,V=n.get(I),Y=n.get(v);I.addEventListener("dispose",_);let Q=I.textures,ft=I.isWebGLCubeRenderTarget===!0,_t=Q.length>1;if(_t||(Y.__webglTexture===void 0&&(Y.__webglTexture=i.createTexture()),Y.__version=v.version,o.memory.textures++),ft){V.__webglFramebuffer=[];for(let j=0;j<6;j++)if(v.mipmaps&&v.mipmaps.length>0){V.__webglFramebuffer[j]=[];for(let st=0;st<v.mipmaps.length;st++)V.__webglFramebuffer[j][st]=i.createFramebuffer()}else V.__webglFramebuffer[j]=i.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){V.__webglFramebuffer=[];for(let j=0;j<v.mipmaps.length;j++)V.__webglFramebuffer[j]=i.createFramebuffer()}else V.__webglFramebuffer=i.createFramebuffer();if(_t)for(let j=0,st=Q.length;j<st;j++){let bt=n.get(Q[j]);bt.__webglTexture===void 0&&(bt.__webglTexture=i.createTexture(),o.memory.textures++)}if(I.samples>0&&ee(I)===!1){V.__webglMultisampledFramebuffer=i.createFramebuffer(),V.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,V.__webglMultisampledFramebuffer);for(let j=0;j<Q.length;j++){let st=Q[j];V.__webglColorRenderbuffer[j]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,V.__webglColorRenderbuffer[j]);let bt=r.convert(st.format,st.colorSpace),kt=r.convert(st.type),Tt=x(st.internalFormat,bt,kt,st.normalized,st.colorSpace,I.isXRRenderTarget===!0),Et=Qt(I);i.renderbufferStorageMultisample(i.RENDERBUFFER,Et,Tt,I.width,I.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+j,i.RENDERBUFFER,V.__webglColorRenderbuffer[j])}i.bindRenderbuffer(i.RENDERBUFFER,null),I.depthBuffer&&(V.__webglDepthRenderbuffer=i.createRenderbuffer(),Yt(V.__webglDepthRenderbuffer,I,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ft){e.bindTexture(i.TEXTURE_CUBE_MAP,Y.__webglTexture),rt(i.TEXTURE_CUBE_MAP,v);for(let j=0;j<6;j++)if(v.mipmaps&&v.mipmaps.length>0)for(let st=0;st<v.mipmaps.length;st++)dt(V.__webglFramebuffer[j][st],I,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+j,st);else dt(V.__webglFramebuffer[j],I,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+j,0);m(v)&&M(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(_t){for(let j=0,st=Q.length;j<st;j++){let bt=Q[j],kt=n.get(bt),Tt=i.TEXTURE_2D;(I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(Tt=I.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(Tt,kt.__webglTexture),rt(Tt,bt),dt(V.__webglFramebuffer,I,bt,i.COLOR_ATTACHMENT0+j,Tt,0),m(bt)&&M(Tt)}e.unbindTexture()}else{let j=i.TEXTURE_2D;if((I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(j=I.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(j,Y.__webglTexture),rt(j,v),v.mipmaps&&v.mipmaps.length>0)for(let st=0;st<v.mipmaps.length;st++)dt(V.__webglFramebuffer[st],I,v,i.COLOR_ATTACHMENT0,j,st);else dt(V.__webglFramebuffer,I,v,i.COLOR_ATTACHMENT0,j,0);m(v)&&M(j),e.unbindTexture()}I.depthBuffer&&et(I)}function St(I){let v=I.textures;for(let V=0,Y=v.length;V<Y;V++){let Q=v[V];if(m(Q)){let ft=b(I),_t=n.get(Q).__webglTexture;e.bindTexture(ft,_t),M(ft),e.unbindTexture()}}}let Mt=[],Zt=[];function Ht(I){if(I.samples>0){if(ee(I)===!1){let v=I.textures,V=I.width,Y=I.height,Q=i.COLOR_BUFFER_BIT,ft=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,_t=n.get(I),j=v.length>1;if(j)for(let bt=0;bt<v.length;bt++)e.bindFramebuffer(i.FRAMEBUFFER,_t.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+bt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,_t.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+bt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,_t.__webglMultisampledFramebuffer);let st=I.texture.mipmaps;st&&st.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,_t.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,_t.__webglFramebuffer);for(let bt=0;bt<v.length;bt++){if(I.resolveDepthBuffer&&(I.depthBuffer&&(Q|=i.DEPTH_BUFFER_BIT),I.stencilBuffer&&I.resolveStencilBuffer&&(Q|=i.STENCIL_BUFFER_BIT)),j){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,_t.__webglColorRenderbuffer[bt]);let kt=n.get(v[bt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,kt,0)}i.blitFramebuffer(0,0,V,Y,0,0,V,Y,Q,i.NEAREST),c===!0&&(Mt.length=0,Zt.length=0,Mt.push(i.COLOR_ATTACHMENT0+bt),I.depthBuffer&&I.resolveDepthBuffer===!1&&(Mt.push(ft),Zt.push(ft),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Zt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Mt))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),j)for(let bt=0;bt<v.length;bt++){e.bindFramebuffer(i.FRAMEBUFFER,_t.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+bt,i.RENDERBUFFER,_t.__webglColorRenderbuffer[bt]);let kt=n.get(v[bt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,_t.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+bt,i.TEXTURE_2D,kt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,_t.__webglMultisampledFramebuffer)}else if(I.depthBuffer&&I.resolveDepthBuffer===!1&&c){let v=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[v])}}}function Qt(I){return Math.min(s.maxSamples,I.samples)}function ee(I){let v=n.get(I);return I.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function F(I){let v=o.render.frame;h.get(I)!==v&&(h.set(I,v),I.update())}function pe(I,v){let V=I.colorSpace,Y=I.format,Q=I.type;return I.isCompressedTexture===!0||I.isVideoTexture===!0||V!==ar&&V!==xi&&(he.getTransfer(V)===de?(Y!==Pn||Q!==pn)&&Jt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):$t("WebGLTextures: Unsupported texture color space:",V)),v}function ce(I){return typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement?(l.width=I.naturalWidth||I.width,l.height=I.naturalHeight||I.height):typeof VideoFrame<"u"&&I instanceof VideoFrame?(l.width=I.displayWidth,l.height=I.displayHeight):(l.width=I.width,l.height=I.height),l}this.allocateTextureUnit=N,this.resetTextureUnits=O,this.getTextureUnits=z,this.setTextureUnits=L,this.setTexture2D=G,this.setTexture2DArray=Z,this.setTexture3D=q,this.setTextureCube=J,this.rebindTextures=ot,this.setupRenderTarget=lt,this.updateRenderTargetMipmap=St,this.updateMultisampleRenderTarget=Ht,this.setupDepthRenderbuffer=et,this.setupFrameBufferTexture=dt,this.useMultisampledRTT=ee,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function d_(i,t){function e(n,s=xi){let r,o=he.getTransfer(s);if(n===pn)return i.UNSIGNED_BYTE;if(n===Ea)return i.UNSIGNED_SHORT_4_4_4_4;if(n===wa)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Nl)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Fl)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Dl)return i.BYTE;if(n===Ul)return i.SHORT;if(n===Os)return i.UNSIGNED_SHORT;if(n===ba)return i.INT;if(n===kn)return i.UNSIGNED_INT;if(n===In)return i.FLOAT;if(n===ei)return i.HALF_FLOAT;if(n===Bl)return i.ALPHA;if(n===Ol)return i.RGB;if(n===Pn)return i.RGBA;if(n===Jn)return i.DEPTH_COMPONENT;if(n===Oi)return i.DEPTH_STENCIL;if(n===Ta)return i.RED;if(n===Aa)return i.RED_INTEGER;if(n===zi)return i.RG;if(n===Ra)return i.RG_INTEGER;if(n===Ca)return i.RGBA_INTEGER;if(n===kr||n===Gr||n===Vr||n===Wr)if(o===de)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===kr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Gr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Vr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Wr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===kr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Gr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Vr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Wr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ia||n===Pa||n===La||n===Da)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ia)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Pa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===La)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Da)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ua||n===Na||n===Fa||n===Ba||n===Oa||n===Xr||n===za)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Ua||n===Na)return o===de?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Fa)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Ba)return r.COMPRESSED_R11_EAC;if(n===Oa)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Xr)return r.COMPRESSED_RG11_EAC;if(n===za)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Ha||n===ka||n===Ga||n===Va||n===Wa||n===Xa||n===qa||n===Ya||n===Za||n===$a||n===Ja||n===Ka||n===Qa||n===ja)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ha)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ka)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ga)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Va)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Wa)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Xa)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===qa)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ya)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Za)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===$a)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ja)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ka)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Qa)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===ja)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===tc||n===ec||n===nc)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===tc)return o===de?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===ec)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===nc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===ic||n===sc||n===qr||n===rc)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===ic)return r.COMPRESSED_RED_RGTC1_EXT;if(n===sc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===qr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===rc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===zs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var f_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,p_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,rh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new yr(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new ln({vertexShader:f_,fragmentShader:p_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new pt(new be(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},oh=class extends Kn{constructor(t,e){super();let n=this,s=null,r=1,o=null,a="local-floor",c=1,l=null,h=null,d=null,u=null,f=null,g=null,y=typeof XRWebGLBinding<"u",p=new rh,m={},M=e.getContextAttributes(),b=null,x=null,T=[],S=[],R=new xt,_=null,E=new sn;E.viewport=new we;let w=new sn;w.viewport=new we;let C=[E,w],P=new xa,O=null,z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(k){let nt=T[k];return nt===void 0&&(nt=new Is,T[k]=nt),nt.getTargetRaySpace()},this.getControllerGrip=function(k){let nt=T[k];return nt===void 0&&(nt=new Is,T[k]=nt),nt.getGripSpace()},this.getHand=function(k){let nt=T[k];return nt===void 0&&(nt=new Is,T[k]=nt),nt.getHandSpace()};function L(k){let nt=S.indexOf(k.inputSource);if(nt===-1)return;let tt=T[nt];tt!==void 0&&(tt.update(k.inputSource,k.frame,l||o),tt.dispatchEvent({type:k.type,data:k.inputSource}))}function N(){s.removeEventListener("select",L),s.removeEventListener("selectstart",L),s.removeEventListener("selectend",L),s.removeEventListener("squeeze",L),s.removeEventListener("squeezestart",L),s.removeEventListener("squeezeend",L),s.removeEventListener("end",N),s.removeEventListener("inputsourceschange",U);for(let k=0;k<T.length;k++){let nt=S[k];nt!==null&&(S[k]=null,T[k].disconnect(nt))}O=null,z=null,p.reset();for(let k in m)delete m[k];t.setRenderTarget(b),f=null,u=null,d=null,s=null,x=null,rt.stop(),n.isPresenting=!1,t.setPixelRatio(_),t.setSize(R.width,R.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(k){r=k,n.isPresenting===!0&&Jt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(k){a=k,n.isPresenting===!0&&Jt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(k){l=k},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return d===null&&y&&(d=new XRWebGLBinding(s,e)),d},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(k){if(s=k,s!==null){if(b=t.getRenderTarget(),s.addEventListener("select",L),s.addEventListener("selectstart",L),s.addEventListener("selectend",L),s.addEventListener("squeeze",L),s.addEventListener("squeezestart",L),s.addEventListener("squeezeend",L),s.addEventListener("end",N),s.addEventListener("inputsourceschange",U),M.xrCompatible!==!0&&await e.makeXRCompatible(),_=t.getPixelRatio(),t.getSize(R),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let tt=null,gt=null,yt=null;M.depth&&(yt=M.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,tt=M.stencil?Oi:Jn,gt=M.stencil?zs:kn);let dt={colorFormat:e.RGBA8,depthFormat:yt,scaleFactor:r};d=this.getBinding(),u=d.createProjectionLayer(dt),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),x=new yn(u.textureWidth,u.textureHeight,{format:Pn,type:pn,depthTexture:new mi(u.textureWidth,u.textureHeight,gt,void 0,void 0,void 0,void 0,void 0,void 0,tt),stencilBuffer:M.stencil,colorSpace:t.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}else{let tt={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,e,tt),s.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),x=new yn(f.framebufferWidth,f.framebufferHeight,{format:Pn,type:pn,colorSpace:t.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await s.requestReferenceSpace(a),rt.setContext(s),rt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function U(k){for(let nt=0;nt<k.removed.length;nt++){let tt=k.removed[nt],gt=S.indexOf(tt);gt>=0&&(S[gt]=null,T[gt].disconnect(tt))}for(let nt=0;nt<k.added.length;nt++){let tt=k.added[nt],gt=S.indexOf(tt);if(gt===-1){for(let dt=0;dt<T.length;dt++)if(dt>=S.length){S.push(tt),gt=dt;break}else if(S[dt]===null){S[dt]=tt,gt=dt;break}if(gt===-1)break}let yt=T[gt];yt&&yt.connect(tt)}}let G=new D,Z=new D;function q(k,nt,tt){G.setFromMatrixPosition(nt.matrixWorld),Z.setFromMatrixPosition(tt.matrixWorld);let gt=G.distanceTo(Z),yt=nt.projectionMatrix.elements,dt=tt.projectionMatrix.elements,Yt=yt[14]/(yt[10]-1),Nt=yt[14]/(yt[10]+1),et=(yt[9]+1)/yt[5],ot=(yt[9]-1)/yt[5],lt=(yt[8]-1)/yt[0],St=(dt[8]+1)/dt[0],Mt=Yt*lt,Zt=Yt*St,Ht=gt/(-lt+St),Qt=Ht*-lt;if(nt.matrixWorld.decompose(k.position,k.quaternion,k.scale),k.translateX(Qt),k.translateZ(Ht),k.matrixWorld.compose(k.position,k.quaternion,k.scale),k.matrixWorldInverse.copy(k.matrixWorld).invert(),yt[10]===-1)k.projectionMatrix.copy(nt.projectionMatrix),k.projectionMatrixInverse.copy(nt.projectionMatrixInverse);else{let ee=Yt+Ht,F=Nt+Ht,pe=Mt-Qt,ce=Zt+(gt-Qt),I=et*Nt/F*ee,v=ot*Nt/F*ee;k.projectionMatrix.makePerspective(pe,ce,I,v,ee,F),k.projectionMatrixInverse.copy(k.projectionMatrix).invert()}}function J(k,nt){nt===null?k.matrixWorld.copy(k.matrix):k.matrixWorld.multiplyMatrices(nt.matrixWorld,k.matrix),k.matrixWorldInverse.copy(k.matrixWorld).invert()}this.updateCamera=function(k){if(s===null)return;let nt=k.near,tt=k.far;p.texture!==null&&(p.depthNear>0&&(nt=p.depthNear),p.depthFar>0&&(tt=p.depthFar)),P.near=w.near=E.near=nt,P.far=w.far=E.far=tt,(O!==P.near||z!==P.far)&&(s.updateRenderState({depthNear:P.near,depthFar:P.far}),O=P.near,z=P.far),P.layers.mask=k.layers.mask|6,E.layers.mask=P.layers.mask&-5,w.layers.mask=P.layers.mask&-3;let gt=k.parent,yt=P.cameras;J(P,gt);for(let dt=0;dt<yt.length;dt++)J(yt[dt],gt);yt.length===2?q(P,E,w):P.projectionMatrix.copy(E.projectionMatrix),K(k,P,gt)};function K(k,nt,tt){tt===null?k.matrix.copy(nt.matrixWorld):(k.matrix.copy(tt.matrixWorld),k.matrix.invert(),k.matrix.multiply(nt.matrixWorld)),k.matrix.decompose(k.position,k.quaternion,k.scale),k.updateMatrixWorld(!0),k.projectionMatrix.copy(nt.projectionMatrix),k.projectionMatrixInverse.copy(nt.projectionMatrixInverse),k.isPerspectiveCamera&&(k.fov=qo*2*Math.atan(1/k.projectionMatrix.elements[5]),k.zoom=1)}this.getCamera=function(){return P},this.getFoveation=function(){if(!(u===null&&f===null))return c},this.setFoveation=function(k){c=k,u!==null&&(u.fixedFoveation=k),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=k)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(P)},this.getCameraTexture=function(k){return m[k]};let ct=null;function mt(k,nt){if(h=nt.getViewerPose(l||o),g=nt,h!==null){let tt=h.views;f!==null&&(t.setRenderTargetFramebuffer(x,f.framebuffer),t.setRenderTarget(x));let gt=!1;tt.length!==P.cameras.length&&(P.cameras.length=0,gt=!0);for(let Nt=0;Nt<tt.length;Nt++){let et=tt[Nt],ot=null;if(f!==null)ot=f.getViewport(et);else{let St=d.getViewSubImage(u,et);ot=St.viewport,Nt===0&&(t.setRenderTargetTextures(x,St.colorTexture,St.depthStencilTexture),t.setRenderTarget(x))}let lt=C[Nt];lt===void 0&&(lt=new sn,lt.layers.enable(Nt),lt.viewport=new we,C[Nt]=lt),lt.matrix.fromArray(et.transform.matrix),lt.matrix.decompose(lt.position,lt.quaternion,lt.scale),lt.projectionMatrix.fromArray(et.projectionMatrix),lt.projectionMatrixInverse.copy(lt.projectionMatrix).invert(),lt.viewport.set(ot.x,ot.y,ot.width,ot.height),Nt===0&&(P.matrix.copy(lt.matrix),P.matrix.decompose(P.position,P.quaternion,P.scale)),gt===!0&&P.cameras.push(lt)}let yt=s.enabledFeatures;if(yt&&yt.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&y){d=n.getBinding();let Nt=d.getDepthInformation(tt[0]);Nt&&Nt.isValid&&Nt.texture&&p.init(Nt,s.renderState)}if(yt&&yt.includes("camera-access")&&y){t.state.unbindTexture(),d=n.getBinding();for(let Nt=0;Nt<tt.length;Nt++){let et=tt[Nt].camera;if(et){let ot=m[et];ot||(ot=new yr,m[et]=ot);let lt=d.getCameraImage(et);ot.sourceTexture=lt}}}}for(let tt=0;tt<T.length;tt++){let gt=S[tt],yt=T[tt];gt!==null&&yt!==void 0&&yt.update(gt,nt,l||o)}ct&&ct(k,nt),nt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:nt}),g=null}let rt=new Md;rt.setAnimationLoop(mt),this.setAnimationLoop=function(k){ct=k},this.dispose=function(){}}},m_=new ne,Ad=new jt;Ad.set(-1,0,0,0,1,0,0,0,1);function g_(i,t){function e(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,Gl(i)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function s(p,m,M,b,x){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?r(p,m):m.isMeshLambertMaterial?(r(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(r(p,m),d(p,m)):m.isMeshPhongMaterial?(r(p,m),h(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(r(p,m),u(p,m),m.isMeshPhysicalMaterial&&f(p,m,x)):m.isMeshMatcapMaterial?(r(p,m),g(p,m)):m.isMeshDepthMaterial?r(p,m):m.isMeshDistanceMaterial?(r(p,m),y(p,m)):m.isMeshNormalMaterial?r(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?c(p,m,M,b):m.isSpriteMaterial?l(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,e(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===Ke&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,e(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===Ke&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,e(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,e(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let M=t.get(m),b=M.envMap,x=M.envMapRotation;b&&(p.envMap.value=b,p.envMapRotation.value.setFromMatrix4(m_.makeRotationFromEuler(x)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(Ad),p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function c(p,m,M,b){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*M,p.scale.value=b*.5,m.map&&(p.map.value=m.map,e(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function l(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function h(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function d(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function u(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function f(p,m,M){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Ke&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=M.texture,p.transmissionSamplerSize.value.set(M.width,M.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function y(p,m){let M=t.get(m).light;p.referencePosition.value.setFromMatrixPosition(M.matrixWorld),p.nearDistance.value=M.shadow.camera.near,p.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function x_(i,t,e,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(x,T){let S=T.program;n.uniformBlockBinding(x,S)}function l(x,T){let S=s[x.id];S===void 0&&(p(x),S=h(x),s[x.id]=S,x.addEventListener("dispose",M));let R=T.program;n.updateUBOMapping(x,R);let _=t.render.frame;r[x.id]!==_&&(u(x),r[x.id]=_)}function h(x){let T=d();x.__bindingPointIndex=T;let S=i.createBuffer(),R=x.__size,_=x.usage;return i.bindBuffer(i.UNIFORM_BUFFER,S),i.bufferData(i.UNIFORM_BUFFER,R,_),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,T,S),S}function d(){for(let x=0;x<a;x++)if(o.indexOf(x)===-1)return o.push(x),x;return $t("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(x){let T=s[x.id],S=x.uniforms,R=x.__cache;i.bindBuffer(i.UNIFORM_BUFFER,T);for(let _=0,E=S.length;_<E;_++){let w=S[_];if(Array.isArray(w))for(let C=0,P=w.length;C<P;C++)f(w[C],_,C,R);else f(w,_,0,R)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(x,T,S,R){if(y(x,T,S,R)===!0){let _=x.__offset,E=x.value;if(Array.isArray(E)){let w=0;for(let C=0;C<E.length;C++){let P=E[C],O=m(P);g(P,x.__data,w),typeof P!="number"&&typeof P!="boolean"&&!P.isMatrix3&&!ArrayBuffer.isView(P)&&(w+=O.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(E,x.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,_,x.__data)}}function g(x,T,S){typeof x=="number"||typeof x=="boolean"?T[0]=x:x.isMatrix3?(T[0]=x.elements[0],T[1]=x.elements[1],T[2]=x.elements[2],T[3]=0,T[4]=x.elements[3],T[5]=x.elements[4],T[6]=x.elements[5],T[7]=0,T[8]=x.elements[6],T[9]=x.elements[7],T[10]=x.elements[8],T[11]=0):ArrayBuffer.isView(x)?T.set(new x.constructor(x.buffer,x.byteOffset,T.length)):x.toArray(T,S)}function y(x,T,S,R){let _=x.value,E=T+"_"+S;if(R[E]===void 0)return typeof _=="number"||typeof _=="boolean"?R[E]=_:ArrayBuffer.isView(_)?R[E]=_.slice():R[E]=_.clone(),!0;{let w=R[E];if(typeof _=="number"||typeof _=="boolean"){if(w!==_)return R[E]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(w.equals(_)===!1)return w.copy(_),!0}}return!1}function p(x){let T=x.uniforms,S=0,R=16;for(let E=0,w=T.length;E<w;E++){let C=Array.isArray(T[E])?T[E]:[T[E]];for(let P=0,O=C.length;P<O;P++){let z=C[P],L=Array.isArray(z.value)?z.value:[z.value];for(let N=0,U=L.length;N<U;N++){let G=L[N],Z=m(G),q=S%R,J=q%Z.boundary,K=q+J;S+=J,K!==0&&R-K<Z.storage&&(S+=R-K),z.__data=new Float32Array(Z.storage/Float32Array.BYTES_PER_ELEMENT),z.__offset=S,S+=Z.storage}}}let _=S%R;return _>0&&(S+=R-_),x.__size=S,x.__cache={},this}function m(x){let T={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(T.boundary=4,T.storage=4):x.isVector2?(T.boundary=8,T.storage=8):x.isVector3||x.isColor?(T.boundary=16,T.storage=12):x.isVector4?(T.boundary=16,T.storage=16):x.isMatrix3?(T.boundary=48,T.storage=48):x.isMatrix4?(T.boundary=64,T.storage=64):x.isTexture?Jt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(x)?(T.boundary=16,T.storage=x.byteLength):Jt("WebGLRenderer: Unsupported uniform value type.",x),T}function M(x){let T=x.target;T.removeEventListener("dispose",M);let S=o.indexOf(T.__bindingPointIndex);o.splice(S,1),i.deleteBuffer(s[T.id]),delete s[T.id],delete r[T.id]}function b(){for(let x in s)i.deleteBuffer(s[x]);o=[],s={},r={}}return{bind:c,update:l,dispose:b}}var __=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),ni=null;function y_(){return ni===null&&(ni=new gr(__,16,16,zi,ei),ni.name="DFG_LUT",ni.minFilter=Je,ni.magFilter=Je,ni.wrapS=$n,ni.wrapT=$n,ni.generateMipmaps=!1,ni.needsUpdate=!0),ni}var uc=class{constructor(t={}){let{canvas:e=Gu(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:f=pn}=t;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=o;let y=f,p=new Set([Ca,Ra,Aa]),m=new Set([pn,kn,Os,zs,Ea,wa]),M=new Uint32Array(4),b=new Int32Array(4),x=new D,T=null,S=null,R=[],_=[],E=null;this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Hn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let w=this,C=!1,P=null,O=null,z=null,L=null;this._outputColorSpace=De;let N=0,U=0,G=null,Z=-1,q=null,J=new we,K=new we,ct=null,mt=new Vt(0),rt=0,k=e.width,nt=e.height,tt=1,gt=null,yt=null,dt=new we(0,0,k,nt),Yt=new we(0,0,k,nt),Nt=!1,et=new Ps,ot=!1,lt=!1,St=new ne,Mt=new D,Zt=new we,Ht={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Qt=!1;function ee(){return G===null?tt:1}let F=n;function pe(A,H){return e.getContext(A,H)}try{let A={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"185"}`),e.addEventListener("webglcontextlost",Pe,!1),e.addEventListener("webglcontextrestored",ve,!1),e.addEventListener("webglcontextcreationerror",Wn,!1),F===null){let H="webgl2";if(F=pe(H,A),F===null)throw pe(H)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(A){throw $t("WebGLRenderer: "+A.message),A}let ce,I,v,V,Y,Q,ft,_t,j,st,bt,kt,Tt,Et,Xt,Kt,ie,B,vt,it,wt,Pt,ht;function zt(){ce=new Tg(F),ce.init(),wt=new d_(F,ce),I=new _g(F,ce,t,wt),v=new h_(F,ce),I.reversedDepthBuffer&&u&&v.buffers.depth.setReversed(!0),O=F.createFramebuffer(),z=F.createFramebuffer(),L=F.createFramebuffer(),V=new Cg(F),Y=new Jx,Q=new u_(F,ce,v,Y,I,wt,V),ft=new wg(w),_t=new Dp(F),Pt=new gg(F,_t),j=new Ag(F,_t,V,Pt),st=new Pg(F,j,_t,Pt,V),B=new Ig(F,I,Q),Xt=new yg(Y),bt=new $x(w,ft,ce,I,Pt,Xt),kt=new g_(w,Y),Tt=new Qx,Et=new s_(ce),ie=new mg(w,ft,v,st,g,c),Kt=new l_(w,st,I),ht=new x_(F,V,I,v),vt=new xg(F,ce,V),it=new Rg(F,ce,V),V.programs=bt.programs,w.capabilities=I,w.extensions=ce,w.properties=Y,w.renderLists=Tt,w.shadowMap=Kt,w.state=v,w.info=V}zt(),y!==pn&&(E=new Dg(y,e.width,e.height,a,s,r));let Bt=new oh(w,F);this.xr=Bt,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){let A=ce.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){let A=ce.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return tt},this.setPixelRatio=function(A){A!==void 0&&(tt=A,this.setSize(k,nt,!1))},this.getSize=function(A){return A.set(k,nt)},this.setSize=function(A,H,$=!0){if(Bt.isPresenting){Jt("WebGLRenderer: Can't change size while VR device is presenting.");return}k=A,nt=H,e.width=Math.floor(A*tt),e.height=Math.floor(H*tt),$===!0&&(e.style.width=A+"px",e.style.height=H+"px"),E!==null&&E.setSize(e.width,e.height),this.setViewport(0,0,A,H)},this.getDrawingBufferSize=function(A){return A.set(k*tt,nt*tt).floor()},this.setDrawingBufferSize=function(A,H,$){k=A,nt=H,tt=$,e.width=Math.floor(A*$),e.height=Math.floor(H*$),this.setViewport(0,0,A,H)},this.setEffects=function(A){if(y===pn){$t("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(A){for(let H=0;H<A.length;H++)if(A[H].isOutputPass===!0){Jt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}E.setEffects(A||[])},this.getCurrentViewport=function(A){return A.copy(J)},this.getViewport=function(A){return A.copy(dt)},this.setViewport=function(A,H,$,W){A.isVector4?dt.set(A.x,A.y,A.z,A.w):dt.set(A,H,$,W),v.viewport(J.copy(dt).multiplyScalar(tt).round())},this.getScissor=function(A){return A.copy(Yt)},this.setScissor=function(A,H,$,W){A.isVector4?Yt.set(A.x,A.y,A.z,A.w):Yt.set(A,H,$,W),v.scissor(K.copy(Yt).multiplyScalar(tt).round())},this.getScissorTest=function(){return Nt},this.setScissorTest=function(A){v.setScissorTest(Nt=A)},this.setOpaqueSort=function(A){gt=A},this.setTransparentSort=function(A){yt=A},this.getClearColor=function(A){return A.copy(ie.getClearColor())},this.setClearColor=function(){ie.setClearColor(...arguments)},this.getClearAlpha=function(){return ie.getClearAlpha()},this.setClearAlpha=function(){ie.setClearAlpha(...arguments)},this.clear=function(A=!0,H=!0,$=!0){let W=0;if(A){let X=!1;if(G!==null){let It=G.texture.format;X=p.has(It)}if(X){let It=G.texture.type,Ft=m.has(It),Rt=ie.getClearColor(),Ot=ie.getClearAlpha(),Gt=Rt.r,se=Rt.g,ae=Rt.b;Ft?(M[0]=Gt,M[1]=se,M[2]=ae,M[3]=Ot,F.clearBufferuiv(F.COLOR,0,M)):(b[0]=Gt,b[1]=se,b[2]=ae,b[3]=Ot,F.clearBufferiv(F.COLOR,0,b))}else W|=F.COLOR_BUFFER_BIT}H&&(W|=F.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),$&&(W|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),W!==0&&F.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(A){A.setRenderer(this),P=A},this.dispose=function(){e.removeEventListener("webglcontextlost",Pe,!1),e.removeEventListener("webglcontextrestored",ve,!1),e.removeEventListener("webglcontextcreationerror",Wn,!1),ie.dispose(),Tt.dispose(),Et.dispose(),Y.dispose(),ft.dispose(),st.dispose(),Pt.dispose(),ht.dispose(),bt.dispose(),Bt.dispose(),Bt.removeEventListener("sessionstart",Ah),Bt.removeEventListener("sessionend",Rh),Vi.stop()};function Pe(A){A.preventDefault(),Hl("WebGLRenderer: Context Lost."),C=!0}function ve(){Hl("WebGLRenderer: Context Restored."),C=!1;let A=V.autoReset,H=Kt.enabled,$=Kt.autoUpdate,W=Kt.needsUpdate,X=Kt.type;zt(),V.autoReset=A,Kt.enabled=H,Kt.autoUpdate=$,Kt.needsUpdate=W,Kt.type=X}function Wn(A){$t("WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function Xn(A){let H=A.target;H.removeEventListener("dispose",Xn),yf(H)}function yf(A){vf(A),Y.remove(A)}function vf(A){let H=Y.get(A).programs;H!==void 0&&(H.forEach(function($){bt.releaseProgram($)}),A.isShaderMaterial&&bt.releaseShaderCache(A))}this.renderBufferDirect=function(A,H,$,W,X,It){H===null&&(H=Ht);let Ft=X.isMesh&&X.matrixWorld.determinantAffine()<0,Rt=bf(A,H,$,W,X);v.setMaterial(W,Ft);let Ot=$.index,Gt=1;if(W.wireframe===!0){if(Ot=j.getWireframeAttribute($),Ot===void 0)return;Gt=2}let se=$.drawRange,ae=$.attributes.position,Wt=se.start*Gt,me=(se.start+se.count)*Gt;It!==null&&(Wt=Math.max(Wt,It.start*Gt),me=Math.min(me,(It.start+It.count)*Gt)),Ot!==null?(Wt=Math.max(Wt,0),me=Math.min(me,Ot.count)):ae!=null&&(Wt=Math.max(Wt,0),me=Math.min(me,ae.count));let Fe=me-Wt;if(Fe<0||Fe===1/0)return;Pt.setup(X,W,Rt,$,Ot);let Le,_e=vt;if(Ot!==null&&(Le=_t.get(Ot),_e=it,_e.setIndex(Le)),X.isMesh)W.wireframe===!0?(v.setLineWidth(W.wireframeLinewidth*ee()),_e.setMode(F.LINES)):_e.setMode(F.TRIANGLES);else if(X.isLine){let tn=W.linewidth;tn===void 0&&(tn=1),v.setLineWidth(tn*ee()),X.isLineSegments?_e.setMode(F.LINES):X.isLineLoop?_e.setMode(F.LINE_LOOP):_e.setMode(F.LINE_STRIP)}else X.isPoints?_e.setMode(F.POINTS):X.isSprite&&_e.setMode(F.TRIANGLES);if(X.isBatchedMesh)if(ce.get("WEBGL_multi_draw"))_e.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{let tn=X._multiDrawStarts,Ut=X._multiDrawCounts,gn=X._multiDrawCount,ue=Ot?_t.get(Ot).bytesPerElement:1,Tn=Y.get(W).currentProgram.getUniforms();for(let qn=0;qn<gn;qn++)Tn.setValue(F,"_gl_DrawID",qn),_e.render(tn[qn]/ue,Ut[qn])}else if(X.isInstancedMesh)_e.renderInstances(Wt,Fe,X.count);else if($.isInstancedBufferGeometry){let tn=$._maxInstanceCount!==void 0?$._maxInstanceCount:1/0,Ut=Math.min($.instanceCount,tn);_e.renderInstances(Wt,Fe,Ut)}else _e.render(Wt,Fe)};function Th(A,H,$){A.transparent===!0&&A.side===Ce&&A.forceSinglePass===!1?(A.side=Ke,A.needsUpdate=!0,lo(A,H,$),A.side=fi,A.needsUpdate=!0,lo(A,H,$),A.side=Ce):lo(A,H,$)}this.compile=function(A,H,$=null){$===null&&($=A),S=Et.get($),S.init(H),_.push(S),$.traverseVisible(function(X){X.isLight&&X.layers.test(H.layers)&&(S.pushLight(X),X.castShadow&&S.pushShadow(X))}),A!==$&&A.traverseVisible(function(X){X.isLight&&X.layers.test(H.layers)&&(S.pushLight(X),X.castShadow&&S.pushShadow(X))}),S.setupLights();let W=new Set;return A.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;let It=X.material;if(It)if(Array.isArray(It))for(let Ft=0;Ft<It.length;Ft++){let Rt=It[Ft];Th(Rt,$,X),W.add(Rt)}else Th(It,$,X),W.add(It)}),S=_.pop(),W},this.compileAsync=function(A,H,$=null){let W=this.compile(A,H,$);return new Promise(X=>{function It(){if(W.forEach(function(Ft){Y.get(Ft).currentProgram.isReady()&&W.delete(Ft)}),W.size===0){X(A);return}setTimeout(It,10)}ce.get("KHR_parallel_shader_compile")!==null?It():setTimeout(It,10)})};let Dc=null;function Mf(A){Dc&&Dc(A)}function Ah(){Vi.stop()}function Rh(){Vi.start()}let Vi=new Md;Vi.setAnimationLoop(Mf),typeof self<"u"&&Vi.setContext(self),this.setAnimationLoop=function(A){Dc=A,Bt.setAnimationLoop(A),A===null?Vi.stop():Vi.start()},Bt.addEventListener("sessionstart",Ah),Bt.addEventListener("sessionend",Rh),this.render=function(A,H){if(H!==void 0&&H.isCamera!==!0){$t("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;P!==null&&P.renderStart(A,H);let $=Bt.enabled===!0&&Bt.isPresenting===!0,W=E!==null&&(G===null||$)&&E.begin(w,G);if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),H.parent===null&&H.matrixWorldAutoUpdate===!0&&H.updateMatrixWorld(),Bt.enabled===!0&&Bt.isPresenting===!0&&(E===null||E.isCompositing()===!1)&&(Bt.cameraAutoUpdate===!0&&Bt.updateCamera(H),H=Bt.getCamera()),A.isScene===!0&&A.onBeforeRender(w,A,H,G),S=Et.get(A,_.length),S.init(H),S.state.textureUnits=Q.getTextureUnits(),_.push(S),St.multiplyMatrices(H.projectionMatrix,H.matrixWorldInverse),et.setFromProjectionMatrix(St,zn,H.reversedDepth),lt=this.localClippingEnabled,ot=Xt.init(this.clippingPlanes,lt),T=Tt.get(A,R.length),T.init(),R.push(T),Bt.enabled===!0&&Bt.isPresenting===!0){let Ft=w.xr.getDepthSensingMesh();Ft!==null&&Uc(Ft,H,-1/0,w.sortObjects)}Uc(A,H,0,w.sortObjects),T.finish(),w.sortObjects===!0&&T.sort(gt,yt,H.reversedDepth),Qt=Bt.enabled===!1||Bt.isPresenting===!1||Bt.hasDepthSensing()===!1,Qt&&ie.addToRenderList(T,A),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ot===!0&&Xt.beginShadows();let X=S.state.shadowsArray;if(Kt.render(X,A,H),ot===!0&&Xt.endShadows(),(W&&E.hasRenderPass())===!1){let Ft=T.opaque,Rt=T.transmissive;if(S.setupLights(),H.isArrayCamera){let Ot=H.cameras;if(Rt.length>0)for(let Gt=0,se=Ot.length;Gt<se;Gt++){let ae=Ot[Gt];Ih(Ft,Rt,A,ae)}Qt&&ie.render(A);for(let Gt=0,se=Ot.length;Gt<se;Gt++){let ae=Ot[Gt];Ch(T,A,ae,ae.viewport)}}else Rt.length>0&&Ih(Ft,Rt,A,H),Qt&&ie.render(A),Ch(T,A,H)}G!==null&&U===0&&(Q.updateMultisampleRenderTarget(G),Q.updateRenderTargetMipmap(G)),W&&E.end(w),A.isScene===!0&&A.onAfterRender(w,A,H),Pt.resetDefaultState(),Z=-1,q=null,_.pop(),_.length>0?(S=_[_.length-1],Q.setTextureUnits(S.state.textureUnits),ot===!0&&Xt.setGlobalState(w.clippingPlanes,S.state.camera)):S=null,R.pop(),R.length>0?T=R[R.length-1]:T=null,P!==null&&P.renderEnd()};function Uc(A,H,$,W){if(A.visible===!1)return;if(A.layers.test(H.layers)){if(A.isGroup)$=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(H);else if(A.isLightProbeGrid)S.pushLightProbeGrid(A);else if(A.isLight)S.pushLight(A),A.castShadow&&S.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||et.intersectsSprite(A)){W&&Zt.setFromMatrixPosition(A.matrixWorld).applyMatrix4(St);let Ft=st.update(A),Rt=A.material;Rt.visible&&T.push(A,Ft,Rt,$,Zt.z,null)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||et.intersectsObject(A))){let Ft=st.update(A),Rt=A.material;if(W&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),Zt.copy(A.boundingSphere.center)):(Ft.boundingSphere===null&&Ft.computeBoundingSphere(),Zt.copy(Ft.boundingSphere.center)),Zt.applyMatrix4(A.matrixWorld).applyMatrix4(St)),Array.isArray(Rt)){let Ot=Ft.groups;for(let Gt=0,se=Ot.length;Gt<se;Gt++){let ae=Ot[Gt],Wt=Rt[ae.materialIndex];Wt&&Wt.visible&&T.push(A,Ft,Wt,$,Zt.z,ae)}}else Rt.visible&&T.push(A,Ft,Rt,$,Zt.z,null)}}let It=A.children;for(let Ft=0,Rt=It.length;Ft<Rt;Ft++)Uc(It[Ft],H,$,W)}function Ch(A,H,$,W){let{opaque:X,transmissive:It,transparent:Ft}=A;S.setupLightsView($),ot===!0&&Xt.setGlobalState(w.clippingPlanes,$),W&&v.viewport(J.copy(W)),X.length>0&&co(X,H,$),It.length>0&&co(It,H,$),Ft.length>0&&co(Ft,H,$),v.buffers.depth.setTest(!0),v.buffers.depth.setMask(!0),v.buffers.color.setMask(!0),v.setPolygonOffset(!1)}function Ih(A,H,$,W){if(($.isScene===!0?$.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[W.id]===void 0){let Wt=ce.has("EXT_color_buffer_half_float")||ce.has("EXT_color_buffer_float");S.state.transmissionRenderTarget[W.id]=new yn(1,1,{generateMipmaps:!0,type:Wt?ei:pn,minFilter:ti,samples:Math.max(4,I.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:he.workingColorSpace})}let It=S.state.transmissionRenderTarget[W.id],Ft=W.viewport||J;It.setSize(Ft.z*w.transmissionResolutionScale,Ft.w*w.transmissionResolutionScale);let Rt=w.getRenderTarget(),Ot=w.getActiveCubeFace(),Gt=w.getActiveMipmapLevel();w.setRenderTarget(It),w.getClearColor(mt),rt=w.getClearAlpha(),rt<1&&w.setClearColor(16777215,.5),w.clear(),Qt&&ie.render($);let se=w.toneMapping;w.toneMapping=Hn;let ae=W.viewport;if(W.viewport!==void 0&&(W.viewport=void 0),S.setupLightsView(W),ot===!0&&Xt.setGlobalState(w.clippingPlanes,W),co(A,$,W),Q.updateMultisampleRenderTarget(It),Q.updateRenderTargetMipmap(It),ce.has("WEBGL_multisampled_render_to_texture")===!1){let Wt=!1;for(let me=0,Fe=H.length;me<Fe;me++){let Le=H[me],{object:_e,geometry:tn,material:Ut,group:gn}=Le;if(Ut.side===Ce&&_e.layers.test(W.layers)){let ue=Ut.side;Ut.side=Ke,Ut.needsUpdate=!0,Ph(_e,$,W,tn,Ut,gn),Ut.side=ue,Ut.needsUpdate=!0,Wt=!0}}Wt===!0&&(Q.updateMultisampleRenderTarget(It),Q.updateRenderTargetMipmap(It))}w.setRenderTarget(Rt,Ot,Gt),w.setClearColor(mt,rt),ae!==void 0&&(W.viewport=ae),w.toneMapping=se}function co(A,H,$){let W=H.isScene===!0?H.overrideMaterial:null;for(let X=0,It=A.length;X<It;X++){let Ft=A[X],{object:Rt,geometry:Ot,group:Gt}=Ft,se=Ft.material;se.allowOverride===!0&&W!==null&&(se=W),Rt.layers.test($.layers)&&Ph(Rt,H,$,Ot,se,Gt)}}function Ph(A,H,$,W,X,It){A.onBeforeRender(w,H,$,W,X,It),A.modelViewMatrix.multiplyMatrices($.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),X.onBeforeRender(w,H,$,W,A,It),X.transparent===!0&&X.side===Ce&&X.forceSinglePass===!1?(X.side=Ke,X.needsUpdate=!0,w.renderBufferDirect($,H,W,X,A,It),X.side=fi,X.needsUpdate=!0,w.renderBufferDirect($,H,W,X,A,It),X.side=Ce):w.renderBufferDirect($,H,W,X,A,It),A.onAfterRender(w,H,$,W,X,It)}function lo(A,H,$){H.isScene!==!0&&(H=Ht);let W=Y.get(A),X=S.state.lights,It=S.state.shadowsArray,Ft=X.state.version,Rt=bt.getParameters(A,X.state,It,H,$,S.state.lightProbeGridArray),Ot=bt.getProgramCacheKey(Rt),Gt=W.programs;W.environment=A.isMeshStandardMaterial||A.isMeshLambertMaterial||A.isMeshPhongMaterial?H.environment:null,W.fog=H.fog;let se=A.isMeshStandardMaterial||A.isMeshLambertMaterial&&!A.envMap||A.isMeshPhongMaterial&&!A.envMap;W.envMap=ft.get(A.envMap||W.environment,se),W.envMapRotation=W.environment!==null&&A.envMap===null?H.environmentRotation:A.envMapRotation,Gt===void 0&&(A.addEventListener("dispose",Xn),Gt=new Map,W.programs=Gt);let ae=Gt.get(Ot);if(ae!==void 0){if(W.currentProgram===ae&&W.lightsStateVersion===Ft)return Dh(A,Rt),ae}else Rt.uniforms=bt.getUniforms(A),P!==null&&A.isNodeMaterial&&P.build(A,$,Rt),A.onBeforeCompile(Rt,w),ae=bt.acquireProgram(Rt,Ot),Gt.set(Ot,ae),W.uniforms=Rt.uniforms;let Wt=W.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(Wt.clippingPlanes=Xt.uniform),Dh(A,Rt),W.needsLights=wf(A),W.lightsStateVersion=Ft,W.needsLights&&(Wt.ambientLightColor.value=X.state.ambient,Wt.lightProbe.value=X.state.probe,Wt.directionalLights.value=X.state.directional,Wt.directionalLightShadows.value=X.state.directionalShadow,Wt.spotLights.value=X.state.spot,Wt.spotLightShadows.value=X.state.spotShadow,Wt.rectAreaLights.value=X.state.rectArea,Wt.ltc_1.value=X.state.rectAreaLTC1,Wt.ltc_2.value=X.state.rectAreaLTC2,Wt.pointLights.value=X.state.point,Wt.pointLightShadows.value=X.state.pointShadow,Wt.hemisphereLights.value=X.state.hemi,Wt.directionalShadowMatrix.value=X.state.directionalShadowMatrix,Wt.spotLightMatrix.value=X.state.spotLightMatrix,Wt.spotLightMap.value=X.state.spotLightMap,Wt.pointShadowMatrix.value=X.state.pointShadowMatrix),W.lightProbeGrid=S.state.lightProbeGridArray.length>0,W.currentProgram=ae,W.uniformsList=null,ae}function Lh(A){if(A.uniformsList===null){let H=A.currentProgram.getUniforms();A.uniformsList=Gs.seqWithValue(H.seq,A.uniforms)}return A.uniformsList}function Dh(A,H){let $=Y.get(A);$.outputColorSpace=H.outputColorSpace,$.batching=H.batching,$.batchingColor=H.batchingColor,$.instancing=H.instancing,$.instancingColor=H.instancingColor,$.instancingMorph=H.instancingMorph,$.skinning=H.skinning,$.morphTargets=H.morphTargets,$.morphNormals=H.morphNormals,$.morphColors=H.morphColors,$.morphTargetsCount=H.morphTargetsCount,$.numClippingPlanes=H.numClippingPlanes,$.numIntersection=H.numClipIntersection,$.vertexAlphas=H.vertexAlphas,$.vertexTangents=H.vertexTangents,$.toneMapping=H.toneMapping}function Sf(A,H){if(A.length===0)return null;if(A.length===1)return A[0].texture!==null?A[0]:null;x.setFromMatrixPosition(H.matrixWorld);for(let $=0,W=A.length;$<W;$++){let X=A[$];if(X.texture!==null&&X.boundingBox.containsPoint(x))return X}return null}function bf(A,H,$,W,X){H.isScene!==!0&&(H=Ht),Q.resetTextureUnits();let It=H.fog,Ft=W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial?H.environment:null,Rt=G===null?w.outputColorSpace:G.isXRRenderTarget===!0?G.texture.colorSpace:he.workingColorSpace,Ot=W.isMeshStandardMaterial||W.isMeshLambertMaterial&&!W.envMap||W.isMeshPhongMaterial&&!W.envMap,Gt=ft.get(W.envMap||Ft,Ot),se=W.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,ae=!!$.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),Wt=!!$.morphAttributes.position,me=!!$.morphAttributes.normal,Fe=!!$.morphAttributes.color,Le=Hn;W.toneMapped&&(G===null||G.isXRRenderTarget===!0)&&(Le=w.toneMapping);let _e=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,tn=_e!==void 0?_e.length:0,Ut=Y.get(W),gn=S.state.lights;if(ot===!0&&(lt===!0||A!==q)){let Me=A===q&&W.id===Z;Xt.setState(W,A,Me)}let ue=!1;W.version===Ut.__version?(Ut.needsLights&&Ut.lightsStateVersion!==gn.state.version||Ut.outputColorSpace!==Rt||X.isBatchedMesh&&Ut.batching===!1||!X.isBatchedMesh&&Ut.batching===!0||X.isBatchedMesh&&Ut.batchingColor===!0&&X.colorTexture===null||X.isBatchedMesh&&Ut.batchingColor===!1&&X.colorTexture!==null||X.isInstancedMesh&&Ut.instancing===!1||!X.isInstancedMesh&&Ut.instancing===!0||X.isSkinnedMesh&&Ut.skinning===!1||!X.isSkinnedMesh&&Ut.skinning===!0||X.isInstancedMesh&&Ut.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&Ut.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&Ut.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&Ut.instancingMorph===!1&&X.morphTexture!==null||Ut.envMap!==Gt||W.fog===!0&&Ut.fog!==It||Ut.numClippingPlanes!==void 0&&(Ut.numClippingPlanes!==Xt.numPlanes||Ut.numIntersection!==Xt.numIntersection)||Ut.vertexAlphas!==se||Ut.vertexTangents!==ae||Ut.morphTargets!==Wt||Ut.morphNormals!==me||Ut.morphColors!==Fe||Ut.toneMapping!==Le||Ut.morphTargetsCount!==tn||!!Ut.lightProbeGrid!=S.state.lightProbeGridArray.length>0)&&(ue=!0):(ue=!0,Ut.__version=W.version);let Tn=Ut.currentProgram;ue===!0&&(Tn=lo(W,H,X),P&&W.isNodeMaterial&&P.onUpdateProgram(W,Tn,Ut));let qn=!1,vi=!1,ls=!1,ye=Tn.getUniforms(),Be=Ut.uniforms;if(v.useProgram(Tn.program)&&(qn=!0,vi=!0,ls=!0),W.id!==Z&&(Z=W.id,vi=!0),Ut.needsLights){let Me=Sf(S.state.lightProbeGridArray,X);Ut.lightProbeGrid!==Me&&(Ut.lightProbeGrid=Me,vi=!0)}if(qn||q!==A){v.buffers.depth.getReversed()&&A.reversedDepth!==!0&&(A._reversedDepth=!0,A.updateProjectionMatrix()),ye.setValue(F,"projectionMatrix",A.projectionMatrix),ye.setValue(F,"viewMatrix",A.matrixWorldInverse);let Si=ye.map.cameraPosition;Si!==void 0&&Si.setValue(F,Mt.setFromMatrixPosition(A.matrixWorld)),I.logarithmicDepthBuffer&&ye.setValue(F,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&ye.setValue(F,"isOrthographic",A.isOrthographicCamera===!0),q!==A&&(q=A,vi=!0,ls=!0)}if(Ut.needsLights&&(gn.state.directionalShadowMap.length>0&&ye.setValue(F,"directionalShadowMap",gn.state.directionalShadowMap,Q),gn.state.spotShadowMap.length>0&&ye.setValue(F,"spotShadowMap",gn.state.spotShadowMap,Q),gn.state.pointShadowMap.length>0&&ye.setValue(F,"pointShadowMap",gn.state.pointShadowMap,Q)),X.isSkinnedMesh){ye.setOptional(F,X,"bindMatrix"),ye.setOptional(F,X,"bindMatrixInverse");let Me=X.skeleton;Me&&(Me.boneTexture===null&&Me.computeBoneTexture(),ye.setValue(F,"boneTexture",Me.boneTexture,Q))}X.isBatchedMesh&&(ye.setOptional(F,X,"batchingTexture"),ye.setValue(F,"batchingTexture",X._matricesTexture,Q),ye.setOptional(F,X,"batchingIdTexture"),ye.setValue(F,"batchingIdTexture",X._indirectTexture,Q),ye.setOptional(F,X,"batchingColorTexture"),X._colorsTexture!==null&&ye.setValue(F,"batchingColorTexture",X._colorsTexture,Q));let Mi=$.morphAttributes;if((Mi.position!==void 0||Mi.normal!==void 0||Mi.color!==void 0)&&B.update(X,$,Tn),(vi||Ut.receiveShadow!==X.receiveShadow)&&(Ut.receiveShadow=X.receiveShadow,ye.setValue(F,"receiveShadow",X.receiveShadow)),(W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial)&&W.envMap===null&&H.environment!==null&&(Be.envMapIntensity.value=H.environmentIntensity),Be.dfgLUT!==void 0&&(Be.dfgLUT.value=y_()),vi){if(ye.setValue(F,"toneMappingExposure",w.toneMappingExposure),Ut.needsLights&&Ef(Be,ls),It&&W.fog===!0&&kt.refreshFogUniforms(Be,It),kt.refreshMaterialUniforms(Be,W,tt,nt,S.state.transmissionRenderTarget[A.id]),Ut.needsLights&&Ut.lightProbeGrid){let Me=Ut.lightProbeGrid;Be.probesSH.value=Me.texture,Be.probesMin.value.copy(Me.boundingBox.min),Be.probesMax.value.copy(Me.boundingBox.max),Be.probesResolution.value.copy(Me.resolution)}Gs.upload(F,Lh(Ut),Be,Q)}if(W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&(Gs.upload(F,Lh(Ut),Be,Q),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&ye.setValue(F,"center",X.center),ye.setValue(F,"modelViewMatrix",X.modelViewMatrix),ye.setValue(F,"normalMatrix",X.normalMatrix),ye.setValue(F,"modelMatrix",X.matrixWorld),W.uniformsGroups!==void 0){let Me=W.uniformsGroups;for(let Si=0,hs=Me.length;Si<hs;Si++){let Uh=Me[Si];ht.update(Uh,Tn),ht.bind(Uh,Tn)}}return Tn}function Ef(A,H){A.ambientLightColor.needsUpdate=H,A.lightProbe.needsUpdate=H,A.directionalLights.needsUpdate=H,A.directionalLightShadows.needsUpdate=H,A.pointLights.needsUpdate=H,A.pointLightShadows.needsUpdate=H,A.spotLights.needsUpdate=H,A.spotLightShadows.needsUpdate=H,A.rectAreaLights.needsUpdate=H,A.hemisphereLights.needsUpdate=H}function wf(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return N},this.getActiveMipmapLevel=function(){return U},this.getRenderTarget=function(){return G},this.setRenderTargetTextures=function(A,H,$){let W=Y.get(A);W.__autoAllocateDepthBuffer=A.resolveDepthBuffer===!1,W.__autoAllocateDepthBuffer===!1&&(W.__useRenderToTexture=!1),Y.get(A.texture).__webglTexture=H,Y.get(A.depthTexture).__webglTexture=W.__autoAllocateDepthBuffer?void 0:$,W.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(A,H){let $=Y.get(A);$.__webglFramebuffer=H,$.__useDefaultFramebuffer=H===void 0},this.setRenderTarget=function(A,H=0,$=0){G=A,N=H,U=$;let W=null,X=!1,It=!1;if(A){let Rt=Y.get(A);if(Rt.__useDefaultFramebuffer!==void 0){v.bindFramebuffer(F.FRAMEBUFFER,Rt.__webglFramebuffer),J.copy(A.viewport),K.copy(A.scissor),ct=A.scissorTest,v.viewport(J),v.scissor(K),v.setScissorTest(ct),Z=-1;return}else if(Rt.__webglFramebuffer===void 0)Q.setupRenderTarget(A);else if(Rt.__hasExternalTextures)Q.rebindTextures(A,Y.get(A.texture).__webglTexture,Y.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){let se=A.depthTexture;if(Rt.__boundDepthTexture!==se){if(se!==null&&Y.has(se)&&(A.width!==se.image.width||A.height!==se.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Q.setupDepthRenderbuffer(A)}}let Ot=A.texture;(Ot.isData3DTexture||Ot.isDataArrayTexture||Ot.isCompressedArrayTexture)&&(It=!0);let Gt=Y.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(Gt[H])?W=Gt[H][$]:W=Gt[H],X=!0):A.samples>0&&Q.useMultisampledRTT(A)===!1?W=Y.get(A).__webglMultisampledFramebuffer:Array.isArray(Gt)?W=Gt[$]:W=Gt,J.copy(A.viewport),K.copy(A.scissor),ct=A.scissorTest}else J.copy(dt).multiplyScalar(tt).floor(),K.copy(Yt).multiplyScalar(tt).floor(),ct=Nt;if($!==0&&(W=O),v.bindFramebuffer(F.FRAMEBUFFER,W)&&v.drawBuffers(A,W),v.viewport(J),v.scissor(K),v.setScissorTest(ct),X){let Rt=Y.get(A.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+H,Rt.__webglTexture,$)}else if(It){let Rt=H;for(let Ot=0;Ot<A.textures.length;Ot++){let Gt=Y.get(A.textures[Ot]);F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0+Ot,Gt.__webglTexture,$,Rt)}}else if(A!==null&&$!==0){let Rt=Y.get(A.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,Rt.__webglTexture,$)}Z=-1},this.readRenderTargetPixels=function(A,H,$,W,X,It,Ft,Rt=0){if(!(A&&A.isWebGLRenderTarget)){$t("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ot=Y.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Ft!==void 0&&(Ot=Ot[Ft]),Ot){v.bindFramebuffer(F.FRAMEBUFFER,Ot);try{let Gt=A.textures[Rt],se=Gt.format,ae=Gt.type;if(A.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+Rt),!I.textureFormatReadable(se)){$t("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!I.textureTypeReadable(ae)){$t("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}H>=0&&H<=A.width-W&&$>=0&&$<=A.height-X&&F.readPixels(H,$,W,X,wt.convert(se),wt.convert(ae),It)}finally{let Gt=G!==null?Y.get(G).__webglFramebuffer:null;v.bindFramebuffer(F.FRAMEBUFFER,Gt)}}},this.readRenderTargetPixelsAsync=async function(A,H,$,W,X,It,Ft,Rt=0){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ot=Y.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Ft!==void 0&&(Ot=Ot[Ft]),Ot)if(H>=0&&H<=A.width-W&&$>=0&&$<=A.height-X){v.bindFramebuffer(F.FRAMEBUFFER,Ot);let Gt=A.textures[Rt],se=Gt.format,ae=Gt.type;if(A.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+Rt),!I.textureFormatReadable(se))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!I.textureTypeReadable(ae))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Wt=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,Wt),F.bufferData(F.PIXEL_PACK_BUFFER,It.byteLength,F.STREAM_READ),F.readPixels(H,$,W,X,wt.convert(se),wt.convert(ae),0);let me=G!==null?Y.get(G).__webglFramebuffer:null;v.bindFramebuffer(F.FRAMEBUFFER,me);let Fe=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await Wu(F,Fe,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,Wt),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,It),F.deleteBuffer(Wt),F.deleteSync(Fe),It}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(A,H=null,$=0){let W=Math.pow(2,-$),X=Math.floor(A.image.width*W),It=Math.floor(A.image.height*W),Ft=H!==null?H.x:0,Rt=H!==null?H.y:0;Q.setTexture2D(A,0),F.copyTexSubImage2D(F.TEXTURE_2D,$,0,0,Ft,Rt,X,It),v.unbindTexture()},this.copyTextureToTexture=function(A,H,$=null,W=null,X=0,It=0){let Ft,Rt,Ot,Gt,se,ae,Wt,me,Fe,Le=A.isCompressedTexture?A.mipmaps[It]:A.image;if($!==null)Ft=$.max.x-$.min.x,Rt=$.max.y-$.min.y,Ot=$.isBox3?$.max.z-$.min.z:1,Gt=$.min.x,se=$.min.y,ae=$.isBox3?$.min.z:0;else{let Be=Math.pow(2,-X);Ft=Math.floor(Le.width*Be),Rt=Math.floor(Le.height*Be),A.isDataArrayTexture?Ot=Le.depth:A.isData3DTexture?Ot=Math.floor(Le.depth*Be):Ot=1,Gt=0,se=0,ae=0}W!==null?(Wt=W.x,me=W.y,Fe=W.z):(Wt=0,me=0,Fe=0);let _e=wt.convert(H.format),tn=wt.convert(H.type),Ut;H.isData3DTexture?(Q.setTexture3D(H,0),Ut=F.TEXTURE_3D):H.isDataArrayTexture||H.isCompressedArrayTexture?(Q.setTexture2DArray(H,0),Ut=F.TEXTURE_2D_ARRAY):(Q.setTexture2D(H,0),Ut=F.TEXTURE_2D),v.activeTexture(F.TEXTURE0),v.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,H.flipY),v.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,H.premultiplyAlpha),v.pixelStorei(F.UNPACK_ALIGNMENT,H.unpackAlignment);let gn=v.getParameter(F.UNPACK_ROW_LENGTH),ue=v.getParameter(F.UNPACK_IMAGE_HEIGHT),Tn=v.getParameter(F.UNPACK_SKIP_PIXELS),qn=v.getParameter(F.UNPACK_SKIP_ROWS),vi=v.getParameter(F.UNPACK_SKIP_IMAGES);v.pixelStorei(F.UNPACK_ROW_LENGTH,Le.width),v.pixelStorei(F.UNPACK_IMAGE_HEIGHT,Le.height),v.pixelStorei(F.UNPACK_SKIP_PIXELS,Gt),v.pixelStorei(F.UNPACK_SKIP_ROWS,se),v.pixelStorei(F.UNPACK_SKIP_IMAGES,ae);let ls=A.isDataArrayTexture||A.isData3DTexture,ye=H.isDataArrayTexture||H.isData3DTexture;if(A.isDepthTexture){let Be=Y.get(A),Mi=Y.get(H),Me=Y.get(Be.__renderTarget),Si=Y.get(Mi.__renderTarget);v.bindFramebuffer(F.READ_FRAMEBUFFER,Me.__webglFramebuffer),v.bindFramebuffer(F.DRAW_FRAMEBUFFER,Si.__webglFramebuffer);for(let hs=0;hs<Ot;hs++)ls&&(F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Y.get(A).__webglTexture,X,ae+hs),F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Y.get(H).__webglTexture,It,Fe+hs)),F.blitFramebuffer(Gt,se,Ft,Rt,Wt,me,Ft,Rt,F.DEPTH_BUFFER_BIT,F.NEAREST);v.bindFramebuffer(F.READ_FRAMEBUFFER,null),v.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else if(X!==0||A.isRenderTargetTexture||Y.has(A)){let Be=Y.get(A),Mi=Y.get(H);v.bindFramebuffer(F.READ_FRAMEBUFFER,z),v.bindFramebuffer(F.DRAW_FRAMEBUFFER,L);for(let Me=0;Me<Ot;Me++)ls?F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Be.__webglTexture,X,ae+Me):F.framebufferTexture2D(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,Be.__webglTexture,X),ye?F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Mi.__webglTexture,It,Fe+Me):F.framebufferTexture2D(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,Mi.__webglTexture,It),X!==0?F.blitFramebuffer(Gt,se,Ft,Rt,Wt,me,Ft,Rt,F.COLOR_BUFFER_BIT,F.NEAREST):ye?F.copyTexSubImage3D(Ut,It,Wt,me,Fe+Me,Gt,se,Ft,Rt):F.copyTexSubImage2D(Ut,It,Wt,me,Gt,se,Ft,Rt);v.bindFramebuffer(F.READ_FRAMEBUFFER,null),v.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else ye?A.isDataTexture||A.isData3DTexture?F.texSubImage3D(Ut,It,Wt,me,Fe,Ft,Rt,Ot,_e,tn,Le.data):H.isCompressedArrayTexture?F.compressedTexSubImage3D(Ut,It,Wt,me,Fe,Ft,Rt,Ot,_e,Le.data):F.texSubImage3D(Ut,It,Wt,me,Fe,Ft,Rt,Ot,_e,tn,Le):A.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,It,Wt,me,Ft,Rt,_e,tn,Le.data):A.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,It,Wt,me,Le.width,Le.height,_e,Le.data):F.texSubImage2D(F.TEXTURE_2D,It,Wt,me,Ft,Rt,_e,tn,Le);v.pixelStorei(F.UNPACK_ROW_LENGTH,gn),v.pixelStorei(F.UNPACK_IMAGE_HEIGHT,ue),v.pixelStorei(F.UNPACK_SKIP_PIXELS,Tn),v.pixelStorei(F.UNPACK_SKIP_ROWS,qn),v.pixelStorei(F.UNPACK_SKIP_IMAGES,vi),It===0&&H.generateMipmaps&&F.generateMipmap(Ut),v.unbindTexture()},this.initRenderTarget=function(A){Y.get(A).__webglFramebuffer===void 0&&Q.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?Q.setTextureCube(A,0):A.isData3DTexture?Q.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?Q.setTexture2DArray(A,0):Q.setTexture2D(A,0),v.unbindTexture()},this.resetState=function(){N=0,U=0,G=null,v.reset(),Pt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return zn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=he._getDrawingBufferColorSpace(t),e.unpackColorSpace=he._getUnpackColorSpace()}};function v_(i){let t=i>>>0;return()=>{t+=1831565813;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var hn=v_(19870219),at=(i,t)=>i+hn()*(t-i),Ne=i=>i[hn()*i.length|0],Sn=i=>hn()<i,si=i=>"#"+i.toString(16).padStart(6,"0"),Ye={sun:16766116,skyTop:4159147,skyMid:9681362,skyHaze:14472125,cloud:16774112,asphalt:5066580,paver:11577496,kerb:11907236,conc:11052187,trim:14209731,glassBlue:6058371,glassGrey:6976122,leafDark:2833697,leafMid:4875312,leafLight:7768383,trunk:5457981,yellow:14201930};function Ln(i){let t=document.createElement("canvas");return t.width=t.height=i,[t,t.getContext("2d")]}function Dn(i,t,e=!0){let n=new Qn(i);return n.wrapS=n.wrapT=ws,t&&n.repeat.set(t[0],t[1]),e&&(n.colorSpace=De),n.anisotropy=4,n}function Xs(i,t,e,n){for(let s=0;s<t;s++){let r=(hn()*2-1)*e;i.fillStyle=`rgba(${r>0?255:0},${r>0?255:0},${r>0?255:0},${Math.abs(r)/255})`,i.fillRect(hn()*n|0,hn()*n|0,1+(hn()*2|0),1+(hn()*2|0))}}function Rd(){let[t,e]=Ln(256);e.fillStyle=si(Ye.asphalt),e.fillRect(0,0,256,256);for(let n=0;n<5200;n++){let s=at(-24,24);e.fillStyle=`rgba(${128+s},${128+s},${130+s},${at(.05,.24)})`,e.fillRect(at(0,256),at(0,256),at(1,2.6),at(1,2.6))}for(let n=0;n<8;n++){e.strokeStyle=`rgba(28,28,30,${at(.15,.4)})`,e.lineWidth=at(.8,2.4),e.beginPath();let s=at(0,256),r=at(0,256);e.moveTo(s,r);for(let o=0;o<6;o++)s+=at(-40,40),r+=at(-40,40),e.lineTo(s,r);e.stroke()}return Dn(t,[30,30])}function Cd(){let[t,e]=Ln(256);e.fillStyle=si(Ye.paver),e.fillRect(0,0,256,256);let n=3,s=256/n;for(let r=0;r<n;r++)for(let o=0;o<n;o++){let a=at(-13,11);e.fillStyle=`rgb(${178+a},${170+a},${154+a})`,e.fillRect(o*s+1.6,r*s+1.6,s-3.2,s-3.2);for(let c=0;c<260;c++){let l=at(-30,26);e.fillStyle=`rgba(${170+l},${163+l},${148+l},${at(.2,.6)})`,e.fillRect(o*s+at(2,s-3),r*s+at(2,s-3),at(1,2.4),at(1,2.4))}}return Xs(e,2600,18,256),Dn(t,[1,1])}function ki(i,t=.55){let[n,s]=Ln(256);s.fillStyle=si(i),s.fillRect(0,0,256,256);for(let r=0;r<24;r++){let o=at(0,256),a=at(0,256),c=at(18,70),l=s.createRadialGradient(o,a,0,o,a,c);l.addColorStop(0,`rgba(0,0,0,${at(.02,.07)*t})`),l.addColorStop(1,"rgba(0,0,0,0)"),s.fillStyle=l,s.fillRect(0,0,256,256)}for(let r=0;r<34;r++){let o=at(.6,2.6),a=at(30,170),c=at(0,256),l=at(0,256*.5),h=s.createLinearGradient(0,l,0,l+a);h.addColorStop(0,`rgba(54,48,40,${at(.05,.15)*t})`),h.addColorStop(1,"rgba(54,48,40,0)"),s.fillStyle=h,s.fillRect(c,l,o,a)}return Xs(s,4800,24,256),Dn(n,[1,1])}function qs(i,t,e=8){let[s,r]=Ln(256),o=256/e;r.fillStyle=si(i),r.fillRect(0,0,256,256);for(let a=0;a<e;a++){for(let l=0;l<8;l++){let h=at(-26,30);r.fillStyle=`rgba(${118+h},${138+h},${156+h},${at(.25,.75)})`,r.fillRect(l*(256/8)+1,a*o+2,256/8-2,o*.62)}r.fillStyle=si(t),r.fillRect(0,a*o+o*.66,256,o*.3);let c=r.createLinearGradient(0,a*o,0,a*o+o*.62);c.addColorStop(0,"rgba(232,243,251,0.52)"),c.addColorStop(1,"rgba(232,243,251,0.06)"),r.fillStyle=c,r.fillRect(0,a*o+2,256,o*.6)}r.fillStyle=si(t);for(let a=0;a<=8;a++)r.fillRect(a*(256/8)-1.2,0,2.4,256);return Dn(s,[1,1])}function pc(){let[t,e]=Ln(256);e.fillStyle="#2f3438",e.fillRect(0,0,256,256);let n=6,s=256/n;for(let r=0;r<n;r++){let o=at(0,1),a=o>.72?[232,214,178]:o>.4?[206,200,190]:[176,182,186];e.fillStyle=`rgb(${a[0]},${a[1]},${a[2]})`,e.fillRect(r*s+3,16,s-6,194),e.fillStyle=`rgba(40,38,34,${at(.18,.4)})`,e.fillRect(r*s+3,16,s-6,at(20,60));let c=e.createLinearGradient(r*s,0,r*s+s,256);c.addColorStop(0,"rgba(255,255,255,0.22)"),c.addColorStop(.5,"rgba(255,255,255,0.02)"),c.addColorStop(1,"rgba(255,255,255,0.14)"),e.fillStyle=c,e.fillRect(r*s+3,16,s-6,194),e.fillStyle="#23272a",e.fillRect(r*s-2,0,4,256)}return e.fillStyle="#3a3f43",e.fillRect(0,0,256,16),e.fillStyle="#5b5554",e.fillRect(0,210,256,46),Xs(e,1800,16,256),Dn(t,[1,1])}function Id(){let[t,e]=Ln(256);e.fillStyle="#7d4f42",e.fillRect(0,0,256,256);for(let r=0;r<4200;r++){let o=at(-20,22);e.fillStyle=`rgba(${142+o},${94+o},${78+o},${at(.15,.5)})`,e.fillRect(at(0,256),at(0,256),at(1,2.4),at(1,2.4))}let n=9,s=256/n;for(let r=0;r<n;r++){e.fillStyle="rgba(38,44,50,0.86)",e.fillRect(r*s+s*.3,0,s*.4,256);let o=e.createLinearGradient(r*s,0,r*s+s,0);o.addColorStop(0,"rgba(198,214,226,0.16)"),o.addColorStop(1,"rgba(198,214,226,0)"),e.fillStyle=o,e.fillRect(r*s+s*.3,0,s*.4,256)}for(let r=0;r<8;r++)e.fillStyle="rgba(104,68,58,0.9)",e.fillRect(0,r*(256/8)-2,256,4);return Dn(t,[1,1])}function ah(){let[t,e]=Ln(256);e.fillStyle="#8ea6b8",e.fillRect(0,0,256,256);let n=12,s=256/n;for(let r=0;r<n;r++){for(let a=0;a<10;a++){let c=at(-24,26);e.fillStyle=`rgba(${132+c},${154+c},${172+c},${at(.3,.8)})`,e.fillRect(a*(256/10)+1,r*s+1,256/10-2,s*.72)}e.fillStyle="#6b757e",e.fillRect(0,r*s+s*.76,256,s*.22);let o=e.createLinearGradient(0,r*s,0,r*s+s*.72);o.addColorStop(0,"rgba(236,245,252,0.42)"),o.addColorStop(1,"rgba(236,245,252,0.04)"),e.fillStyle=o,e.fillRect(0,r*s+1,256,s*.7)}for(let r=0;r<=10;r++)e.fillStyle="#767f88",e.fillRect(r*(256/10)-1,0,2,256);return Dn(t,[1,1])}function mc(i){let[e,n]=Ln(256);n.fillStyle=si(i),n.fillRect(0,0,256,256);for(let c=0;c<3600;c++){let l=at(-18,16);n.fillStyle=`rgba(${168+l},${160+l},${146+l},${at(.12,.4)})`,n.fillRect(at(0,256),at(0,256),at(1,2.2),at(1,2.2))}let s=7,r=8,o=256/s,a=256/r;for(let c=0;c<r;c++){for(let l=0;l<s;l++){let h=at(0,1);n.fillStyle=h>.8?"#8d9aa2":h>.45?"#4d565e":"#39424a",n.fillRect(l*o+o*.22,c*a+a*.22,o*.56,a*.46),n.fillStyle="rgba(24,26,28,0.42)",n.fillRect(l*o+o*.22,c*a+a*.22,o*.56,a*.09)}n.fillStyle="rgba(150,142,128,0.55)",n.fillRect(0,c*a+a*.74,256,a*.16)}return Xs(n,2400,18,256),Dn(e,[1,1])}function ch(i){let[e,n]=Ln(256);n.fillStyle=si(i),n.fillRect(0,0,256,256);let s=9,r=256/s,o=5,a=256/o;for(let c=0;c<s;c++){for(let l=0;l<o;l++)n.fillStyle="rgba(46,52,58,0.72)",n.fillRect(l*a+a*.14,c*r+r*.16,a*.72,r*.5),n.fillStyle="rgba(226,222,210,0.9)",n.fillRect(l*a+a*.14,c*r+r*.52,a*.72,r*.1);n.fillStyle="rgba(206,200,186,0.85)",n.fillRect(0,c*r+r*.66,256,r*.2)}return Xs(n,2e3,16,256),Dn(e,[1,1])}function Pd(i){let[e,n]=Ln(256);n.fillStyle=si(i),n.fillRect(0,0,256,256);for(let c=0;c<2600;c++){let l=at(-14,12);n.fillStyle=`rgba(${210+l},${204+l},${190+l},${at(.08,.3)})`,n.fillRect(at(0,256),at(0,256),at(1,2.4),at(1,2.4))}let s=3,r=256/s,o=3,a=256/o;for(let c=0;c<s;c++){for(let l=0;l<o;l++)n.fillStyle="#3b4148",n.fillRect(l*a+a*.3,c*r+r*.18,a*.4,r*.5),n.fillStyle="rgba(86,104,74,0.92)",n.fillRect(l*a+a*.19,c*r+r*.18,a*.1,r*.5),n.fillRect(l*a+a*.71,c*r+r*.18,a*.1,r*.5),n.fillStyle="rgba(246,242,232,0.85)",n.fillRect(l*a+a*.16,c*r+r*.12,a*.68,r*.06);n.fillStyle="rgba(248,244,234,0.8)",n.fillRect(0,c*r+r*.78,256,r*.09),n.fillStyle="rgba(150,142,128,0.35)",n.fillRect(0,c*r+r*.87,256,r*.03)}return Xs(n,1500,14,256),Dn(e,[1,1])}function Ld(){let[t,e]=Ln(128);e.clearRect(0,0,128,128);let n=e.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);n.addColorStop(0,"rgba(34,50,25,0.85)"),n.addColorStop(.7,"rgba(34,50,25,0.34)"),n.addColorStop(1,"rgba(34,50,25,0)"),e.fillStyle=n,e.fillRect(0,0,128,128);let s=[Ye.leafDark,Ye.leafDark,Ye.leafMid,Ye.leafMid,Ye.leafLight];for(let r=0;r<460;r++){let o=at(0,128),a=at(0,128),c=Math.hypot(o-128/2,a-128/2)/(128/2);c>.99||hn()<c*c*.9||(e.save(),e.translate(o,a),e.rotate(at(0,Math.PI*2)),e.fillStyle=si(Ne(s)),e.globalAlpha=at(.5,1),e.beginPath(),e.ellipse(0,0,at(2.6,7),at(1,2.1),0,0,Math.PI*2),e.fill(),e.restore())}return Dn(t,null)}function Dd(){let[t,e]=Ln(128),n=e.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);return n.addColorStop(0,"rgba(0,0,0,0.52)"),n.addColorStop(.55,"rgba(0,0,0,0.2)"),n.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=n,e.fillRect(0,0,128,128),Dn(t,null,!1)}function ri(i){let t=0,e=0;for(let[f,g]of i)t+=f,e+=g;t/=i.length,e/=i.length;let n=0,s=0,r=0;for(let[f,g]of i){let y=f-t,p=g-e;n+=y*y,s+=y*p,r+=p*p}let o=.5*Math.atan2(2*s,n-r),a=Math.cos(o),c=Math.sin(o),l=1e9,h=-1e9,d=1e9,u=-1e9;for(let[f,g]of i){let y=f-t,p=g-e,m=y*a+p*c,M=-y*c+p*a;l=Math.min(l,m),h=Math.max(h,m),d=Math.min(d,M),u=Math.max(u,M)}return{cx:t,cz:e,ux:a,uz:c,ang:o,halfLong:(h-l)/2,halfShort:(u-d)/2,midU:(h+l)/2,midV:(u+d)/2}}function mn(i,t,e,n,s,r,o,a,c,l=0){let h=new pt(new ut(s,a,r),c),d=t.cx+t.ux*e-t.uz*n,u=t.cz+t.uz*e+t.ux*n;return h.position.set(d,o+a/2,u),h.rotation.y=-t.ang+l,h.castShadow=!0,h.receiveShadow=!0,i.world.add(h),h}function Ys(i,t,e,n,s,r,o,a){mn(i,t,e,n,s*1.06,r*1.06,o,1.2,a),mn(i,t,e,n,s*.55,r*.55,o+1.2,3,a)}function is(i,t){if(!i.axis)return{nx:0,nz:1,dist:30};let e=0,n=0,s=1/0;for(let[c,l]of i.axis.p){let h=(c-t.cx)**2+(l-t.cz)**2;h<s&&(s=h,e=c,n=l)}let r=e-t.cx,o=n-t.cz,a=Math.hypot(r,o)||1;return{nx:r/a,nz:o/a,dist:a}}function M_(i,t){let e=ri(t.p),n=i.mat.granite,s=i.mat.towerGlass,r=i.mat.paleStone;i.world.add(i.extrude(t.p,30,n)),i.world.add(i.extrude(i.grow(t.p,1.004),1.6,r,30));let o=Math.min(38,e.halfShort*1.05);for(let y of[-1,1]){let p=e.midU+y*e.halfLong*.4;mn(i,e,p,e.midV,o,o,31.6,107,n);for(let m of[-1,1])mn(i,e,p,e.midV+m*(o/2+.15),o*.82,.4,34,100,s);Ys(i,e,p,e.midV,o,o,138.6,r)}let a=is(i,e),c=Math.atan2(a.nx,a.nz),l=e.cx+a.nx*e.halfShort,h=e.cz+a.nz*e.halfShort,d=62,u=0;if(i.clearance)for(let y of[62,52,44,36,28]){let p=i.clearance.outward(l,h,a.nx,a.nz,22,y/2);if(p>=6){d=y,u=Math.min(30,p);break}}else u=17;let f=l+a.nx*(u/2),g=h+a.nz*(u/2);if(u>=6){let y=new pt(new ut(d,.5,u),i.mat.paving);y.position.set(f,.25,g),y.rotation.y=c,y.receiveShadow=!0,i.world.add(y);for(let p=0;p<3;p++){let m=new pt(new ut(d,.18,1.1),i.mat.paleStone);m.position.set(f+a.nx*(u/2+p*1.1),.42-p*.16,g+a.nz*(u/2+p*1.1)),m.rotation.y=c,m.receiveShadow=!0,m.castShadow=!0,i.world.add(m)}for(let p of[-1,1]){let m=new pt(new ut(2.2,.85,u*.88),n);m.position.set(f-a.nz*p*(d/2-2),.68,g+a.nx*p*(d/2-2)),m.rotation.y=c,m.castShadow=!0,m.receiveShadow=!0,i.world.add(m)}}}function S_(i,t){let e=ri(t.p),n=i.mat.towerGlass,s=i.mat.paleStone;i.world.add(i.extrude(t.p,34,n)),i.world.add(i.extrude(i.grow(t.p,1.05),1.1,s,20.5)),i.world.add(i.extrude(i.grow(t.p,1.02),1.4,s,34));let r=Math.min(30,e.halfShort*.75);mn(i,e,e.midU-e.halfLong*.12,e.midV,r,r*.78,35.4,176,n),Ys(i,e,e.midU-e.halfLong*.12,e.midV,r,r*.78,211,s);let o=is(i,e),a=Math.atan2(o.nx,o.nz),c=e.cx+o.nx*e.halfShort,l=e.cz+o.nz*e.halfShort,h=i.clearance?Math.min(5,i.clearance.outward(c,l,o.nx,o.nz,5,22)):4,d=e.cx+o.nx*(e.halfShort+h),u=e.cz+o.nz*(e.halfShort+h),f=new Ct({color:12174537,roughness:.28,metalness:.45,side:Ce}),g=new pt(new qt(17,17,Math.min(74,e.halfLong*1.9),22,1,!0,Math.PI*.06,Math.PI*.62),f);g.rotation.z=Math.PI/2,g.rotation.y=a,g.position.set(d,20.5,u),g.castShadow=!0,i.world.add(g);for(let p of[-1,1]){let m=new pt(new qt(.75,1.9,20,10),f);m.position.set(d-o.nz*p*17,10,u+o.nx*p*17),m.castShadow=!0,i.world.add(m)}let y=new pt(new be(Math.min(58,e.halfLong*1.5),13),new Ct({color:1119772,roughness:.25,emissive:3108776,emissiveIntensity:.85}));y.position.set(e.cx+o.nx*(e.halfShort+.4),12.5,e.cz+o.nz*(e.halfShort+.4)),y.rotation.y=a,i.world.add(y)}function b_(i,t){let e=ri(t.p),n=i.mat.jadeRoof,s=i.mat.warmStone,r=i.mat.towerGlass;i.world.add(i.extrude(t.p,19,s));let o=e.halfShort*2*.98,a=e.halfLong*2*.98,c=new pt(new gi(Math.max(o,a)*.62,9.5,4),n);c.position.set(e.cx,23.6,e.cz),c.rotation.y=-e.ang+Math.PI/4,c.castShadow=!0,i.world.add(c);let l=Math.min(26,e.halfShort*.9),h=e.midU+e.halfLong*.42;mn(i,e,h,e.midV,l,l*.72,19,121,s);for(let y=0;y<30;y++)mn(i,e,h,e.midV-l*.36,l*.9,.25,22+y*3.9,2.3,r);let d=new pt(new fe(1.05,10,8),n);d.position.set(e.cx,28.9,e.cz),d.castShadow=!0,i.world.add(d);let u=new pt(new gi(.42,3.4,8),n);u.position.set(e.cx,31,e.cz),u.castShadow=!0,i.world.add(u);let f=new pt(new gi(Math.max(o,a)*.4,6,4),n);f.position.set(e.cx,27.2,e.cz),f.rotation.y=-e.ang+Math.PI/4,f.castShadow=!0,i.world.add(f);let g=new pt(new gi(l*.75,7,4),n);g.position.set(e.cx+e.ux*h-e.uz*e.midV,143.5,e.cz+e.uz*h+e.ux*e.midV),g.rotation.y=-e.ang+Math.PI/4,g.castShadow=!0,i.world.add(g)}function E_(i,t){let e=ri(t.p),n=i.mat.paleStone,s=i.mat.towerGlass;i.world.add(i.extrude(t.p,26,s));for(let o=0;o<7;o++)i.world.add(i.extrude(i.grow(t.p,1.008),.32,i.mat.trim,4+o*3.4));let r=Math.min(30,e.halfShort*.95);mn(i,e,e.midU+e.halfLong*.25,e.midV,r,r*.8,26,44,s),Ys(i,e,e.midU+e.halfLong*.25,e.midV,r,r*.8,70,n)}function w_(i,t){let e=ri(t.p),n=i.mat.towerGlass,s=i.mat.paleStone;/wisma atria/i.test(t.n||"")&&(n=i.mat.blueGlass);let r=Math.min(30,t.h*.42);if(i.world.add(i.extrude(t.p,r,n)),i.world.add(i.extrude(i.grow(t.p,1.03),1,s,r-1)),t.h>r+12){let o=Math.min(28,e.halfShort*.85);mn(i,e,e.midU,e.midV,o,o*.8,r,t.h-r,n),Ys(i,e,e.midU,e.midV,o,o*.8,t.h,s)}}function T_(i,t){let e=ri(t.p);i.world.add(i.extrude(t.p,t.h,i.mat.warmStone));let n=is(i,e),s=n.nx*-Math.sin(e.ang)+n.nz*Math.cos(e.ang)>=0?1:-1,r=Math.max(5,Math.round(e.halfLong*2/6));for(let o=0;o<=r;o++){let a=e.midU-e.halfLong+o/r*e.halfLong*2;mn(i,e,a,e.midV+s*(e.halfShort+.2),.5,.9,5,t.h-6,i.mat.paleStone)}i.world.add(i.extrude(i.grow(t.p,1.02),1.1,i.mat.trim,t.h))}function A_(i,t){let e=ri(t.p),n=i.mat.towerGlass,s=i.mat.paleStone;i.world.add(i.extrude(t.p,22,n));let r=Math.min(26,e.halfShort*.9);mn(i,e,e.midU,e.midV,r,r*.82,22,66,n),Ys(i,e,e.midU,e.midV,r,r*.82,88,s);let o=is(i,e),a=e.cx+o.nx*(e.halfShort*.62),c=e.cz+o.nz*(e.halfShort*.62),l=new Ct({color:10467014,roughness:.12,metalness:.25,transparent:!0,opacity:.72,side:Ce}),h=new pt(new gi(11.5,27,18,6,!0),l);h.position.set(a,13.5,c),h.castShadow=!0,i.world.add(h);for(let d=0;d<12;d++){let u=d/12*Math.PI*2,f=new pt(new ut(.22,27.4,.22),i.mat.metal);f.position.set(a+Math.cos(u)*5.6,13.6,c+Math.sin(u)*5.6),f.rotation.z=Math.cos(u)*.2,f.rotation.x=-Math.sin(u)*.2,f.castShadow=!0,i.world.add(f)}}function R_(i,t){let e=ri(t.p),n=i.mat.towerGlass,s=i.mat.paleStone;i.world.add(i.extrude(t.p,t.h,n));let r=is(i,e);for(let o=0;o<5;o++){let a=12+o*9.5;if(a>t.h-8)break;let c=new pt(new ut(Math.min(20,e.halfLong*.9),4.2,3.4),new Ct({color:2896697,roughness:.6}));c.position.set(e.cx+r.nx*(e.halfShort-.6),a,e.cz+r.nz*(e.halfShort-.6)),c.rotation.y=Math.atan2(r.nx,r.nz),i.world.add(c);let l=new pt(new ut(Math.min(20,e.halfLong*.9),.35,4.6),s);l.position.set(e.cx+r.nx*(e.halfShort+.9),a-2,e.cz+r.nz*(e.halfShort+.9)),l.rotation.y=Math.atan2(r.nx,r.nz),l.castShadow=!0,i.world.add(l)}i.world.add(i.extrude(i.grow(t.p,1.02),1,s,t.h));for(let o=0;o<7;o++){let a=new pt(new fe(1.5,8,6),new Ue({color:4152371}));a.position.set(e.cx+at(-e.halfLong*.6,e.halfLong*.6),t.h+2,e.cz+at(-e.halfShort*.6,e.halfShort*.6)),a.scale.y=.7,a.castShadow=!0,i.world.add(a)}}function C_(i,t){let e=ri(t.p),n=i.mat.paleStone,s=i.mat.warmStone,r=i.mat.towerGlass,o=Math.min(14,t.h*.24);i.world.add(i.extrude(t.p,o,s)),i.world.add(i.extrude(i.grow(t.p,1.03),.9,n,o-.9));let a=Math.min(20,e.halfShort*.78),c=Math.min(e.halfLong*1.5,54),l=Math.max(12,t.h-o);mn(i,e,e.midU,e.midV,c,a,o,l,s);let h=Math.max(4,Math.round(l/3.3));for(let p=1;p<h;p+=2){let m=o+p*(l/h);if(m>o+l-2)break;for(let M of[-1,1])mn(i,e,e.midU,e.midV+M*(a/2+.18),c*.96,.42,m-.2,.28,n)}for(let p of[-1,1])mn(i,e,e.midU,e.midV+p*(a/2+.06),c*.94,.1,o+1.2,l-2.4,r);Ys(i,e,e.midU,e.midV,c,a,o+l,n);let d=is(i,e),u=Math.atan2(d.nx,d.nz),f=e.cx+d.nx*e.halfShort,g=e.cz+d.nz*e.halfShort,y=i.clearance?i.clearance.outward(f,g,d.nx,d.nz,11,13):7;if(y>6.5){let p=Math.min(13,y*1.05),m=f+d.nx*(p/2),M=g+d.nz*(p/2),b=new pt(new ut(22,.6,p),n);b.position.set(m,6,M),b.rotation.y=u,b.castShadow=!0,i.world.add(b);for(let T of[-9,9])for(let S of[-p/2.6,p/2.6]){let R=new pt(new qt(.45,.55,6,10),n);R.position.set(m-d.nz*T+d.nx*S,3,M+d.nx*T+d.nz*S),R.castShadow=!0,i.world.add(R)}let x=new pt(new ut(24,.12,p*1.12),i.mat.paving);x.position.set(m,.2,M),x.rotation.y=u,x.receiveShadow=!0,i.world.add(x)}}function Ud(i,t){let e=ri(t.p),n=i.mat.shophouse(t),s=i.mat.trim,r=i.mat.clayTile,o=0;for(let[m,M]of t.p)o=o*33+(m*3|0)+(M*17|0)|0;o=Math.abs(o);let a=o%4,c=o%5<3,l=4.2,h=Math.max(3.4,t.h-l),d=e.cx,u=e.cz,f=is(i,e);i.merge(i.extrudeGeo(i.grow(t.p,.86),l),i.mat.warmStone,d,u),i.merge(i.scaleUV(i.extrudeGeo(t.p,h,l),Math.max(1,e.halfLong/4),Math.max(1,h/11)),n,d,u),i.merge(i.extrudeGeo(i.grow(t.p,1.03),.34,l-.34),s,d,u),i.merge(i.extrudeGeo(i.grow(t.p,1.04),.5,t.h),s,d,u);let g=Math.atan2(f.nx,f.nz),y=e.halfLong*2,p=Math.max(2,Math.round(y/3.6));for(let m=0;m<=p;m++){let M=e.midU-e.halfLong+m/p*y,b=e.cx+e.ux*M-e.uz*(e.midV+f.dist*0),x=e.cz+e.uz*M+e.ux*e.midV,T=new ut(.34,l,.34);T.translate(b+f.nx*(e.halfShort*.94),l/2,x+f.nz*(e.halfShort*.94)),i.merge(T,s,d,u)}if(a<3){let m=Math.min(3.4,e.halfShort*(.5+a*.09)),M=new qt(m,m,y*1.02,3,1,!1);M.rotateZ(Math.PI/2),M.rotateY(-e.ang),M.translate(e.cx,t.h+m*.3,e.cz),i.merge(M,r,d,u);for(let b of[-1,1]){let x=new qt(m*1.03,m*1.03,.3,3,1,!1);x.rotateZ(Math.PI/2),x.rotateY(-e.ang),x.translate(e.cx+e.ux*b*(y/2),t.h+m*.3,e.cz+e.uz*b*(y/2)),i.merge(x,s,d,u)}}else i.merge(i.extrudeGeo(i.grow(t.p,1.05),.8,t.h+.5),s,d,u);if(c){let m=new ut(y*.92,.16,2);m.rotateY(-e.ang),m.translate(e.cx+f.nx*(e.halfShort+.9),l-.55,e.cz+f.nz*(e.halfShort+.9)),i.merge(m,i.mat.awning(t),d,u)}}var I_=[[/ngee ann city|takashimaya/i,M_],[/ion orchard|orchard residences/i,S_],[/tang plaza|singapore marriott|^tangs/i,b_],[/paragon/i,E_],[/wheelock/i,A_],[/orchard central/i,R_],[/wisma atria|313|orchard gateway|shaw (house|centre)|mandarin gallery|the heeren/i,w_],[/hotel|hyatt|hilton|marriott|four seasons|pullman|voco|royal plaza|pan pacific|regent|shangri|holiday inn|ibis|orchard rendezvous|concorde|mandarin orchard/i,C_],[/lucky plaza|far east plaza|orchard towers|midpoint|palais|delfi|orchard plaza|cairnhill|tripleone|far east shopping|international building|liat|pacific plaza|scotts square|orchard building|forum the shopping|268 orchard|scape|design orchard|cathay cineleisure/i,T_]];function Nd(i){if(!i)return null;for(let[t,e]of I_)if(t.test(i))return e;return null}var gc={asphalt:Rd(),paving:Cd(),leaf:Ld(),ao:Dd()},Fd=[qs(8230054,5989742,8),qs(9148578,7041656,7),qs(7311242,5070684,9),qs(10130308,7170658,6),qs(8688543,4147024,10)],P_=[pc(),pc(),pc()],Gd=[ki(11774618,.5),ki(10261642,.6),ki(12760480,.45),ki(9276038,.7)],L_=[mc(11051153),mc(12432288),mc(9669762)],D_=[ch(13024681),ch(11380118)];function U_(i){let t=0;for(let[n,s]of i.p)t=t*31+(n*7|0)+(s*13|0)|0;if(t=Math.abs(t),i.a>1400||i.k)return{pool:Fd,rough:.34,metal:.08};let e=t%100;return e<34?{pool:L_,rough:.86,metal:0}:e<52?{pool:D_,rough:.8,metal:0}:e<74?{pool:Gd,rough:.88,metal:0}:{pool:Fd,rough:.36,metal:.06}}var Lt={asphalt:new Ct({map:gc.asphalt,roughness:.95}),paving:new Ct({map:gc.paving,roughness:.9}),kerb:new Ct({color:Ye.kerb,roughness:.86}),conc:new Ct({map:ki(Ye.conc,.7),roughness:.92}),trim:new Ct({color:Ye.trim,roughness:.8}),white:new Ct({color:14605008,roughness:.85}),yellow:new Ct({color:Ye.yellow,roughness:.85}),metal:new Ct({color:9146259,roughness:.5,metalness:.4}),darkMetal:new Ct({color:3882820,roughness:.6,metalness:.3}),glass:new Ct({color:5464429,roughness:.14,metalness:.18}),leaf:new Ue({map:gc.leaf,transparent:!1,alphaTest:.42,side:Ce}),canopy:new Ue({color:2371866}),trunk:new Ct({color:Ye.trunk,roughness:.95}),ao:new Cn({map:gc.ao,transparent:!0,blending:Br,premultipliedAlpha:!0,depthWrite:!1})},Bd=[14207924,12571332,14271386,13226973,14071464,14735037,12175805],Od=[9194047,3104594,9073715,4150640,7228003,10116918],lh=new Map,hh=new Map,N_={granite:new Ct({map:Id(),roughness:.3,metalness:.12}),towerGlass:new Ct({map:ah(),roughness:.22,metalness:.16}),blueGlass:new Ct({map:ah(),color:10470621,roughness:.18,metalness:.2}),paleStone:new Ct({map:ki(12893614,.35),roughness:.78}),warmStone:new Ct({map:ki(11707535,.5),roughness:.85}),jadeRoof:new Ct({color:3104586,roughness:.45,metalness:.2}),clayTile:new Ct({color:10246724,roughness:.82}),awning(i){let t=0;for(let[n,s]of i.p)t=t*29+(n*9|0)+(s*7|0)|0;let e=Od[Math.abs(t)%Od.length];return hh.has(e)||hh.set(e,new Ct({color:e,roughness:.9})),hh.get(e)},shophouse(i){let t=0;for(let[n,s]of i.p)t=t*31+(n*5|0)+(s*11|0)|0;let e=Bd[Math.abs(t)%Bd.length];return lh.has(e)||lh.set(e,new Ct({map:Pd(e),roughness:.88})),lh.get(e)}},CS=new D(0,1,0),zd=110,dh=class{constructor(){this.groups=new Map,this.mats=new Map}add(t,e,n=0,s=0){let r=`${Math.floor(n/zd)},${Math.floor(s/zd)}|${this.matKey(e)}`;this.groups.has(r)||(this.groups.set(r,[]),this.mats.set(r,e)),this.groups.get(r).push(t.index?t.toNonIndexed():t)}matKey(t){return this._ids||(this._ids=new Map,this._next=0),this._ids.has(t)||this._ids.set(t,this._next++),this._ids.get(t)}flush(t){let e=0;for(let[n,s]of this.groups){let r=this.mats.get(n),o=0;for(let g of s)o+=g.attributes.position.count;let a=new Float32Array(o*3),c=new Float32Array(o*3),l=new Float32Array(o*2),h=0,d=0;for(let g of s)a.set(g.attributes.position.array,h),g.attributes.normal&&c.set(g.attributes.normal.array,h),g.attributes.uv&&l.set(g.attributes.uv.array,d),h+=g.attributes.position.count*3,d+=g.attributes.position.count*2,g.dispose();let u=new Oe;u.setAttribute("position",new re(a,3)),u.setAttribute("normal",new re(c,3)),u.setAttribute("uv",new re(l,2)),u.computeBoundingSphere();let f=new pt(u,r);f.castShadow=!0,f.receiveShadow=!0,t.add(f),e++}return this.groups.clear(),this.mats.clear(),e}},fh=class{constructor(t,e){this.CELL=44,this.grid=new Map;let n=(s,r,o)=>{let a=Math.min(s[0],r[0])-o,c=Math.max(s[0],r[0])+o,l=Math.min(s[1],r[1])-o,h=Math.max(s[1],r[1])+o;for(let d=Math.floor(a/this.CELL);d<=Math.floor(c/this.CELL);d++)for(let u=Math.floor(l/this.CELL);u<=Math.floor(h/this.CELL);u++){let f=d+","+u;this.grid.has(f)||this.grid.set(f,[]),this.grid.get(f).push([s,r,o])}};for(let s of t||[])if(!(s.k==="footway"||s.k==="pedestrian"||s.k==="service"))for(let r=0;r<s.p.length-1;r++)n(s.p[r],s.p[r+1],s.w/2+.7);if(e)for(let s=0;s<e.p.length-1;s++)n(e.p[s],e.p[s+1],e.w/2+.7)}inRoad(t,e){let n=this.grid.get(Math.floor(t/this.CELL)+","+Math.floor(e/this.CELL));if(!n)return!1;for(let[s,r,o]of n){let a=r[0]-s[0],c=r[1]-s[1],l=a*a+c*c,h=l<1e-9?0:((t-s[0])*a+(e-s[1])*c)/l;h=Math.max(0,Math.min(1,h));let d=t-(s[0]+a*h),u=e-(s[1]+c*h);if(d*d+u*u<o*o)return!0}return!1}outward(t,e,n,s,r,o=0){for(let a=r;a>.4;a-=.5)if(this.rectClear(t,e,n,s,o*2,a))return a;return 0}rectClear(t,e,n,s,r,o){let a=-s,c=n,l=r/2,h=Math.max(3,Math.ceil(r/6)),d=Math.max(2,Math.ceil(o/4));for(let u=0;u<=h;u++){let f=-l+u/h*r;for(let g=0;g<=d;g++){let y=g/d*o;if(this.inRoad(t+n*y+a*f,e+s*y+c*f))return!1}}return!0}};function ph(i,t,e){let n=i.attributes.uv;if(!n)return i;for(let s=0;s<n.count;s++)n.setXY(s,n.getX(s)*t,n.getY(s)*e);return n.needsUpdate=!0,i}var uh=new Map;function Vd(i,t,e){return uh.has(i)||uh.set(i,new Ct({map:i,roughness:t,metalness:e})),uh.get(i)}function Qr(i,t,e=0){let n=new Ns(Wd(i),{depth:t,bevelEnabled:!1,curveSegments:1});return n.rotateX(Math.PI/2),n.translate(0,e+t,0),n}function F_(i){let t=0;for(let e=0;e<i.length;e++){let[n,s]=i[e],[r,o]=i[(e+1)%i.length];t+=n*o-r*s}return t/2}function Wd(i){let t=F_(i)<0?[...i].reverse():i,e=new Ds;e.moveTo(t[0][0],t[0][1]);for(let n=1;n<t.length;n++)e.lineTo(t[n][0],t[n][1]);return e.closePath(),e}function ss(i){let t=0,e=0;for(let n of i)t+=n[0],e+=n[1];return[t/i.length,e/i.length]}function Hd(i){let t=0;for(let e=0;e<i.length;e++){let n=i[e],s=i[(e+1)%i.length];t+=Math.hypot(s[0]-n[0],s[1]-n[1])}return t}function jr(i,t,e,n=0){let s=new Ns(Wd(i),{depth:t,bevelEnabled:!1,curveSegments:1});s.rotateX(Math.PI/2),s.translate(0,n+t,0);let r=new pt(s,e);return r.castShadow=!0,r.receiveShadow=!0,r}function Kr(i,t){let e=ss(i);return i.map(([n,s])=>[e[0]+(n-e[0])*t,e[1]+(s-e[1])*t])}function Xd(i,t){let e={count:0,tall:0,bespoke:0},n=new dh,s=new fh(t.roads,t.axis),r={clearance:s,world:i,extrude:jr,grow:Kr,axis:t.axis||null,extrudeGeo:Qr,scaleUV:ph,merge:(o,a,c,l)=>n.add(o,a,c,l),mat:{...N_,trim:Lt.trim,conc:Lt.conc,paving:Lt.paving,metal:Lt.metal}};for(let o of t.buildings){let a=o.p;if(a.length<3)continue;if(!o.k&&o.a<520&&o.h<=20&&o.p.length<=64){Ud(r,o),e.count++,e.shophouses=(e.shophouses||0)+1;continue}let c=Nd(o.n);if(c){c(r,o),kd(i,o,Hd(a),n,s),e.count++,e.bespoke++;continue}let l=U_(o),h=Ne(l.pool),d=Vd(h,l.rough,l.metal),u=Hd(a),f=o.h;if(o.k&&f>70){let g=Math.min(34,f*.28);i.add(jr(a,g,new Ct({map:Ne(Gd),roughness:.8})));let y=ss(a),p=a.map(([m,M])=>[y[0]+(m-y[0])*.62,y[1]+(M-y[1])*.62]);i.add(jr(p,f-g,d,g)),e.tall++}else{let g=ss(a);if(n.add(ph(Qr(a,f),Math.max(1,u/26),Math.max(1,f/28)),d,g[0],g[1]),f>8){let y=ss(a),p=a.map(([m,M])=>[y[0]+(m-y[0])*1.008,y[1]+(M-y[1])*1.008]);n.add(Qr(p,.7,f),Lt.trim,y[0],y[1])}}if(kd(i,o,u,n,s),o.a>900&&f>12){let g=ss(a);for(let p=0;p<3;p++){let m=new ut(at(3,7),at(1.6,3.4),at(3,6));m.translate(g[0]+at(-8,8),f+at(1,1.8),g[1]+at(-8,8)),n.add(m,Lt.conc,g[0],g[1])}let y=new ut(at(4,7),at(3.2,4.6),at(4,6));if(y.translate(g[0]+at(-6,6),f+2.2,g[1]+at(-6,6)),n.add(y,Lt.trim,g[0],g[1]),Sn(.6))for(let p=0;p<2;p++){let m=new qt(at(.9,1.4),at(.9,1.4),1.7,10);m.translate(g[0]+at(-9,9),f+.9,g[1]+at(-9,9)),n.add(m,Lt.trim,g[0],g[1])}if(Sn(.5)){let p=new ut(at(9,16),.7,.7);p.translate(g[0]+at(-4,4),f+.9,g[1]+at(-7,7)),n.add(p,Lt.metal,g[0],g[1])}}e.count++}return e.mergedMeshes=n.flush(i),e}function kd(i,t,e,n,s){if(t.a<=600||t.h<=7)return;let r=t.p,o=Ne(P_),a=Vd(o,.32,.05);if(n){let h=ss(r);n.add(ph(Qr(Kr(r,1.012),5.4),Math.max(2,e/15),1),a,h[0],h[1]),n.add(Qr(Kr(r,1.055),.42,5.3),Lt.trim,h[0],h[1])}else i.add(jr(Kr(r,1.012),5.4,a)),i.add(jr(Kr(r,1.055),.42,Lt.trim,5.3));let c=0,l=0;for(let h=0;h<r.length;h++){let d=r[h],u=r[(h+1)%r.length],f=Math.hypot(u[0]-d[0],u[1]-d[1]);f>l&&(l=f,c=h)}if(l>16){let h=r[c],d=r[(c+1)%r.length],u=(h[0]+d[0])/2,f=(h[1]+d[1])/2,g=Math.atan2(d[0]-h[0],d[1]-h[1]),y=ss(r),p=u-y[0],m=f-y[1],M=Math.hypot(p,m)||1,b=p/M,x=m/M;if(t.a>1200){let R=Math.min(14,l*.3),_=new pt(new be(R,4.4),new Ct({color:2827808,roughness:.7,emissive:14267511,emissiveIntensity:.55}));_.position.set(u-b*5.2,2.5,f-x*5.2),_.rotation.y=g+Math.PI/2,i.add(_);for(let C of[-1,1]){let P=new pt(new be(5.6,4.4),new Ct({color:3814187,roughness:.8,side:Ce}));P.position.set(u-b*2.5+Math.sin(g)*C*R/2,2.5,f-x*2.5+Math.cos(g)*C*R/2),P.rotation.y=g,i.add(P)}let E=new pt(new be(R,5.6),new Ct({color:4866618,roughness:.8,side:Ce}));E.rotation.x=Math.PI/2,E.rotation.z=-g,E.position.set(u-b*2.5,4.7,f-x*2.5),i.add(E);let w=new pt(new be(R,4.2),new Ct({color:12374234,roughness:.08,metalness:.2,transparent:!0,opacity:.34,side:Ce}));w.position.set(u+b*.35,2.4,f+x*.35),w.rotation.y=g+Math.PI/2,i.add(w)}let T=Math.min(18,l*.34),S=s?s.outward(u,f,b,x,3.6,T*.5):3.6;if(S>1){let R=new pt(new ut(T,.5,S*1.15),Lt.trim);R.position.set(u+b*S*.5,6.1,f+x*S*.5),R.rotation.y=g+Math.PI/2,R.castShadow=!0,i.add(R);for(let _ of[-1,1]){let E=new pt(new qt(.12,.12,6,8),Lt.metal);E.position.set(u+b*S*.9+Math.sin(g)*_*T*.42,3,f+x*S*.9+Math.cos(g)*_*T*.42),E.castShadow=!0,i.add(E)}}}}function B_(i,t,e){let n=new Oe,s=[],r=[],o=0;for(let a=0;a<i.length-1;a++){let[c,l]=i[a],[h,d]=i[a+1],u=h-c,f=d-l,g=Math.hypot(u,f);if(g<.01)continue;let y=-f/g*t/2,p=u/g*t/2,m=[c-y,e,l-p],M=[c+y,e,l+p],b=[h+y,e,d+p],x=[h-y,e,d-p];s.push(...m,...M,...b,...m,...b,...x);let T=o/t,S=(o+g)/t;r.push(0,T,1,T,1,S,0,T,1,S,0,S),o+=g}return n.setAttribute("position",new re(s,3)),n.setAttribute("uv",new re(r,2)),n.computeVertexNormals(),n}function O_(i){let t=0;for(let e=0;e<i.length-1;e++)t+=Math.hypot(i[e+1][0]-i[e][0],i[e+1][1]-i[e][1]);return t}function qd(i,t){let e=[],n=[],s=null,r=1/0;for(let a of t.roads){let c=a.k==="footway"||a.k==="pedestrian",l=c?.02:.055,h=B_(a.p,a.w,l);if(!(!h.attributes.position||h.attributes.position.count===0)&&((c?n:e).push(h),/orchard road/i.test(a.n||"")&&O_(a.p)>120)){let d=1/0;for(let[u,f]of a.p)d=Math.min(d,u*u+f*f);d<r&&(r=d,s=a)}}let o=(a,c)=>{if(!a.length)return;let l=0;for(let p of a)l+=p.attributes.position.count;let h=new Float32Array(l*3),d=new Float32Array(l*2),u=0,f=0;for(let p of a)h.set(p.attributes.position.array,u),u+=p.attributes.position.array.length,d.set(p.attributes.uv.array,f),f+=p.attributes.uv.array.length;let g=new Oe;g.setAttribute("position",new re(h,3)),g.setAttribute("uv",new re(d,2)),g.computeVertexNormals();let y=new pt(g,c);y.receiveShadow=!0,i.add(y)};return o(e,Lt.asphalt),o(n,Lt.paving),s}var to=class{constructor(){this.items=[]}add(t,e,n=1){this.items.push([t,e,n])}build(t){let e=this.items.length;if(!e)return 0;let n=30,s=3,r=4,o=new ze(new qt(.24,.52,1,8),Lt.trunk,e),a=new ze(new qt(.07,.2,1,5),Lt.trunk,e*r),c=new ze(new Rr(1,0),Lt.canopy,e*s),l=new ze(new be(1,.55),Lt.leaf,e*n);o.castShadow=a.castShadow=c.castShadow=l.castShadow=!0;let h=new ne,d=new Te,u=new Se,f=new D,g=new D,y=0,p=0,m=0;return this.items.forEach(([M,b,x],T)=>{let S=at(8.5,12.5)*x,R=at(5.2,7.2)*x;f.set(M,S/2,b),u.identity(),g.set(x,S,x),h.compose(f,u,g),o.setMatrixAt(T,h);for(let _=0;_<r;_++){let E=_/r*Math.PI*2+at(-.3,.3),w=at(1.8,3)*x;f.set(M+Math.cos(E)*w*.22,S*at(.8,.96),b+Math.sin(E)*w*.22),d.set(Math.cos(E)*.55,0,-Math.sin(E)*.55),u.setFromEuler(d),g.set(x,w,x),h.compose(f,u,g),a.setMatrixAt(y++,h)}for(let _=0;_<s;_++){let E=R*at(.16,.24);f.set(M+at(-.45,.45)*R,S*at(.94,1.06),b+at(-.45,.45)*R),u.identity(),g.set(E,E*.5,E),h.compose(f,u,g),c.setMatrixAt(p++,h)}for(let _=0;_<n;_++){let E=hn()*Math.PI*2,w=R*Math.sqrt(hn())*1.12;f.set(M+Math.cos(E)*w,S*at(.92,1.06)-w*.13+at(-.4,.4),b+Math.sin(E)*w),d.set(at(-1.5,-.7),E+at(-.7,.7),at(-.4,.4)),u.setFromEuler(d);let C=R*at(.45,.8);g.set(C,C,C),h.compose(f,u,g),l.setMatrixAt(m++,h)}}),a.count=y,c.count=p,l.count=m,t.add(o,a,c,l),e}};var an={vMax:11.6,vReverse:2.4,accel:5,reverseAccel:2.6,brake:11,coast:1.35,drag:.016,wheelbase:1.32,steerMax:.62,steerFalloff:.045,leanMax:.62,leanRate:5};function xc(i=0,t=0,e=0){return{x:i,z:t,heading:e,speed:0,lean:0,yaw:0,wheel:0,revHold:0,reversing:!1}}function mh(i,t,e,n,s){e>0?(i.revHold=0,i.reversing=!1):n>0&&i.speed<=.03?i.revHold+=t:n===0&&(i.revHold=0,i.speed>=-.02&&(i.reversing=!1)),i.revHold>.35&&(i.reversing=!0);let r;if(i.reversing?r=-n*an.reverseAccel:r=e*an.accel-n*an.brake*(i.speed>0?1:0),Math.abs(i.speed)>.05){let h=Math.sign(i.speed);r-=h*(an.coast+an.drag*i.speed*i.speed)}i.speed=Math.max(-an.vReverse,Math.min(an.vMax,i.speed+r*t)),!i.reversing&&e===0&&Math.abs(i.speed)<.12&&(i.speed=0),i.reversing&&n===0&&Math.abs(i.speed)<.12&&(i.speed=0,i.reversing=!1);let o=1/(1+an.steerFalloff*i.speed*i.speed),a=s*an.steerMax*o,c=i.speed/an.wheelbase*Math.tan(a);i.yaw=c,i.heading-=c*t;let l=Math.max(-an.leanMax,Math.min(an.leanMax,c*i.speed*.11));return i.lean+=(l-i.lean)*Math.min(1,an.leanRate*t),i.x+=Math.sin(i.heading)*i.speed*t,i.z+=Math.cos(i.heading)*i.speed*t,i.wheel+=i.speed/.21*t,i}var z_=10470584,H_=15262418,k_=13028046;function xe(i,t,e,n,s,r=0,o=0,a=0){let c=new pt(i,t);return c.position.set(e,n,s),c.rotation.set(r,o,a),c.castShadow=!0,c}function Yd(){let i=new ge,t=new Ct({color:z_,roughness:.35,metalness:.25}),e=new Ct({color:H_,roughness:.5}),n=new Ct({color:k_,roughness:.22,metalness:.85}),s=new Ct({color:2435116,roughness:.85}),r=new Ct({color:5522223,roughness:.62}),o=new Ct({color:14214378,roughness:.1,metalness:.1,transparent:!0,opacity:.55}),a=new fe(.3,14,12);i.add(xe(a,t,.26,.52,-.3)),i.add(xe(a,t,-.26,.52,-.3));let c=i.children[i.children.length-1],l=i.children[i.children.length-2];c.scale.set(.72,.95,1.55),l.scale.set(.72,.95,1.55),i.add(xe(new ut(.42,.3,.86),t,0,.56,-.26)),i.add(xe(new ut(.46,.055,.62),e,0,.3,.28)),i.add(xe(new ut(.5,.62,.1),t,0,.62,.6,-.3)),i.add(xe(new ut(.44,.3,.09),e,0,.4,.66,-.3));let h=xe(new Re(.13,.42,4,8),r,0,.79,-.16,0,0,Math.PI/2);h.scale.set(1,1,1.15),i.add(h),i.add(xe(new qt(.055,.055,.62,8),n,0,.86,.66,-.28)),i.add(xe(new qt(.028,.028,.66,6),n,0,1.09,.6,0,0,Math.PI/2));for(let y of[-.3,.3])i.add(xe(new qt(.035,.035,.14,6),s,y,1.09,.6,0,0,Math.PI/2)),i.add(xe(new qt(.012,.012,.2,5),n,y*.9,1.2,.6)),i.add(xe(new Li(.055,10),n,y*.9,1.3,.6,0,y>0?.5:-.5,0));let d=xe(new fe(.115,12,10),n,0,.99,.74);d.scale.set(1,1,.62),i.add(d),i.add(xe(new Li(.095,12),new Ct({color:16774360,roughness:.2,emissive:16771504,emissiveIntensity:.35}),0,.99,.8)),i.add(xe(new ut(.44,.34,.02),o,0,1.32,.66,-.24));let u=new qt(.205,.205,.115,16),f=new qt(.115,.115,.12,12),g=[];for(let[y,p]of[[.62,!0],[-.52,!1]]){let m=new ge;m.add(xe(u,s,0,0,0,0,0,Math.PI/2)),m.add(xe(f,e,0,0,0,0,0,Math.PI/2)),m.position.set(0,.205,y),i.add(m),g.push(m),p&&(i.add(xe(new ut(.07,.44,.07),n,.1,.42,y,-.16)),i.add(xe(new ut(.28,.05,.34),t,0,.45,y+.02)))}return i.add(xe(new qt(.045,.055,.42,8),n,.24,.3,-.44,0,0,Math.PI/2.4)),{group:i,wheels:g}}function Zd(){let i=new ge,t=new Ue({color:13194559}),e=new Ue({color:3686735}),n=new Ue({color:9071186}),s=new Ct({color:15131352,roughness:.3,metalness:.1}),r=new Ct({color:2765112,roughness:.1,metalness:.3}),o=xe(new Re(.17,.4,4,10),t,0,1.16,-.1,-.22);i.add(o);let a=xe(new fe(.135,14,12),s,0,1.55,-.02);i.add(a),i.add(xe(new fe(.118,12,10),r,0,1.545,.055));for(let c of[-.13,.13])i.add(xe(new Re(.085,.3,4,8),e,c,.9,.1,Math.PI/2.3)),i.add(xe(new Re(.072,.28,4,8),e,c,.58,.3,.22)),i.add(xe(new fe(.062,8,7),e,c,.36,.34)),i.add(xe(new Re(.055,.4,4,8),t,c*1.7,1.2,.26,Math.PI/2.6)),i.add(xe(new fe(.05,8,7),n,c*2.3,1.09,.56));return i}var G_=new URLSearchParams(location.search),_h=G_.has("touch")||matchMedia("(pointer: coarse)").matches||navigator.maxTouchPoints>0,Ie={steer:0,throttle:0,brake:0,moveX:0,moveY:0,run:!1,toggleMode:!1,stickActive:!1,stickDX:0,stickDY:0},eo={x:92,yFromBottom:92,radius:54};function V_(){return{cx:eo.x,cy:innerHeight-eo.yFromBottom}}var gh=0,xh=0,He=new Set;addEventListener("keydown",i=>{He.add(i.code),(i.code==="KeyE"||i.code==="KeyF")&&(Ie.toggleMode=!0),["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(i.code)&&i.preventDefault()});addEventListener("keyup",i=>He.delete(i.code));var no=new Map;function W_(i){return i<innerWidth*.5?"power":"steer"}function $d(i){let t=s=>{window.__touchFired=(window.__touchFired||0)+1;for(let r of s.changedTouches)no.set(r.identifier,{startX:r.clientX,startY:r.clientY,x:r.clientX,y:r.clientY,px:r.clientX,py:r.clientY,side:W_(r.clientX)});s.preventDefault()},e=s=>{for(let r of s.changedTouches){let o=no.get(r.identifier);o&&(o.x=r.clientX,o.y=r.clientY)}s.preventDefault()},n=s=>{for(let r of s.changedTouches)no.delete(r.identifier)};i.addEventListener("touchstart",t,{passive:!1}),i.addEventListener("touchmove",e,{passive:!1}),i.addEventListener("touchend",n,{passive:!0}),i.addEventListener("touchcancel",n,{passive:!0})}function Jd(i){let t=!1,e=0,n=0;i.addEventListener("mousedown",s=>{t=!0,e=s.clientX,n=s.clientY}),addEventListener("mouseup",()=>{t=!1}),addEventListener("mousemove",s=>{t&&(gh+=s.clientX-e,xh+=s.clientY-n,e=s.clientX,n=s.clientY)})}function Kd(i){let t=0,e=0,n=0;Ie.stickActive=!1;let s=0,r=0,o=gh,a=xh;gh=0,xh=0;for(let c of no.values()){if(c.side==="power")if(i==="walk"){let{cx:l,cy:h}=V_(),d=c.x-l,u=c.y-h,f=Math.hypot(d,u)||1,g=Math.min(f,eo.radius);d=d/f*g,u=u/f*g,s=d/eo.radius,r=u/eo.radius,Ie.stickActive=!0,Ie.stickDX=d,Ie.stickDY=u}else c.y<innerHeight*.62?e=1:n=1;else i==="walk"?(o+=c.x-c.px,a+=c.y-c.py):t=Math.max(-1,Math.min(1,(c.x-c.startX)/(innerWidth*.14)));c.px=c.x,c.py=c.y}return Ie.stickActive||(Ie.stickDX=0,Ie.stickDY=0),i==="walk"?((He.has("KeyA")||He.has("ArrowLeft"))&&(s=-1),(He.has("KeyD")||He.has("ArrowRight"))&&(s=1),(He.has("KeyW")||He.has("ArrowUp"))&&(r=-1),(He.has("KeyS")||He.has("ArrowDown"))&&(r=1)):((He.has("KeyA")||He.has("ArrowLeft"))&&(t=-1),(He.has("KeyD")||He.has("ArrowRight"))&&(t=1),(He.has("KeyW")||He.has("ArrowUp"))&&(e=1),(He.has("KeyS")||He.has("ArrowDown")||He.has("Space"))&&(n=1)),Ie.steer=t,Ie.throttle=e,Ie.brake=n,Ie.moveX=s,Ie.moveY=r,Ie.run=He.has("ShiftLeft")||He.has("ShiftRight"),{steer:t,throttle:e,brake:n,moveX:s,moveY:r,lookDX:o,lookDY:a,run:Ie.run}}function Qd(){return[...no.values()].map(i=>`${i.side}@${i.x|0},${i.y|0}`).join(" ")}var _c={speed:1.85,runSpeed:4.1,accel:9,turnRate:9};function jd(i=0,t=0,e=0){return{x:i,z:t,heading:e,speed:0,phase:0}}function tf(i,t,e,n,s){let r=Math.min(1,Math.hypot(e,n)),o=r*(s?_c.runSpeed:_c.speed);if(i.speed+=(o-i.speed)*Math.min(1,_c.accel*t),r>.05){let c=Math.atan2(e,n)-i.heading;for(;c>Math.PI;)c-=Math.PI*2;for(;c<-Math.PI;)c+=Math.PI*2;i.heading+=c*Math.min(1,_c.turnRate*t)}return i.phase+=i.speed*t*2.4,i.x+=Math.sin(i.heading)*i.speed*t,i.z+=Math.cos(i.heading)*i.speed*t,i}function ef(){let i=new ge,t=new Ue({color:13194559}),e=new Ue({color:3686735}),n=new Ue({color:9071186}),s=new Ue({color:2366486}),r=new Ue({color:2828067}),o=(M,b,x,T,S)=>{let R=new pt(M,b);return R.position.set(x,T,S),R.castShadow=!0,i.add(R),R},a=o(new Re(.135,.36,4,10),t,0,1.24,0),c=o(new Re(.125,.1,3,8),e,0,.95,0),l=o(new fe(.112,14,12),n,0,1.62,0);o(new fe(.119,14,10,0,Math.PI*2,0,Math.PI*.6),s,0,1.64,0),o(new qt(.055,.062,.1,8),n,0,1.47,0);let h=o(new Re(.048,.42,3,8),t,-.2,1.22,0),d=o(new Re(.048,.42,3,8),t,.2,1.22,0),u=o(new fe(.055,8,7),n,-.205,.99,0),f=o(new fe(.055,8,7),n,.205,.99,0),g=o(new Re(.062,.46,3,8),e,-.09,.53,0),y=o(new Re(.062,.46,3,8),e,.09,.53,0),p=o(new ut(.115,.075,.26),r,-.09,.06,.03),m=o(new ut(.115,.075,.26),r,.09,.06,.03);return{group:i,pose(M,b){let x=b>.1?Math.sin(M*2.4):0;h.rotation.x=x*.7,d.rotation.x=-x*.7,g.rotation.x=-x*.8,y.rotation.x=x*.8,u.position.z=x*.28,f.position.z=-x*.28,p.position.z=.03-x*.32,m.position.z=.03+x*.32;let T=b>.1?Math.abs(Math.cos(M*2.4))*.03:0;a.position.y=1.24+T,l.position.y=1.62+T,c.position.y=.95+T}}}var io=new Ct({color:14605008,roughness:.86}),X_=new Ct({color:14069316,roughness:.86});function Zs(i,t,e,n,s){if(!t.length)return 0;let r=new be(e,n),o=new ze(r,s,t.length),a=new ne,c=new Se,l=new Te,h=new D,d=new D(1,1,1);return t.forEach((u,f)=>{h.set(u[0],u[1],u[2]),l.set(-Math.PI/2,u[3],0,"YXZ"),c.setFromEuler(l),a.compose(h,c,d),o.setMatrixAt(f,a)}),o.receiveShadow=!0,i.add(o),t.length}function nf(i,t){let e=t.p,n=t.w/2,s=[],r=[],o=[],a=[],c=[],l=[],h=0;for(let u=0;u<e.length-1;u++){let[f,g]=e[u],[y,p]=e[u+1],m=y-f,M=p-g,b=Math.hypot(m,M);if(b<.5)continue;let x=m/b,T=M/b,S=-T,R=x,_=Math.atan2(x,T);for(let E=0;E<b;E+=1,h++){let w=f+x*E,C=g+T*E;if(h%9<3)for(let P of[-3.6,3.6])s.push([w+S*P,.075,C+R*P,_]);if(h%2===0)for(let P of[-1,1])r.push([w+S*(n-.55)*P,.075,C+R*(n-.55)*P,_]);if(h%2===0)for(let P of[-1,1])o.push([w+S*(n-.12)*P,.078,C+R*(n-.12)*P,_]),o.push([w+S*(n-.34)*P,.078,C+R*(n-.34)*P,_]);if(h%190===24)for(let P of[-1,1])a.push([w+S*(n*.5)*P,.08,C+R*(n*.5)*P,_+Math.PI/2]);if(h%190===60||h%190===140)for(let P of[-5.4,-1.9,1.9,5.4])c.push([w+S*P,.08,C+R*P,_]),l.push([w+S*P+x*1.9,.08,C+R*P+T*1.9,_])}}let d=0;return d+=Zs(i,s,.14,1,io),d+=Zs(i,r,.12,2,io),d+=Zs(i,o,.1,2,X_),d+=Zs(i,a,.42,n*.92,io),d+=Zs(i,c,.28,3.2,io),d+=Zs(i,l,.92,.9,io),d}function sf(i,t,e,n,s){let r=new s,o=[],a=[],c=[],l=0;for(let M of t.roads){if(!M.n||/orchard road/i.test(M.n)||M.k==="footway"||M.k==="pedestrian"||M.k==="service")continue;let b=M.p,x=M.w/2,T=0;for(let R=0;R<b.length-1;R++)T+=Math.hypot(b[R+1][0]-b[R][0],b[R+1][1]-b[R][1]);if(T<45)continue;l++;let S=0;for(let R=0;R<b.length-1;R++){let[_,E]=b[R],[w,C]=b[R+1],P=w-_,O=C-E,z=Math.hypot(P,O);if(z<.5)continue;let L=P/z,N=O/z,U=-N,G=L,Z=Math.atan2(L,N);for(let q=0;q<z;q+=4,S+=4){let J=_+L*q,K=E+N*q;for(let ct of[-1,1]){let mt=J+U*(x+.4)*ct,rt=K+G*(x+.4)*ct;if(n(mt,rt)||o.push([mt,.15,rt,Z]),S%44===0){let k=J+U*(x+2.8)*ct,nt=K+G*(x+2.8)*ct;n(k,nt)||r.add(k,nt,at(.6,.9))}S%96===0&&!n(mt,rt)&&(a.push([mt,3.6,rt,Z]),c.push([mt-U*.9*ct,7,rt-G*.9*ct,Z,ct]))}}}}let h=new ne,d=new Se,u=new Te,f=new D,g=new D(1,1,1),y=(M,b,x,T)=>{if(!x.length)return;let S=new ze(M,b,x.length);x.forEach((R,_)=>{T(R),h.compose(f,d,g),S.setMatrixAt(_,h)}),S.castShadow=!1,S.receiveShadow=!0,i.add(S)},p=M=>{f.set(M[0],M[1],M[2]),u.set(0,M[3],0),d.setFromEuler(u)};y(new ut(.38,.3,4),Lt.kerb,o,p),y(new qt(.09,.13,7.2,8),Lt.metal,a,p),y(new ut(.9,.16,.4),Lt.trim,c,M=>{f.set(M[0],M[1],M[2]),u.set(0,M[3],0),d.setFromEuler(u)});let m=r.build(i);return{sideRoads:l,sideTrees:m,sideKerbs:o.length}}var yc=[11876142,2051962,14067004,3107663,8011629,13593402,2830131,11022927,4026255],q_=[11680302,3107727,13672506,3504725,9060208],yh=new Map;function rf(i,t,e){let n=i+t+e;if(yh.has(n))return yh.get(n);let s=512,r=128,o=document.createElement("canvas");o.width=s,o.height=r;let a=o.getContext("2d");a.fillStyle=t,a.fillRect(0,0,s,r),a.fillStyle="rgba(255,255,255,0.10)",a.fillRect(0,0,s,5),a.fillStyle=e,a.textAlign="center",a.textBaseline="middle";let c=62,l=i.toUpperCase();do a.font=`600 ${c}px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial`,c-=3;while(a.measureText(l).width>s-44&&c>16);a.fillText(l,s/2,r/2+3);let h=new Qn(o);return h.colorSpace=De,h.anisotropy=4,yh.set(n,h),h}function Ze(i,t,e,n,s,r){let o=new pt(i,t);return o.position.set(e,n,s),o.rotation.y=r,o.castShadow=!0,o.receiveShadow=!0,o}function of(i,t,e,n,s){let r=new ge,o=Lt.metal,a=Lt.darkMetal,c=s/2+1.2;for(let d of[-1,1])r.add(Ze(new qt(.22,.28,7.4,10),o,d*c,3.7,0,0)),r.add(Ze(new ut(1.2,.35,1.2),Lt.conc,d*c,.18,0,0));r.add(Ze(new ut(s+2.8,.85,.55),o,0,7.2,0,0)),r.add(Ze(new ut(s+2.8,.28,.32),o,0,6.4,0,0));let l=Math.max(3,Math.round(s/3.4));for(let d=0;d<l;d++){let u=-s/2+(d+.5)*(s/l),f=Ze(new ut(.62,.3,.85),a,u,6.75,.5,0);f.rotation.x=.42,r.add(f)}for(let d of[-1,1])r.add(Ze(new ut(.4,.4,.75),a,d*(c-1.4),6.9,-.5,0));let h=Ze(new ut(2.4,.9,.12),new Ct({color:1842978,emissive:13208094,emissiveIntensity:.55}),0,8.1,.1,0);r.add(h),r.position.set(t,0,e),r.rotation.y=n,i.add(r)}function Y_(i,t,e,n,s){let r=new ge,o=Lt.metal,a=Lt.conc,c=s+14;r.add(Ze(new ut(c,.42,2.6),a,0,6,0,0)),r.add(Ze(new ut(c,.16,3),Lt.trim,0,8.6,0,0));for(let l of[-1,1]){r.add(Ze(new ut(c,1.05,.1),o,0,6.75,l*1.3,0));for(let h=0;h<=10;h++){let d=-c/2+h/10*c;r.add(Ze(new qt(.055,.055,2.4,6),o,d,7.4,l*1.3,0))}}for(let l of[-1,1]){let h=l*(c/2-1);r.add(Ze(new ut(2.6,6,2.8),a,h,3,l*3.2,0));for(let d=0;d<12;d++)r.add(Ze(new ut(2.2,.16,.34),a,h,.5+d*.46,l*(1.9+d*.2),0))}r.position.set(t,0,e),r.rotation.y=n,i.add(r)}function Z_(i,t,e,n,s){let r=new ge,o=Lt.metal,a=Lt.conc,c=new Ct({color:11059407,roughness:.12,metalness:.25,transparent:!0,opacity:.62,side:Ce});r.add(Ze(new ut(7.4,.4,5.2),a,0,-.2,0,0));for(let u=0;u<9;u++){let f=new pt(new ut(4.6,.17,.42),a);f.position.set(0,-.28-u*.17,-1.6+u*.42),f.receiveShadow=!0,r.add(f)}r.add(Ze(new ut(4.8,.1,3.2),new Cn({color:856340}),0,-1.9,1.4,0));for(let u of[-1,1]){r.add(Ze(new ut(.07,.05,5),o,u*2.6,1.05,0,0)),r.add(Ze(new ut(.06,.04,5),o,u*2.6,.66,0,0));for(let f=0;f<4;f++)r.add(Ze(new qt(.03,.03,1.05,6),o,u*2.6,.52,-2.2+f*1.5,0))}let l=new pt(new qt(3.5,3.5,6.6,16,1,!0,Math.PI*.08,Math.PI*.84),c);l.rotation.z=Math.PI/2,l.position.set(0,2.5,0),l.castShadow=!0,r.add(l);for(let u=0;u<=5;u++){let f=new pt(new Cr(3.5,.05,5,12,Math.PI*.84),o);f.rotation.y=Math.PI/2,f.rotation.z=Math.PI*.08,f.position.set(-3.3+u*1.32,2.5,0),r.add(f)}let h=new pt(new ut(.34,3.3,1.05),Lt.darkMetal);h.position.set(4.3,1.65,0),h.castShadow=!0,r.add(h);let d=(()=>{let u=document.createElement("canvas");u.width=128,u.height=400;let f=u.getContext("2d");f.fillStyle="#c8102e",f.fillRect(0,0,128,130),f.fillStyle="#00358e",f.fillRect(0,130,128,270),f.fillStyle="#ffffff",f.font="700 30px ui-sans-serif, system-ui, Helvetica, Arial",f.textAlign="center",f.fillText("MRT",64,82),f.save(),f.translate(64,265),f.rotate(-Math.PI/2);let g=30;do f.font=`600 ${g}px ui-sans-serif, system-ui, Helvetica, Arial`,g-=2;while(f.measureText(s.toUpperCase()).width>230&&g>12);f.fillText(s.toUpperCase(),0,8),f.restore();let y=new Qn(u);return y.colorSpace=De,y})();for(let u of[-1,1]){let f=new pt(new be(1,3.15),new Ct({map:d,roughness:.5}));f.position.set(4.3+u*.18,1.65,0),f.rotation.y=u>0?Math.PI/2:-Math.PI/2,r.add(f)}r.position.set(t,0,e),r.rotation.y=n,i.add(r)}function af(i,t,e,n){let s=0;for(let w of e.mrt||[]){if(w.kind!=="subway_entrance")continue;let[C,P]=w.p,O=0,z=1/0,L=0,N=t.p;for(let k=0;k<N.length-1;k++){let[nt,tt]=N[k],[gt,yt]=N[k+1],dt=gt-nt,Yt=yt-tt,Nt=dt*dt+Yt*Yt,et=Nt<1e-9?0:((C-nt)*dt+(P-tt)*Yt)/Nt;et=Math.max(0,Math.min(1,et));let ot=(C-(nt+dt*et))**2+(P-(tt+Yt*et))**2;ot<z&&(z=ot,O=k,L=et)}if(Math.sqrt(z)>90)continue;let[U,G]=N[O],[Z,q]=N[O+1],J=Z-U,K=q-G,ct=Math.hypot(J,K)||1,mt=Math.atan2(J/ct,K/ct),rt=(w.n||"MRT").replace(/\s*(MRT|Station|Exit).*$/i,"")||"MRT";Z_(i,C,P,mt,rt),s++}window.__realMrt=s;let r=0;for(let w of e.bridges||[]){if(w.length<2)continue;let C=0;for(let U=0;U<w.length-1;U++)C+=Math.hypot(w[U+1][0]-w[U][0],w[U+1][1]-w[U][1]);if(C<12)continue;let P=w[0],O=w[w.length-1],z=(P[0]+O[0])/2,L=(P[1]+O[1])/2,N=Math.atan2(O[0]-P[0],O[1]-P[1]);Y_(i,z,L,N+Math.PI/2,Math.min(46,C)-14),r++}window.__realBridges=r;let o=t.p,a=t.w/2,c={erp:0,bridges:r,banners:0,medianPlants:0,roofSigns:0,banners2:0,mrt:s},l=[],h=[],d=[],u=[],f=0;for(let w=0;w<o.length-1;w++){let[C,P]=o[w],[O,z]=o[w+1],L=O-C,N=z-P,U=Math.hypot(L,N);if(U<.5)continue;let G=L/U,Z=N/U,q=-Z,J=G,K=Math.atan2(G,Z);for(let ct=0;ct<U;ct+=1,f++){let mt=C+G*ct,rt=P+Z*ct;if(f%3===0&&h.push([mt,.14,rt,K]),f%7===0&&d.push([mt+q*at(-.45,.45),.72,rt+J*at(-.45,.45),K]),f%46===0&&u.push([mt,0,rt,K]),f%34===8)for(let k of[-1,1]){let nt=mt+q*(a+.4)*k,tt=rt+J*(a+.4)*k;n(nt,tt)||l.push([nt+q*.28*k,5.4,tt+J*.28*k,K])}f===300&&(of(i,mt,rt,K,t.w),c.erp++),f===700&&(of(i,mt,rt,K,t.w),c.erp++)}}let g=new ne,y=new Se,p=new Te,m=new D,M=new D(1,1,1),b=new Vt,x=(w,C,P,O,z)=>{if(!P.length)return;let L=new ze(w,C,P.length);P.forEach((N,U)=>{O(N),g.compose(m,y,M),L.setMatrixAt(U,g),z&&L.setColorAt(U,z())}),L.instanceColor&&(L.instanceColor.needsUpdate=!0),L.castShadow=!1,L.receiveShadow=!0,i.add(L)},T=w=>{m.set(w[0],w[1],w[2]),p.set(0,w[3],0),y.setFromEuler(p)};x(new ut(2.1,.34,3),Lt.kerb,h,T),x(new fe(.66,7,5),new Ue({color:4152371}),d,w=>{m.set(w[0],.72,w[2]),y.identity(),M.set(1,.78,1)}),M.set(1,1,1),c.medianPlants=d.length,x(new qt(.14,.2,6.4,7),Lt.trunk,u,w=>{m.set(w[0],3.2,w[2]),y.identity()});let S=[];for(let[w,,C]of u)for(let P=0;P<7;P++)S.push([w,6.3,C,P/7*Math.PI*2]);x(new be(3.2,.8),Lt.leaf,S,w=>{m.set(w[0]+Math.sin(w[3])*1.4,w[1]-.35,w[2]+Math.cos(w[3])*1.4),p.set(-.95,w[3]+Math.PI/2,0,"YXZ"),y.setFromEuler(p)}),x(new ut(.06,1.6,.62),new Ct({roughness:.8,side:Ce}),l,T,()=>b.setHex(Ne(q_))),c.banners=l.length;let R=0;for(let w of e.shops||[]){let[C,P]=w.p,O=0,z=0,L=1/0,N=0,U=1;for(let k=0;k<o.length-1;k++){let[nt,tt]=o[k],[gt,yt]=o[k+1],dt=gt-nt,Yt=yt-tt,Nt=dt*dt+Yt*Yt,et=Nt<1e-9?0:((C-nt)*dt+(P-tt)*Yt)/Nt;et=Math.max(0,Math.min(1,et));let ot=nt+dt*et,lt=tt+Yt*et,St=(C-ot)**2+(P-lt)**2;if(St<L){L=St,O=ot,z=lt;let Mt=Math.hypot(dt,Yt)||1;N=dt/Mt,U=Yt/Mt}}let G=Math.sqrt(L);if(G>46)continue;let Z=(O-C)/(G||1),q=(z-P)/(G||1),J=Math.atan2(Z,q),K=Math.min(7.5,2.4+w.n.length*.3),ct=5.9+w.n.length*7%13*.12,mt=new pt(new be(K,K*.235),new Ct({map:rf(w.n,"#"+Ne(yc).toString(16).padStart(6,"0"),"#f6f3ec"),roughness:.5,emissive:1644825,emissiveIntensity:.4}));mt.position.set(C+Z*1.2,ct,P+q*1.2),mt.rotation.y=J,i.add(mt);let rt=new pt(new ut(K+.3,K*.235+.3,.22),Lt.darkMetal);rt.position.set(C+Z*1.05,ct,P+q*1.05),rt.rotation.y=J,i.add(rt),R++}c.realShops=R;let _=[],E=[];for(let w of e.buildings){if(w.a<700)continue;let C=0,P=0;for(let ct of w.p)C+=ct[0],P+=ct[1];C/=w.p.length,P/=w.p.length;let O=0,z=0;for(let ct=0;ct<w.p.length;ct++){let mt=w.p[ct],rt=w.p[(ct+1)%w.p.length],k=Math.hypot(rt[0]-mt[0],rt[1]-mt[1]);k>z&&(z=k,O=ct)}let L=w.p[O],N=w.p[(O+1)%w.p.length],U=(L[0]+N[0])/2,G=(L[1]+N[1])/2,Z=Math.atan2(N[0]-L[0],N[1]-L[1]),q=U-C,J=G-P,K=Math.hypot(q,J)||1;if(w.n&&z>14){let ct=Ne(yc),mt=Math.min(26,z*.55),rt=new pt(new be(mt,mt*.25),new Ct({map:rf(w.n,"#"+ct.toString(16).padStart(6,"0"),"#f4f1ea"),roughness:.5,emissive:1381653,emissiveIntensity:.35})),k=Math.min(w.h-2.2,7.4);rt.position.set(U+q/K*1.05,k,G+J/K*1.05),rt.rotation.y=Z+Math.PI/2,i.add(rt);let nt=new pt(new ut(mt+.5,mt*.25+.5,.3),Lt.darkMetal);nt.position.set(U+q/K*.85,k,G+J/K*.85),nt.rotation.y=Z+Math.PI/2,nt.castShadow=!0,i.add(nt),c.nameSigns=(c.nameSigns||0)+1}w.h>34&&Sn(.55)&&_.push([U+q/K*.6,w.h+2.2,G+J/K*.6,Z+Math.PI/2,Math.min(16,z*.4)]),w.h>14&&z>12&&Sn(.7)&&E.push([U+q/K*1.1,9.5,G+J/K*1.1,Z+Math.PI/2])}if(_.length){let w=new ze(new ut(1,3.2,.5),new Ct({roughness:.6}),_.length);_.forEach((C,P)=>{m.set(C[0],C[1],C[2]),p.set(0,C[3],0),y.setFromEuler(p),M.set(C[4],1,1),g.compose(m,y,M),w.setMatrixAt(P,g),w.setColorAt(P,b.setHex(Ne(yc)))}),w.instanceColor&&(w.instanceColor.needsUpdate=!0),w.castShadow=!0,i.add(w),M.set(1,1,1)}return x(new ut(.9,7.5,.35),new Ct({roughness:.55}),E,T,()=>b.setHex(Ne(yc))),c.roofSigns=_.length,c.banners2=E.length,c}var $_=[14172207,14723634,4637802],J_=[0,0,0],vc=class{constructor(t){this.list=t||[]}stateAt(t,e){let n=(e+t.phase)%26;return n<15?0:n<15+2.5?1:2}update(t){for(let e of this.list){let n=this.stateAt(e,t);for(let s of e.lenses)for(let r=0;r<3;r++){let o=r===0&&n===2||r===1&&n===1||r===2&&n===0;s[r].material.emissive.setHex(o?$_[r]:J_[r]),s[r].material.emissiveIntensity=o?1.1:0}}}nextStop(t,e,n,s=30){let r=null;for(let o of this.list){let a=e>0?o.s-t:t-o.s;a<-2||a>s||this.stateAt(o,n)!==0&&(r===null||a<r)&&(r=a)}return r}};var Mc=class{constructor(){this.ready=!1,this.muted=!1,this._lastStep=0}start(){if(this.ready)return;let t=window.AudioContext||window.webkitAudioContext;if(!t)return;let e=new t;this.ctx=e,e.state==="suspended"&&e.resume();try{let l=e.createBuffer(1,1,e.sampleRate),h=e.createBufferSource();h.buffer=l,h.connect(e.destination),h.start(0)}catch{}this.master=e.createGain(),this.master.gain.value=0,this.master.connect(e.destination),this.engineGain=e.createGain(),this.engineGain.gain.value=0,this.engineFilter=e.createBiquadFilter(),this.engineFilter.type="lowpass",this.engineFilter.frequency.value=420,this.engineFilter.Q.value=3.2,this.engineFilter.connect(this.engineGain),this.engineGain.connect(this.master),this.osc1=e.createOscillator(),this.osc1.type="sawtooth",this.osc1.frequency.value=46,this.osc2=e.createOscillator(),this.osc2.type="sawtooth",this.osc2.frequency.value=46*2.01,this.osc3=e.createOscillator(),this.osc3.type="square",this.osc3.frequency.value=46*.5;let n=e.createGain();n.gain.value=.45;let s=e.createGain();s.gain.value=.3,this.osc1.connect(this.engineFilter),this.osc2.connect(n),n.connect(this.engineFilter),this.osc3.connect(s),s.connect(this.engineFilter),this.lfo=e.createOscillator(),this.lfo.frequency.value=5.5,this.lfoGain=e.createGain(),this.lfoGain.gain.value=1.6,this.lfo.connect(this.lfoGain),this.lfoGain.connect(this.osc1.frequency);let r=e.sampleRate*2,o=e.createBuffer(1,r,e.sampleRate),a=o.getChannelData(0),c=0;for(let l=0;l<r;l++){let h=Math.random()*2-1;c=(c+.02*h)/1.02,a[l]=c*3.2}this.noiseBuf=o,this.wind=e.createBufferSource(),this.wind.buffer=o,this.wind.loop=!0,this.windFilter=e.createBiquadFilter(),this.windFilter.type="bandpass",this.windFilter.frequency.value=700,this.windFilter.Q.value=.7,this.windGain=e.createGain(),this.windGain.gain.value=0,this.wind.connect(this.windFilter),this.windFilter.connect(this.windGain),this.windGain.connect(this.master),this.amb=e.createBufferSource(),this.amb.buffer=o,this.amb.loop=!0,this.ambFilter=e.createBiquadFilter(),this.ambFilter.type="lowpass",this.ambFilter.frequency.value=320,this.ambGain=e.createGain(),this.ambGain.gain.value=.16,this.amb.connect(this.ambFilter),this.ambFilter.connect(this.ambGain),this.ambGain.connect(this.master),this.traffic=e.createBufferSource(),this.traffic.buffer=o,this.traffic.loop=!0,this.trafficFilter=e.createBiquadFilter(),this.trafficFilter.type="bandpass",this.trafficFilter.frequency.value=240,this.trafficFilter.Q.value=.9,this.trafficGain=e.createGain(),this.trafficGain.gain.value=0,this.traffic.connect(this.trafficFilter),this.trafficFilter.connect(this.trafficGain),this.trafficGain.connect(this.master),this.traffic.start(),this.osc1.start(),this.osc2.start(),this.osc3.start(),this.lfo.start(),this.wind.start(),this.amb.start(),this.master.gain.setTargetAtTime(this.muted?0:.55,e.currentTime,.4),this.ready=!0,document.addEventListener("visibilitychange",()=>{!document.hidden&&this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume()})}poke(){this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume()}setMuted(t){this.muted=t,this.ready&&this.master.gain.setTargetAtTime(t?0:.55,this.ctx.currentTime,.15)}update(t,e,n,s,r=999){if(!this.ready||this.muted)return;let o=this.ctx.currentTime,a=Math.abs(t),c=Math.max(0,1-r/42);if(this.trafficGain.gain.setTargetAtTime(.02+c*c*.16,o,.35),this.trafficFilter.frequency.setTargetAtTime(210+c*220,o,.4),e==="ride"){let l=44+Math.pow(a,.86)*9.4;this.osc1.frequency.setTargetAtTime(l,o,.06),this.osc2.frequency.setTargetAtTime(l*2.01,o,.06),this.osc3.frequency.setTargetAtTime(l*.5,o,.06),this.engineFilter.frequency.setTargetAtTime(380+a*165,o,.1),this.engineGain.gain.setTargetAtTime(.1+Math.min(.3,a*.028),o,.12),this.windGain.gain.setTargetAtTime(Math.min(.3,a*a*.0022),o,.2),this.windFilter.frequency.setTargetAtTime(520+a*60,o,.2)}else if(this.engineGain.gain.setTargetAtTime(0,o,.25),this.windGain.gain.setTargetAtTime(0,o,.3),n>.3){let l=Math.floor(s*2.4/Math.PI);l!==this._lastStep&&(this._lastStep=l,this._footstep(n))}}_footstep(t){let e=this.ctx,n=e.currentTime,s=e.createBufferSource();s.buffer=this.noiseBuf,s.playbackRate.value=1.6;let r=e.createBiquadFilter();r.type="bandpass",r.frequency.value=1150,r.Q.value=1.1;let o=e.createGain();o.gain.setValueAtTime(0,n),o.gain.linearRampToValueAtTime(.055*Math.min(1,t/2),n+.008),o.gain.exponentialRampToValueAtTime(1e-4,n+.13),s.connect(r),r.connect(o),o.connect(this.master),s.start(n,Math.random()*1.5),s.stop(n+.16)}};var Sc=class{constructor(t){this.pts=t,this.cum=[0];for(let e=0;e<t.length-1;e++)this.cum.push(this.cum[e]+Math.hypot(t[e+1][0]-t[e][0],t[e+1][1]-t[e][1]));this.len=this.cum[this.cum.length-1]}nearestS(t,e){let n=0,s=1/0;for(let r=0;r<this.pts.length;r++){let o=(this.pts[r][0]-t)**2+(this.pts[r][1]-e)**2;o<s&&(s=o,n=this.cum[r])}return n}at(t,e){let n=(t%this.len+this.len)%this.len,s=0,r=this.cum.length-1;for(;s<r-1;){let u=s+r>>1;this.cum[u]<=n?s=u:r=u}let o=this.pts[s],a=this.pts[Math.min(s+1,this.pts.length-1)],c=Math.max(1e-4,this.cum[s+1]-this.cum[s]),l=(n-this.cum[s])/c,h=(a[0]-o[0])/c,d=(a[1]-o[1])/c;return e[0]=o[0]+(a[0]-o[0])*l,e[1]=o[1]+(a[1]-o[1])*l,e[2]=h,e[3]=d,e}},K_=[9268046,11043422,7295288,12819058,8215616],Q_=[1840914,2760986,1183500,4009762,5588024],j_=[13194559,15262420,3100014,14271625,9080726,7176026,11903172,3885650,13994602,4878196,14734008,9194069],ty=[3356735,2831168,4867904,5854044,7498334,2040875],bc=class{constructor(t,e,n=150){this.path=new Sc(t.p),this.half=t.w/2,this.isBlocked=e,this.count=n,this.people=[],this.crossings=[]}setCrossings(t){this.crossings=t||[]}_nearCrossing(t){for(let e of this.crossings){let n=e-(t%this.path.len+this.path.len)%this.path.len;if(Math.abs(n)<2)return e}return null}_pedGreen(t,e,n){if(!n)return!0;for(let s of n.list)if(Math.abs(s.s-t)<70)return n.stateAt(s,e)===2;return!0}build(t){let e=this.count,n=(l,h)=>{let d=new ze(l,h,e);return d.castShadow=!0,d.frustumCulled=!1,t.add(d),d},s=l=>new Ue(l?{color:l}:{});this.head=n(new fe(.105,12,10),s()),this.hair=n(new fe(.112,12,8,0,Math.PI*2,0,Math.PI*.62),s()),this.torso=n(new Re(.125,.34,4,10),s()),this.hips=n(new Re(.115,.1,3,8),s()),this.armL=n(new Re(.045,.4,3,7),s()),this.armR=n(new Re(.045,.4,3,7),s()),this.legL=n(new Re(.058,.44,3,7),s()),this.legR=n(new Re(.058,.44,3,7),s()),this.bag=n(new ut(.22,.26,.1),s()),this.shoeL=n(new ut(.11,.07,.25),s(2828067)),this.shoeR=n(new ut(.11,.07,.25),s(2828067)),this.handL=n(new fe(.052,7,6),s()),this.handR=n(new fe(.052,7,6),s()),this.neck=n(new qt(.052,.06,.1,7),s());let r=new Vt,o=new Vt,a=new Vt,c=new Vt;for(let l=0;l<e;l++){let h=Sn(.5)?1:-1,d=Sn(.5)?1:-1,u={s:hn()*this.path.len,off:h*(this.half+at(3.2,10.5)),dir:d,speed:at(.95,1.65)*(Sn(.12)?0:1),phase:hn()*Math.PI*2,scale:at(.92,1.08),hasBag:Sn(.38),bagSide:Sn(.5)?1:-1,crosser:Sn(.34),crossing:!1,crossT:0,crossFrom:0,crossTo:0};u.cTop=Ne(j_),u.cBot=Ne(ty),u.cSkin=Ne(K_),u.cHair=Ne(Q_),this.people.push(u),r.setHex(u.cTop),o.setHex(u.cBot),a.setHex(u.cSkin),c.setHex(u.cHair),this.torso.setColorAt(l,r),this.armL.setColorAt(l,r),this.armR.setColorAt(l,r),this.hips.setColorAt(l,o),this.legL.setColorAt(l,o),this.legR.setColorAt(l,o),this.head.setColorAt(l,a),this.hair.setColorAt(l,c),this.bag.setColorAt(l,o),this.handL.setColorAt(l,a),this.handR.setColorAt(l,a),this.neck.setColorAt(l,a)}for(let l of[this.torso,this.armL,this.armR,this.hips,this.legL,this.legR,this.head,this.hair,this.bag,this.handL,this.handR,this.neck])l.instanceColor&&(l.instanceColor.needsUpdate=!0);return this._m=new ne,this._q=new Se,this._e=new Te,this._p=new D,this._s=new D(1,1,1),this._tmp=[0,0,0,0],this.update(0,0),e}update(t,e,n=1e9,s=1e9,r=null){let{_m:o,_q:a,_e:c,_p:l,_s:h,_tmp:d}=this,u=this._hidden||(this._hidden=new ne().makeTranslation(0,-9999,0)),f=0,g=this._parts||(this._parts=[this.head,this.hair,this.torso,this.hips,this.armL,this.armR,this.legL,this.legR,this.bag,this.shoeL,this.shoeR,this.handL,this.handR,this.neck]);for(let y=0;y<this.people.length;y++){let p=this.people[y];if(p.crossing){p.crossT+=e/5.2;let k=p.crossT<.5?2*p.crossT*p.crossT:1-2*(1-p.crossT)*(1-p.crossT);p.off=p.crossFrom+(p.crossTo-p.crossFrom)*Math.min(1,k),p.crossT>=1&&(p.crossing=!1,p.off=p.crossTo,p.waited=0)}else if(p.crosser&&p.speed>.1){let k=this._nearCrossing(p.s);k!==null&&this._pedGreen(k,t,r)?(p.crossing=!0,p.crossT=0,p.crossFrom=p.off,p.crossTo=-p.off):p.s+=p.dir*p.speed*e}else p.s+=p.dir*p.speed*e;this.path.at(p.s,d);let[m,M,b,x]=d,T=-x,S=b,R=m+T*p.off,_=M+S*p.off,E=R-n,w=_-s,C=Math.hypot(E,w);if(C<2.6){let k=(2.6-C)/2.6;p.dodge=(p.dodge||0)+(k*1.5-(p.dodge||0))*Math.min(1,e*5)}else p.dodge&&(p.dodge+=(0-p.dodge)*Math.min(1,e*2.2),Math.abs(p.dodge)<.01&&(p.dodge=0));let P=p.off>=0?1:-1,O=R+T*(p.dodge||0)*P,z=_+S*(p.dodge||0)*P;if(this.isBlocked(O,z))continue;let L=O-n,N=z-s;if(L*L+N*N>11025)continue;let U=f++,G=Math.atan2(b*p.dir,x*p.dir),Z=p.scale,q=p.crossing||p.speed>.1,J=q?Math.sin(t*5.2*(p.speed/1.3)+p.phase):0,K=q?Math.abs(Math.cos(t*5.2+p.phase))*.022:0,ct=(k,nt,tt,gt,yt,dt)=>{let Yt=O+(T*nt+b*gt),Nt=z+(S*nt+x*gt);l.set(Yt,tt*Z+K,Nt),c.set(yt||0,G,dt||0,"YXZ"),a.setFromEuler(c),h.set(Z,Z,Z),o.compose(l,a,h),k.setMatrixAt(U,o)};ct(this.neck,0,1.47,.005),ct(this.head,0,1.615,.01),ct(this.hair,0,1.635,.005),ct(this.torso,0,1.22,0),ct(this.hips,0,.94,0),ct(this.armL,-.19,1.2,0,J*.62),ct(this.armR,.19,1.2,0,-J*.62),ct(this.legL,-.085,.52,0,-J*.72),ct(this.legR,.085,.52,0,J*.72),ct(this.shoeL,-.085,.06,.02-J*.3),ct(this.shoeR,.085,.06,.02+J*.3),ct(this.handL,-.205,.99,J*.27),ct(this.handR,.205,.99,-J*.27),p.hasBag?ct(this.bag,p.bagSide*.26,1.02,-.06):this.bag.setMatrixAt(U,u);let mt=this._cc||(this._cc=new Vt),rt=(k,nt)=>{k.instanceColor&&(mt.setHex(nt),k.setColorAt(U,mt))};rt(this.torso,p.cTop),rt(this.armL,p.cTop),rt(this.armR,p.cTop),rt(this.hips,p.cBot),rt(this.legL,p.cBot),rt(this.legR,p.cBot),rt(this.bag,p.cBot),rt(this.head,p.cSkin),rt(this.handL,p.cSkin),rt(this.handR,p.cSkin),rt(this.neck,p.cSkin),rt(this.hair,p.cHair)}for(let y of g)y.count=f,y.instanceMatrix.needsUpdate=!0,y.instanceColor&&(y.instanceColor.needsUpdate=!0)}},ey=[14211806,2830392,9409948,8007466,2572382,12172480,4016703],Ec=class{constructor(t,e=16,n=3){this.path=new Sc(t.p),this.half=t.w/2,this.nCars=e,this.nBuses=n,this.items=[]}build(t,e=0){let n=this.nCars,s=this.nBuses,r=(u,f,g)=>{let y=new ze(u,f,g);return y.castShadow=!0,y.receiveShadow=!0,y.frustumCulled=!1,t.add(y),y},o=new Ct({roughness:.38,metalness:.3}),a=new Ct({color:2765370,roughness:.12,metalness:.2}),c=new Ct({color:2369323,roughness:.85});this.body=r(new ut(1.78,.62,4.32),o,n),this.roof=r(new ut(1.64,.5,2.1),o,n),this.glaze=r(new ut(1.69,.38,2),a,n),this.wheel=r(new qt(.31,.31,.2,10),c,n*4),this.busBody=r(new ut(2.5,2.5,11.8),new Ct({roughness:.5}),s),this.busSkirt=r(new ut(2.54,.62,11.7),new Ct({color:15790057,roughness:.6}),s),this.busGlaze=r(new ut(2.54,.95,10.4),a,s),this.busBlind=r(new ut(1.65,.42,.08),new Ct({color:1711392,emissive:14197308,emissiveIntensity:.5}),s),this.busWheel=r(new qt(.48,.48,.28,10),c,s*4);let l=new Vt;for(let u=0;u<n;u++){let f=u%2===0?1:-1,g=at(7,12);this.items.push({kind:"car",i:u,s:e+55+(this.path.len-110)/n*u+at(-6,6),lane:f*(1.9+(u%4<2?0:3.4)),dir:f,speed:g,base:g}),l.setHex(Ne(ey)),this.body.setColorAt(u,l),this.roof.setColorAt(u,l)}this.body.instanceColor&&(this.body.instanceColor.needsUpdate=!0),this.roof.instanceColor&&(this.roof.instanceColor.needsUpdate=!0);let h=[4160838,4160838,12858415],d=new Vt;for(let u=0;u<s;u++){let f=u%2===0?1:-1;d.setHex(h[u%h.length]),this.busBody.setColorAt(u,d);let g=at(6,9);this.items.push({kind:"bus",i:u,s:e+140+(this.path.len-200)/s*u+at(-15,15),lane:f*5.4,dir:f,speed:g,base:g})}return this.busBody.instanceColor&&(this.busBody.instanceColor.needsUpdate=!0),this._m=new ne,this._q=new Se,this._e=new Te,this._p=new D,this._s=new D(1,1,1),this._tmp=[0,0,0,0],this.update(0,0),n+s}nearest(t,e){let n=1e9;for(let s of this.items){if(!s.wx)continue;let r=(t-s.wx)**2+(e-s.wz)**2;r<n&&(n=r)}return Math.sqrt(n)}hits(t,e,n=.85){for(let s of this.items){if(!s.wx)continue;let r=t-s.wx,o=e-s.wz;if(r*r+o*o>60)continue;let a=Math.cos(-s.heading),c=Math.sin(-s.heading),l=r*a-o*c,h=r*c+o*a,d=(s.kind==="bus"?1.35:.95)+n,u=(s.kind==="bus"?6:2.25)+n;if(Math.abs(l)<d&&Math.abs(h)<u)return s}return null}update(t,e,n){let{_m:s,_q:r,_e:o,_p:a,_s:c,_tmp:l}=this;for(let h of this.items){let d=h.base;if(n){let S=n.nextStop(h.s,h.dir,t,34);S!==null&&(d=S<=3?0:h.base*Math.min(1,(S-3)/22))}for(let S of this.items){if(S===h||S.dir!==h.dir||Math.abs(S.lane-h.lane)>1.6)continue;let R=(S.s-h.s)*h.dir,_=h.kind==="bus"||S.kind==="bus"?15:9;R>0&&R<_&&(d=Math.min(d,h.base*Math.max(0,(R-4.5)/(_-4.5))))}let u=d<h.speed?7:2.2;h.speed+=(d-h.speed)*Math.min(1,u*e),h.s+=h.dir*h.speed*e,this.path.at(h.s,l);let[f,g,y,p]=l,m=-p,M=y,b=f+m*h.lane,x=g+M*h.lane,T=Math.atan2(y*h.dir,p*h.dir);if(h.wx=b,h.wz=x,h.heading=T,o.set(0,T,0),r.setFromEuler(o),h.kind==="car"){a.set(b,.62,x),s.compose(a,r,c),this.body.setMatrixAt(h.i,s),a.set(b-y*.35*h.dir,1.14,x-p*.35*h.dir),s.compose(a,r,c),this.roof.setMatrixAt(h.i,s),s.compose(a,r,c),this.glaze.setMatrixAt(h.i,s);for(let S=0;S<4;S++){let R=(S<2?1.4:-1.4)*h.dir,_=S%2?.86:-.86;a.set(b+y*R+m*_,.31,x+p*R+M*_),o.set(0,T,Math.PI/2,"YXZ"),this._q2=this._q2||new Se,this._q2.setFromEuler(o),s.compose(a,this._q2,c),this.wheel.setMatrixAt(h.i*4+S,s)}}else{a.set(b,1.55,x),s.compose(a,r,c),this.busBody.setMatrixAt(h.i,s),a.set(b,.62,x),s.compose(a,r,c),this.busSkirt.setMatrixAt(h.i,s),a.set(b,2.05,x),s.compose(a,r,c),this.busGlaze.setMatrixAt(h.i,s),a.set(b+y*5.95*h.dir,2.42,x+p*5.95*h.dir),s.compose(a,r,c),this.busBlind.setMatrixAt(h.i,s);for(let S=0;S<4;S++){let R=(S<2?3.6:-3.6)*h.dir,_=S%2?1.2:-1.2;a.set(b+y*R+m*_,.48,x+p*R+M*_),o.set(0,T,Math.PI/2,"YXZ"),this._q2=this._q2||new Se,this._q2.setFromEuler(o),s.compose(a,this._q2,c),this.busWheel.setMatrixAt(h.i*4+S,s)}}}for(let h of[this.body,this.roof,this.glaze,this.wheel,this.busBody,this.busSkirt,this.busGlaze,this.busBlind,this.busWheel])h.instanceMatrix.needsUpdate=!0}};var ny=[11876142,2051962,14067004,3107663,8011629,13593402,2830131];function wc(i,t,e){let n=0,s=1/0,r=0;for(let f=0;f<i.length-1;f++){let[g,y]=i[f],[p,m]=i[f+1],M=p-g,b=m-y,x=M*M+b*b,T=x<1e-9?0:((t-g)*M+(e-y)*b)/x;T=Math.max(0,Math.min(1,T));let S=g+M*T,R=y+b*T,_=(t-S)**2+(e-R)**2;_<s&&(s=_,n=f,r=T)}let[o,a]=i[n],[c,l]=i[n+1],h=c-o,d=l-a,u=Math.hypot(h,d)||1;return{x:o+h*r,z:a+d*r,ux:h/u,uz:d/u,dist:Math.sqrt(s)}}function cf(i,t,e,n={}){let s=t.p,r=t.w/2,o=[],a=[],c=[],l=[],h=[],d=[],u=[],f=[],g=[],y=0;for(let L=0;L<s.length-1;L++){let[N,U]=s[L],[G,Z]=s[L+1],q=G-N,J=Z-U,K=Math.hypot(q,J);if(K<.5)continue;let ct=q/K,mt=J/K,rt=-mt,k=ct,nt=Math.atan2(ct,mt);for(let tt=0;tt<K;tt+=1,y++){let gt=N+ct*tt,yt=U+mt*tt;for(let dt of[-1,1]){let Yt=(r+1.1)*dt,Nt=gt+rt*Yt,et=yt+k*Yt;if(y%2===0&&!e(Nt,et)&&(o.push([Nt,1,et,nt]),y%4===0&&a.push([Nt,.55,et,nt])),y%46===12){let ot=gt+rt*(r+6.4)*dt,lt=yt+k*(r+6.4)*dt;e(ot,lt)||d.push([ot,.32,lt,nt])}if(y%120===60){let ot=gt+rt*(r+4.2)*dt,lt=yt+k*(r+4.2)*dt;e(ot,lt)||u.push([ot,.46,lt,nt])}if(y%26===8){let ot=gt+rt*(r+12.5)*dt,lt=yt+k*(r+12.5)*dt;e(ot,lt)&&h.push([gt+rt*(r+11.4)*dt,at(6.2,7.6),yt+k*(r+11.4)*dt,nt,dt])}}}}let p={busstops:0,signals:0,taxis:0};for(let L of n.busstops||[]){let[N,U]=L.p,G=wc(s,N,U);if(G.dist>60)continue;let Z=Math.atan2(G.ux,G.uz),q=(N-G.x)*-G.uz+(U-G.z)*G.ux>=0?1:-1;c.push([N,U,Z,q,L.n||""]),p.busstops++}for(let L of n.signals||[]){let[N,U]=L,G=wc(s,N,U);if(G.dist>40)continue;let Z=Math.atan2(G.ux,G.uz),q=(N-G.x)*-G.uz+(U-G.z)*G.ux>=0?1:-1,J=0;for(let K=0;K<s.length-1;K++){let ct=Math.hypot(s[K+1][0]-s[K][0],s[K+1][1]-s[K][1]),mt=wc([s[K],s[K+1]],N,U);if(Math.abs(mt.x-G.x)<.5&&Math.abs(mt.z-G.z)<.5){J+=Math.hypot(G.x-s[K][0],G.z-s[K][1]);break}J+=ct}l.push([N,U,Z,q,Math.round(J)]),p.signals++}for(let L of n.taxis||[]){let N=wc(s,L[0],L[1]);if(N.dist>60)continue;let U=Math.atan2(N.ux,N.uz),G=(L[0]-N.x)*-N.uz+(L[1]-N.z)*N.ux>=0?1:-1;g.push([L[0],L[1],U,G]),p.taxis++}let m=new ne,M=new Se,b=new Te,x=new D,T=new D(1,1,1),S=(L,N,U,G,Z)=>{if(!U.length)return null;let q=new ze(L,N,U.length);return U.forEach((J,K)=>{G(J),m.compose(x,M,T),q.setMatrixAt(K,m),Z&&q.setColorAt(K,Z(J,K))}),q.instanceColor&&(q.instanceColor.needsUpdate=!0),q.castShadow=!1,q.receiveShadow=!0,i.add(q),q},R=L=>{x.set(L[0],L[1],L[2]),b.set(0,L[3],0),M.setFromEuler(b)};S(new ut(.06,.05,2),Lt.metal,o,R),S(new ut(.05,.04,2),Lt.metal,o,L=>{x.set(L[0],.62,L[2]),b.set(0,L[3],0),M.setFromEuler(b)}),S(new qt(.035,.035,1,6),Lt.metal,a,R),S(new qt(.55,.46,.64,10),Lt.conc,d,R),S(new fe(.52,8,6),Lt.canopy,d,L=>{x.set(L[0],.86,L[2]),M.identity()}),S(new qt(.24,.2,.9,8),Lt.darkMetal,u,R);let _=new Vt;S(new ut(.28,1.05,2.6),new Ct({roughness:.55}),h,L=>{x.set(L[0],L[1],L[2]),b.set(0,L[3],0),M.setFromEuler(b)},()=>_.setHex(Ne(ny)));for(let[L,N,U,G,Z]of c){let q=new ge,J=new pt(new ut(9.2,.16,3.1),Lt.trim);J.position.y=3,J.castShadow=!0,q.add(J);for(let rt=0;rt<4;rt++){let k=new pt(new qt(.07,.07,3,8),Lt.metal);k.position.set(-4.1+rt*2.7,1.5,1.35),k.castShadow=!0,q.add(k)}let K=new pt(new ut(8.8,1.7,.08),Lt.glass);K.position.set(0,1.95,-1.4),q.add(K);let ct=new pt(new ut(7.4,.09,.46),Lt.metal);ct.position.set(0,.62,-1.1),ct.castShadow=!0,q.add(ct);let mt=new pt(new ut(.9,1.5,.1),new Ct({color:2568506,roughness:.3}));mt.position.set(4.4,1.7,-1),q.add(mt),q.position.set(L,0,N),q.rotation.y=U,i.add(q)}let E=new Map;for(let[L,N,U,G,Z]of l){let q=new ge,J=new pt(new qt(.09,.11,5.4,8),Lt.darkMetal);J.position.y=2.7,J.castShadow=!0,q.add(J);let K=new pt(new qt(.06,.06,3,6),Lt.darkMetal);K.position.set(-1.5*G,5.2,0),K.rotation.z=Math.PI/2,K.castShadow=!0,q.add(K);let ct=new pt(new ut(.32,.86,.3),Lt.darkMetal);ct.position.set(-2.9*G,4.9,0),ct.castShadow=!0,q.add(ct);let mt=[];for(let rt=0;rt<3;rt++){let k=new pt(new Li(.1,10),new Ct({color:[5906200,5915674,1785639][rt],emissive:0,emissiveIntensity:1}));k.position.set(-2.9*G,5.18-rt*.27,.16),q.add(k),mt.push(k)}q.position.set(L,0,N),q.rotation.y=U,i.add(q),E.has(Z)||E.set(Z,{s:Z,lenses:[],phase:E.size*5.5}),E.get(Z).lenses.push(mt)}for(let[L,N,U,G]of g){let Z=new ge,q=new pt(new qt(.06,.06,3,8),Lt.metal);q.position.y=1.5,q.castShadow=!0,Z.add(q);let J=new pt(new ut(1,.5,.08),new Ct({color:14201916,roughness:.55}));J.position.set(0,2.9,0),J.castShadow=!0,Z.add(J);for(let tt=0;tt<5;tt++){let gt=new pt(new ut(.05,.04,1.4),Lt.metal);gt.position.set(-.9,1,1+tt*1.4),Z.add(gt);let yt=new pt(new qt(.03,.03,1,6),Lt.metal);yt.position.set(-.9,.5,.4+tt*1.4),Z.add(yt)}let K=Math.random()<.5?3104670:2040357,ct=new ge,mt=new Ct({color:K,roughness:.4,metalness:.3}),rt=new Ct({color:2765370,roughness:.12,metalness:.2}),k=(tt,gt,yt,dt,Yt,Nt,et)=>{let ot=new pt(new ut(tt,gt,yt),dt);ot.position.set(Yt,Nt,et),ot.castShadow=!0,ct.add(ot)};k(1.78,.62,4.4,mt,0,.6,0),k(1.64,.52,2.1,mt,0,1.12,-.25),k(1.69,.4,2,rt,0,1.1,-.25),k(.62,.2,.5,new Ct({color:15786672,emissive:14198844,emissiveIntensity:.5}),0,1.48,-.25);let nt=new qt(.31,.31,.22,10);for(let[tt,gt]of[[.86,1.45],[-.86,1.45],[.86,-1.45],[-.86,-1.45]]){let yt=new pt(nt,Lt.darkMetal);yt.rotation.x=Math.PI/2,yt.position.set(tt,.31,gt),yt.castShadow=!0,ct.add(yt)}ct.position.set(-2.6*G,0,2),Z.add(ct),Z.position.set(L,0,N),Z.rotation.y=U,i.add(Z)}let w=[],C=[],P=[],O=0;for(let L of n.covered||[])if(!(L.length<2)){O++;for(let N=0;N<L.length-1;N++){let[U,G]=L[N],[Z,q]=L[N+1],J=Z-U,K=q-G,ct=Math.hypot(J,K);if(ct<.5)continue;let mt=J/ct,rt=K/ct,k=-rt,nt=mt,tt=Math.atan2(mt,rt);for(let gt=0;gt<ct;gt+=3.4){let yt=U+mt*gt,dt=G+rt*gt;C.push([yt,3.35,dt,tt]),P.push([yt,3.12,dt,tt]),w.push([yt+k*1.5,1.6,dt+nt*1.5,tt]),w.push([yt-k*1.5,1.6,dt-nt*1.5,tt])}}}return S(new ut(3.4,.13,4.1),Lt.trim,C,R),S(new ut(.18,.22,4.1),Lt.metal,P,R),S(new qt(.075,.075,3.2,8),Lt.metal,w,R),{signals:[...E.values()],realCovered:O,realBusStops:p.busstops,realSignals:p.signals,realTaxis:p.taxis,taxiStands:g.length,linkway:C.length,rails:o.length,shelters:c.length,lights:l.length,signs:h.length,planters:d.length}}function lf(i,t,e){let n=document.createElement("canvas");n.width=i,n.height=t,e(n.getContext("2d"),i,t);let s=new Qn(n);return s.colorSpace=De,s.anisotropy=4,s}function iy(i){return lf(512,192,(t,e,n)=>{t.fillStyle="#0f6b3f",t.fillRect(0,0,e,n),t.strokeStyle="#f2f4f0",t.lineWidth=5,t.strokeRect(9,9,e-18,n-18),t.fillStyle="#f2f4f0",t.font="600 44px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial",t.textBaseline="middle",i.forEach((s,r)=>{let o=i.length===1?n/2:58+r*62;t.fillText(s.text,34,o),t.save(),t.translate(e-66,o),s.dir==="left"&&t.rotate(Math.PI),t.beginPath(),t.moveTo(-20,0),t.lineTo(14,0),t.moveTo(2,-12),t.lineTo(14,0),t.lineTo(2,12),t.lineWidth=7,t.strokeStyle="#f2f4f0",t.lineJoin="round",t.stroke(),t.restore()})})}function sy(i){return lf(512,128,(t,e,n)=>{t.fillStyle="#f4f4f1",t.fillRect(0,0,e,n),t.fillStyle="#20477e",t.fillRect(0,0,e,22),t.fillStyle="#1b1d1f",t.font="700 52px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial",t.textBaseline="middle",t.textAlign="center";let s=52;for(;t.measureText(i.toUpperCase()).width>e-46&&s>22;)s-=2,t.font=`700 ${s}px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial`;t.fillText(i.toUpperCase(),e/2,n/2+10)})}function hf(i,t,e,n){let s=t.p,r=t.w/2,o={gantries:0,plates:0},a=[...new Set(e.roads.map(l=>l.n).filter(l=>l&&!/orchard road/i.test(l)))],c=0;for(let l=0;l<s.length-1;l++){let[h,d]=s[l],[u,f]=s[l+1],g=u-h,y=f-d,p=Math.hypot(g,y);if(p<.5)continue;let m=g/p,M=y/p,b=-M,x=m,T=Math.atan2(m,M);for(let S=0;S<p;S+=1,c++){let R=h+m*S,_=d+M*S;if(c%230===90){let E=new ge,w=new pt(new qt(.13,.16,7.2,8),Lt.darkMetal);w.position.set(b*(r+1),3.6,x*(r+1)),w.castShadow=!0,E.add(w);let C=new pt(new ut(r*1.1,.16,.16),Lt.darkMetal);C.position.set(b*(r*.45),7,x*(r*.45)),C.rotation.y=T,C.castShadow=!0,E.add(C);let P=Ne(a)||"Scotts Road",O=Ne(a)||"Paterson Road",z=new pt(new be(4.6,1.72),new Cn({map:iy([{text:P.slice(0,16),dir:"left"},{text:O.slice(0,16),dir:"right"}])}));z.position.set(b*(r*.42),5.9,x*(r*.42)),z.rotation.y=T+Math.PI,E.add(z);let L=new pt(new ut(4.6,1.72,.09),Lt.darkMetal);L.position.copy(z.position),L.position.y-=0,L.rotation.y=T,L.castShadow=!0,E.add(L),E.position.set(R,0,_),i.add(E),o.gantries++}if(c%150===40)for(let E of[-1,1]){let w=R+b*(r+2.4)*E,C=_+x*(r+2.4)*E;if(n(w,C))continue;let P=new ge,O=new pt(new qt(.05,.05,2.6,6),Lt.metal);O.position.y=1.3,O.castShadow=!0,P.add(O);let z=new pt(new be(1.5,.38),new Cn({map:sy("Orchard Road"),side:Ce}));z.position.y=2.5,P.add(z),P.position.set(w,0,C),P.rotation.y=T+Math.PI/2,i.add(P),o.plates++}}}return o}var Tc=class{constructor(t,e){this.places=[];for(let n of t.buildings){if(!n.n)continue;let s=0,r=0;for(let o of n.p)s+=o[0],r+=o[1];this.places.push({n:n.n,x:s/n.p.length,z:r/n.p.length,a:n.a})}this.axis=e,this.current="",this.el=document.getElementById("place"),this.map=document.getElementById("map"),this.mapCtx=this.map?this.map.getContext("2d"):null,this.bounds=this._bounds(t),this.base=this._renderBase(t),this._t=0}_bounds(t){let e=1e9,n=-1e9,s=1e9,r=-1e9;for(let o of t.buildings)for(let[a,c]of o.p)a<e&&(e=a),a>n&&(n=a),c<s&&(s=c),c>r&&(r=c);return{mnx:e,mxx:n,mnz:s,mxz:r}}_renderBase(t){if(!this.map)return null;let e=this.map.width,n=document.createElement("canvas");n.width=n.height=e;let s=n.getContext("2d"),{mnx:r,mxx:o,mnz:a,mxz:c}=this.bounds,l=Math.max(o-r,c-a)||1,h=u=>(u-r)/l*e*.94+e*.03,d=u=>(u-a)/l*e*.94+e*.03;this.px=h,this.pz=d,s.fillStyle="rgba(12,16,20,0.72)",s.fillRect(0,0,e,e),s.fillStyle="rgba(198,205,212,0.30)";for(let u of t.buildings)s.beginPath(),u.p.forEach(([f,g],y)=>y?s.lineTo(h(f),d(g)):s.moveTo(h(f),d(g))),s.closePath(),s.fill();return s.strokeStyle="rgba(255,214,150,0.95)",s.lineWidth=2.2,s.beginPath(),this.axis.p.forEach(([u,f],g)=>g?s.lineTo(h(u),d(f)):s.moveTo(h(u),d(f))),s.stroke(),n}update(t,e){if(this._t+=e,this._t<.25)return;this._t=0;let n=null,s=1/0;for(let r of this.places){let o=Math.hypot(r.x-t.x,r.z-t.z)-Math.min(60,Math.sqrt(r.a)*.5);o<s&&(s=o,n=r)}if(this.el){let r=n&&s<90?n.n:"Orchard Road";r!==this.current&&(this.current=r,this.el.textContent=r)}if(this.mapCtx&&this.base){let r=this.map.width,o=this.mapCtx;o.clearRect(0,0,r,r),o.drawImage(this.base,0,0);let a=this.px(t.x),c=this.pz(t.z);o.save(),o.translate(a,c),o.rotate(-t.heading),o.fillStyle="rgba(255,214,150,0.28)",o.beginPath(),o.moveTo(0,0),o.arc(0,0,16,-Math.PI/2-.5,-Math.PI/2+.5),o.closePath(),o.fill(),o.restore(),o.fillStyle="#ffd696",o.beginPath(),o.arc(a,c,3.4,0,Math.PI*2),o.fill()}}};var bn=new URLSearchParams(location.search),mf=document.getElementById("hud"),cs=document.getElementById("c"),un=new uc({canvas:cs,antialias:!0,powerPreference:"high-performance"});un.outputColorSpace=De;un.toneMapping=Or;un.toneMappingExposure=1;un.shadowMap.enabled=!bn.has("noshadow");un.shadowMap.type=_a;var wn=new dr;wn.fog=new ur(13222834,.0021);var je=new sn(58,1,.3,1400),rs=new D(-.52,.8,-.3).normalize();wn.add(new pt(new fe(900,40,24),new ln({side:Ke,depthWrite:!1,fog:!1,uniforms:{top:{value:new Vt(Ye.skyTop)},mid:{value:new Vt(Ye.skyMid)},haze:{value:new Vt(Ye.skyHaze)},cloud:{value:new Vt(Ye.cloud)},sun:{value:rs.clone()}},vertexShader:`varying vec3 vW;
      void main(){ vW = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,fragmentShader:`
      uniform vec3 top, mid, haze, cloud; uniform vec3 sun; varying vec3 vW;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
      float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
      float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*vnoise(p); p*=2.03; a*=0.5; } return v; }
      void main(){
        vec3 d = normalize(vW);
        float h = clamp(d.y, 0.0, 1.0);
        vec3 c = mix(haze, mid, pow(h, 0.40));
        c = mix(c, top, pow(h, 1.45));
        if (d.y > 0.015) {
          vec2 p = d.xz / (d.y + 0.11) * 1.30;
          float n = fbm(p*1.05 + vec2(3.2,1.7))*0.66 + fbm(p*2.60 + vec2(-1.0,4.4))*0.34;
          float cov = smoothstep(0.46, 0.73, n);
          float fade = smoothstep(0.02, 0.24, d.y);
          float lit = pow(max(dot(d, normalize(sun)), 0.0), 2.0);
          vec3 cc = mix(cloud*0.80, cloud, 0.35 + 0.65*lit);
          cc = mix(cc, vec3(0.62,0.62,0.66), (1.0-cov)*0.30);
          c = mix(c, cc, cov*fade*0.92);
        }
        float dp = max(dot(d, normalize(sun)), 0.0);
        c += vec3(1.0,0.80,0.55)*pow(dp,8.0)*0.55;
        c += vec3(1.0,0.86,0.68)*pow(dp,1.8)*0.10;
        gl_FragColor = vec4(c,1.0);
      }`})));var $e=new Ur(16773334,2.6);$e.castShadow=!0;$e.shadow.mapSize.set(2048,2048);$e.shadow.camera.left=-95;$e.shadow.camera.right=95;$e.shadow.camera.top=95;$e.shadow.camera.bottom=-95;$e.shadow.camera.near=1;$e.shadow.camera.far=460;$e.shadow.bias=-5e-4;$e.shadow.normalBias=.05;wn.add($e,$e.target);wn.add(new Lr(10930402,9733487,1.35));var Qe=new ge;wn.add(Qe);var $s=12,Ac=new Map;function ry(i){for(let t of i.buildings){let e=1e9,n=-1e9,s=1e9,r=-1e9;for(let[o,a]of t.p)e=Math.min(e,o),n=Math.max(n,o),s=Math.min(s,a),r=Math.max(r,a);for(let o=Math.floor(e/$s);o<=Math.floor(n/$s);o++)for(let a=Math.floor(s/$s);a<=Math.floor(r/$s);a++){let c=o+","+a;Ac.has(c)||Ac.set(c,[]),Ac.get(c).push(t.p)}}}function oy(i,t,e){let n=!1;for(let s=0,r=i.length-1;s<i.length;r=s++){let o=i[s][0],a=i[s][1],c=i[r][0],l=i[r][1];a>e!=l>e&&t<(c-o)*(e-a)/(l-a)+o&&(n=!n)}return n}function En(i,t){let e=Ac.get(Math.floor(i/$s)+","+Math.floor(t/$s));if(!e)return!1;for(let n of e)if(oy(n,i,t))return!0;return!1}function ay(i,t){if(!t)return 0;let e=i,n=t.p,s=t.w/2,r=new to,o=[],a=[],c=[],l=[],h=[],d=[],u=0;for(let x=0;x<n.length-1;x++){let[T,S]=n[x],[R,_]=n[x+1],E=R-T,w=_-S,C=Math.hypot(E,w);if(C<.5)continue;let P=E/C,O=w/C,z=-O,L=P,N=Math.atan2(P,O);for(let U=0;U<C;U+=1,u++){let G=T+P*U,Z=S+O*U;for(let q of[-1,1]){let J=G+z*(s+.4)*q,K=Z+L*(s+.4)*q;if(u%13===(q>0?0:6))for(let ct of[3.2,2.2,4.4]){let mt=G+z*(s+ct)*q,rt=Z+L*(s+ct)*q;if(!En(mt,rt)){r.add(mt,rt,at(.85,1.15));break}}u%34===0&&(a.push([J,4.5,K,0]),c.push([J-z*1.1*q,8.9,K-L*1.1*q,N,q]),l.push([J-z*2.3*q,8.75,K-L*2.3*q,N])),u%2===0&&o.push([J,.15,K,N])}}}let f=0;for(let x of e.crossings||[]){let[T,S]=x,R=0,_=1/0,E=0;for(let rt=0;rt<n.length-1;rt++){let[k,nt]=n[rt],[tt,gt]=n[rt+1],yt=tt-k,dt=gt-nt,Yt=yt*yt+dt*dt,Nt=Yt<1e-9?0:((T-k)*yt+(S-nt)*dt)/Yt;Nt=Math.max(0,Math.min(1,Nt));let et=(T-(k+yt*Nt))**2+(S-(nt+dt*Nt))**2;et<_&&(_=et,R=rt,E=Nt)}if(Math.sqrt(_)>s+6)continue;let[w,C]=n[R],[P,O]=n[R+1],z=P-w,L=O-C,N=Math.hypot(z,L)||1,U=z/N,G=L/N,Z=-G,q=U,J=w+z*E,K=C+L*E,ct=Math.atan2(U,G);for(let rt=-3;rt<=3;rt++)h.push([J+U*rt*1.3,.035,K+G*rt*1.3,ct+Math.PI/2]);let mt=0;for(let rt=0;rt<R;rt++)mt+=Math.hypot(n[rt+1][0]-n[rt][0],n[rt+1][1]-n[rt][1]);mt+=Math.hypot(J-w,K-C),d.push(Math.round(mt)),f++}window.__realCrossings=f;let g=new ne,y=new Se,p=new Te,m=new D,M=new D(1,1,1),b=(x,T,S,R)=>{if(!S.length)return;let _=new ze(x,T,S.length);S.forEach((E,w)=>{R(E),g.compose(m,y,M),_.setMatrixAt(w,g)}),_.castShadow=!1,_.receiveShadow=!0,Qe.add(_)};return b(new ut(.42,.3,2),Lt.kerb,o,x=>{m.set(x[0],x[1],x[2]),p.set(0,x[3],0),y.setFromEuler(p)}),b(new qt(.11,.16,9,8),Lt.metal,a,x=>{m.set(x[0],x[1],x[2]),y.identity()}),b(new qt(.07,.07,2.4,6),Lt.metal,c,x=>{m.set(x[0],x[1],x[2]),p.set(0,x[3],Math.PI/2-.2*x[4]),y.setFromEuler(p)}),b(new ut(1,.2,.44),Lt.trim,l,x=>{m.set(x[0],x[1],x[2]),p.set(0,x[3],0),y.setFromEuler(p)}),b(new be(.62,t.w),Lt.white,h,x=>{m.set(x[0],x[1],x[2]),p.set(-Math.PI/2,x[3],0,"YXZ"),y.setFromEuler(p)}),window.__crossings=d,r.build(Qe)}var ro=Yd(),bh=Zd();ro.group.add(bh);var Cc=new ge;Cc.add(ro.group);wn.add(Cc);var Dt=xc(0,0,0),gf=!1,oo={},Vn=null,We=null,so=null,Un=null,Nn="ride",yi=new Mc;for(let i of["touchstart","touchend","pointerdown","mousedown","keydown","click"])addEventListener(i,()=>{yi.start(),yi.poke()},{passive:!0});var os=0,ao=.16,te=jd(),as=ef();as.group.visible=!1;wn.add(as.group);var _i=0;fetch("./data/orchard.json").then(i=>i.json()).then(i=>{ry(i);let t=bn.has("nobuild")?{count:0,tall:0}:Xd(Qe,i),e=qd(Qe,i),n=i.axis||e,s=new pt(new be(2600,2600),new Ct({color:10130308,roughness:.95}));s.rotation.x=-Math.PI/2,s.position.y=-.05,s.receiveShadow=!0,Qe.add(s);let r=bn.has("nofoliage")?0:ay(i,n);!bn.has("nopeople")&&n&&(Vn=new bc(n,En,260),Vn.build(Qe),window.__crossings&&Vn.setCrossings(window.__crossings)),!bn.has("notraffic")&&n&&(We=new Ec(n,18,3),We.build(Qe,We.path.nearestS(Dt.x,Dt.z)));let o=!bn.has("nofurniture")&&n?cf(Qe,n,En,i):{};Un=new vc(o.signals||[]);let a=!bn.has("nosigns")&&n?hf(Qe,n,i,En):{},c=!bn.has("nomarks")&&n?nf(Qe,n):0,l=!bn.has("noside")&&n?sf(Qe,i,n,En,to):{},h=!bn.has("nosg")&&n?af(Qe,n,i,En):{};n&&(so=new Tc(i,n)),window.__axis=n,window.__roadList=i.roads.filter(u=>u.k!=="footway"&&u.k!=="pedestrian");let d=Vn?Vn.people.length:0;if(n){let u=0,f=1/0;for(let T=0;T<n.p.length-1;T++){let S=n.p[T][0]*n.p[T][0]+n.p[T][1]*n.p[T][1];S<f&&(f=S,u=T)}let g=n.p[u],y=n.p[Math.min(u+1,n.p.length-1)],p=y[0]-g[0],m=y[1]-g[1],M=Math.hypot(p,m)||1,b=-m/M,x=p/M;Dt=xc(g[0]+b*-3.4,g[1]+x*-3.4,Math.atan2(p,m))}cy(),oo={marks:c,...l,...h,realCrossings:window.__realCrossings,merged:t.mergedMeshes,shophouses:t.shophouses,junctions:(o.signals||[]).length,buildings:t.count,bespoke:t.bespoke,towers:t.tall,roads:i.roads.length,people:d,trees:r,...o,...a},gf=!0,window.__ready=!0,window.__stats=oo}).catch(i=>{window.__bootError=i&&i.stack||String(i),mf.textContent="boot failed: "+i.message,console.error("BOOT",i)});_h&&$d(cs);Jd(cs);{let i=document.getElementById("soundbtn");if(i){let t=e=>{e.preventDefault(),e.stopPropagation(),yi.start(),yi.setMuted(!yi.muted),i.textContent=yi.muted?"Sound off":"Sound on"};i.addEventListener("click",t),i.addEventListener("touchstart",t,{passive:!1})}}{let i=document.getElementById("modebtn");if(i){let t=e=>{e.preventDefault(),e.stopPropagation(),wh()};i.addEventListener("click",t),i.addEventListener("touchstart",t,{passive:!1})}}function cy(){let i=new Vs(256,{generateMipmaps:!0,minFilter:ti}),t=new Fs(1,900,i);t.position.set(0,34,0),wn.add(t),t.update(un,wn),wn.remove(t);let e=0;wn.traverse(n=>{let s=n.material;if(s)for(let r of Array.isArray(s)?s:[s])r.isMeshStandardMaterial&&(r.roughness>.45||(r.envMap=i.texture,r.envMapIntensity=r.roughness<.25?.95:.5,r.needsUpdate=!0,e++))}),window.__envMats=e}var xf=bn.get("cam")||"ride",oi=new Fi(-260,260,260,-260,1,2e3);oi.up.set(0,0,-1);oi.position.set(0,900,0);oi.lookAt(0,0,0);function wh(){if(Nn==="ride"){let i=Math.cos(Dt.heading),t=-Math.sin(Dt.heading),e=Dt.x+i*1.2,n=Dt.z+t*1.2;En(e,n)&&(e=Dt.x-i*1.2,n=Dt.z-t*1.2),te.x=e,te.z=n,te.heading=Dt.heading,te.speed=0,Dt.speed=0,Dt.reversing=!1,os=Dt.heading,ao=.16,as.group.visible=!0,bh.visible=!1,Nn="walk"}else{if(Math.hypot(te.x-Dt.x,te.z-Dt.z)>6)return;as.group.visible=!1,bh.visible=!0,Ic=!1,Nn="ride"}ly()}var uf=document.getElementById("stick"),df=document.getElementById("knob"),ff=document.getElementById("lookhint");function ly(){uf&&uf.classList.toggle("on",Nn==="walk"),ff&&ff.classList.toggle("on",Nn==="walk");let i=document.getElementById("help");if(!i)return;i.innerHTML=Nn==="ride"?'<b>hold left side</b> throttle<br><b>hold lower left</b> brake<br><b>hold brake stopped</b> reverse<br><b>drag right side</b> steer<br><span style="opacity:.65">keys: A/D \xB7 W \xB7 S \xB7 E to get off</span>':'<b>drag left side</b> walk<br><b>drag right side</b> look around<br><span style="opacity:.65">keys: WASD \xB7 shift to run \xB7 E to ride</span>';let t=document.getElementById("modebtn");t&&(t.textContent=Nn==="ride"?"Get off":"Ride")}function hy(i){let s=Math.sin(os),r=Math.cos(os),o=-r,a=s,c=Math.sin(ao),l=Math.cos(ao);je.position.set(te.x-s*2.15*l+o*.66,1.78+2.15*c*.75,te.z-r*2.15*l+a*.66);let h=12;je.lookAt(te.x+s*h*l+o*.66,1.78-c*h,te.z+r*h*l+a*.66),je.fov=65,je.updateProjectionMatrix()}var vh=new D,Mh=new D,Ic=!1,Gi=(bn.get("spec")||"").split(",").map(Number),uy=Gi.length===6&&Gi.every(i=>Number.isFinite(i));function dy(i){if(uy){je.position.set(Gi[0],Gi[1],Gi[2]),je.lookAt(Gi[3],Gi[4],Gi[5]),je.fov=46,je.updateProjectionMatrix();return}let t=new D(Math.sin(Dt.heading),0,Math.cos(Dt.heading)),e=new D(Dt.x,0,Dt.z).addScaledVector(t,-5.8).add(new D(0,3.05,0)),n=new D(Dt.x,1.35,Dt.z).addScaledVector(t,7.5);Ic||(vh.copy(e),Mh.copy(n),Ic=!0),vh.lerp(e,Math.min(1,i*4.2)),Mh.lerp(n,Math.min(1,i*6)),je.position.copy(vh),je.lookAt(Mh),je.fov=58+Dt.speed/an.vMax*12,je.updateProjectionMatrix()}var fy=parseFloat(bn.get("dpr")||"0");function _f(){let i=cs.clientWidth,t=cs.clientHeight;un.setPixelRatio(fy||Math.min(devicePixelRatio||1,2)),un.setSize(i,t,!1),je.aspect=i/t,je.updateProjectionMatrix();let e=i/t,n=440;oi.left=-n*e,oi.right=n*e,oi.top=n,oi.bottom=-n,oi.updateProjectionMatrix()}addEventListener("resize",_f);_f();var Eh=performance.now(),Pc=0,Lc=Eh,Sh=0;function Rc(i){let t=Math.min(.05,(i-Eh)/1e3);if(Eh=i,document.hidden){requestAnimationFrame(Rc);return}if(gf){let e=Kd(Nn);if(Ie.toggleMode&&(Ie.toggleMode=!1,wh()),window.__force&&(e.throttle=window.__force.throttle??e.throttle,e.brake=window.__force.brake??e.brake,e.steer=window.__force.steer??e.steer),Nn==="walk"){os-=e.lookDX*.0045,ao=Math.max(-.35,Math.min(.95,ao+e.lookDY*.0035));let r=Math.sin(os),o=Math.cos(os),a=-e.moveY*r-e.moveX*o,c=-e.moveY*o+e.moveX*r,l=te.x,h=te.z;tf(te,t,a,c,e.run),We&&We.hits(te.x,te.z,.32)&&(te.x=l,te.z=h,te.speed=0),En(te.x,te.z)&&(En(te.x,h)?En(l,te.z)?(te.x=l,te.z=h):te.x=l:te.z=h),df&&(df.style.transform=`translate(${Ie.stickDX.toFixed(1)}px, ${Ie.stickDY.toFixed(1)}px)`),as.group.position.set(te.x,0,te.z),as.group.rotation.y=te.heading,as.pose(te.phase,te.speed),$e.position.set(te.x+rs.x*150,rs.y*150,te.z+rs.z*150),$e.target.position.set(te.x,0,te.z),$e.target.updateMatrixWorld(),_i+=t,Un&&Un.update(_i),We&&We.update(_i,t,Un),Vn&&Vn.update(_i,t,te.x,te.z,Un),so&&so.update(te,t),yi.update(0,"walk",te.speed,te.phase,We?We.nearest(te.x,te.z):999),hy(t),un.render(wn,je),Pc++,i-Lc>1e3&&pf(i),requestAnimationFrame(Rc);return}let n=Dt.x,s=Dt.z;if(mh(Dt,t,e.throttle,e.brake,e.steer),We&&We.hits(Dt.x,Dt.z,.55)&&(Dt.x=n,Dt.z=s,Dt.speed*=-.12,Math.abs(Dt.speed)<.4&&(Dt.speed=0)),En(Dt.x,Dt.z)){let r={x:Dt.x,z:s},o={x:n,z:Dt.z};En(r.x,r.z)?En(o.x,o.z)?(Dt.x=n,Dt.z=s,Dt.speed*=.2):(Dt.x=n,Dt.speed*=.86):(Dt.z=s,Dt.speed*=.86)}Cc.position.set(Dt.x,0,Dt.z),Cc.rotation.y=Dt.heading,ro.group.rotation.z=Dt.lean,ro.wheels[0].rotation.x=-Dt.wheel,ro.wheels[1].rotation.x=-Dt.wheel,$e.position.set(Dt.x+rs.x*150,rs.y*150,Dt.z+rs.z*150),$e.target.position.set(Dt.x,0,Dt.z),$e.target.updateMatrixWorld(),_i+=t,Un&&Un.update(_i),We&&We.update(_i,t,Un),Vn&&Vn.update(_i,t,Dt.x,Dt.z,Un),so&&so.update(Dt,t),yi.update(Dt.speed,"ride",0,0,We?We.nearest(Dt.x,Dt.z):999),dy(t)}un.render(wn,xf==="top"?oi:je),Pc++,i-Lc>1e3&&pf(i),requestAnimationFrame(Rc)}function pf(i){{Sh=Math.round(Pc*1e3/(i-Lc)),Pc=0,Lc=i;let t=un.getPixelRatio(),e=Math.round(cs.clientWidth*t)+"x"+Math.round(cs.clientHeight*t);mf.textContent=`${Sh} fps \xB7 ${e} @dpr${t} \xB7 ${un.info.render.triangles/1e3|0}k tris \xB7 ${un.info.render.calls} draws \xB7 `+(Nn==="walk"?"on foot":`${Math.abs(Dt.speed*3.6)|0} km/h${Dt.reversing?" R":""}`)+(oo.buildings?` \xB7 ${oo.buildings} buildings`:""),window.__probe={fps:Sh,tris:un.info.render.triangles,calls:un.info.render.calls,px:e,dpr:t,kmh:+(Dt.speed*3.6).toFixed(1),mode:Nn,...oo}}}requestAnimationFrame(Rc);window.__drive=(i,t,e)=>{window.__force={throttle:i,steer:t,brake:0},setTimeout(()=>{window.__force=null},e*1e3)};window.__inp=()=>({TOUCH:_h,steer:Ie.steer,throttle:Ie.throttle,brake:Ie.brake,touches:Qd(),fired:window.__touchFired||0});window.__snd=yi;window.__auditRoads=(i=4)=>{let t=new Nr,e=new D(0,1,0),n=new D,s={tested:0,obstruct:[],overhang:[]},r=window.__roadList||[];for(let a of r){let c=a.p,l=a.w/2;for(let h=0;h<c.length-1;h++){let[d,u]=c[h],[f,g]=c[h+1],y=f-d,p=g-u,m=Math.hypot(y,p);if(m<1)continue;let M=y/m,b=p/m,x=-b,T=M;for(let S=0;S<m;S+=i){let R=d+M*S,_=u+b*S;for(let E=-l+1.4;E<=l-1.4;E+=2.8){if(/orchard road/i.test(a.n||"")&&Math.abs(E)<2)continue;s.tested++;let C=R+x*E,P=_+T*E;n.set(C,.4,P),t.set(n,e),t.near=0,t.far=1.6;let O=t.intersectObjects(Qe.children,!0),z=We?We.nearest(C,P):999;O.length&&z>4.5&&s.obstruct.push({road:a.n||a.k,x:+C.toFixed(1),z:+P.toFixed(1),off:+E.toFixed(1),h:+(.4+O[0].distance).toFixed(2)}),n.set(C,2.6,P),t.set(n,e),t.far=2,O=t.intersectObjects(Qe.children,!0),O.length&&z>4.5&&s.overhang.push({road:a.n||a.k,x:+C.toFixed(1),z:+P.toFixed(1),off:+E.toFixed(1),h:+(2.6+O[0].distance).toFixed(2)})}}}}let o=a=>{let c={};for(let l of a)c[l.road]=(c[l.road]||0)+1;return Object.entries(c).sort((l,h)=>h[1]-l[1]).slice(0,12)};return{tested:s.tested,obstruct:s.obstruct.length,obstructPct:+(100*s.obstruct.length/s.tested).toFixed(2),overhang:s.overhang.length,overhangPct:+(100*s.overhang.length/s.tested).toFixed(2),worstObstruct:o(s.obstruct),worstOverhang:o(s.overhang),sampleObstruct:s.obstruct.slice(0,12),sampleOverhang:s.overhang.slice(0,8)}};window.__crossers=()=>Vn?Vn.people.filter(i=>i.crossing).length:0;window.__sig=()=>Un?Un.list.map(i=>Un.stateAt(i,_i)):[];window.__traffic=()=>We?We.items.map(i=>+i.speed.toFixed(2)):[];window.__camYaw=()=>os;window.__mode=()=>Nn;window.__toggle=()=>wh();window.__walker=()=>({x:+te.x.toFixed(1),z:+te.z.toFixed(1),sp:+te.speed.toFixed(2)});window.__state=()=>({x:+Dt.x.toFixed(1),z:+Dt.z.toFixed(1),kmh:+(Dt.speed*3.6).toFixed(1)});window.__dbg=()=>{let i=new Rn().setFromObject(Qe),t=xf==="top"?oi:je;return{worldBox:{min:[i.min.x|0,i.min.y|0,i.min.z|0],max:[i.max.x|0,i.max.y|0,i.max.z|0]},children:Qe.children.length,camType:t.type,camPos:[t.position.x|0,t.position.y|0,t.position.z|0],camDir:(()=>{let e=new D;return t.getWorldDirection(e),[+e.x.toFixed(2),+e.y.toFixed(2),+e.z.toFixed(2)]})(),ortho:t.isOrthographicCamera?[t.left|0,t.right|0,t.top|0,t.bottom|0,t.near,t.far]:null}};window.__setState=(i,t,e)=>{Dt.x=i,Dt.z=t,Dt.heading=e,Ic=!1};
/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
