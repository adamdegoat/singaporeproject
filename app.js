var hu=0,Ml=1,uu=2;var Fr=1,_a=2,Bs=3,fi=0,Ke=1,Ce=2,jn=0,Ki=1,Sl=2,bl=3,Br=4,du=5;var Ii=100,fu=101,pu=102,mu=103,gu=104,xu=200,_u=201,yu=202,vu=203,No=204,Fo=205,Mu=206,Su=207,bu=208,Eu=209,wu=210,Tu=211,Au=212,Ru=213,Cu=214,Bo=0,Oo=1,zo=2,Qi=3,Ho=4,Go=5,ko=6,Vo=7,ya=0,Iu=1,Pu=2,Hn=0,El=1,wl=2,Tl=3,Or=4,Al=5,Rl=6,Cl=7;var Il=300,Bi=301,ts=302,va=303,Ma=304,zr=306,ws=1e3,$n=1001,Wo=1002,qe=1003,Lu=1004;var Hr=1005;var Je=1006,Sa=1007;var ti=1008;var pn=1009,Pl=1010,Ll=1011,Os=1012,ba=1013,Gn=1014,In=1015,ei=1016,Ea=1017,wa=1018,zs=1020,Dl=35902,Ul=35899,Nl=1021,Fl=1022,Pn=1023,Jn=1026,Oi=1027,Ta=1028,Aa=1029,zi=1030,Ra=1031;var Ca=1033,Gr=33776,kr=33777,Vr=33778,Wr=33779,Ia=35840,Pa=35841,La=35842,Da=35843,Ua=36196,Na=37492,Fa=37496,Ba=37488,Oa=37489,Xr=37490,za=37491,Ha=37808,Ga=37809,ka=37810,Va=37811,Wa=37812,Xa=37813,qa=37814,Ya=37815,Za=37816,$a=37817,Ja=37818,Ka=37819,Qa=37820,ja=37821,tc=36492,ec=36494,nc=36495,ic=36283,sc=36284,qr=36285,rc=36286;var or=2300,Xo=2301,Uo=2302,ol=2303,al=2400,cl=2401,ll=2402;var Du=3200;var Yr=0,Uu=1,xi="",De="srgb",ar="srgb-linear",cr="linear",de="srgb";var Zi=7680;var hl=519,Nu=512,Fu=513,Bu=514,oc=515,Ou=516,zu=517,ac=518,Hu=519,ul=35044;var Bl="300 es",zn=2e3,Ts=2001;function wf(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Tf(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function lr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Gu(){let i=lr("canvas");return i.style.display="block",i}var Uh={},As=null;function Ol(...i){let t="THREE."+i.shift();As?As("log",t,...i):console.log(t,...i)}function ku(i){let t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function $t(...i){i=ku(i);let t="THREE."+i.shift();if(As)As("warn",t,...i);else{let e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function Zt(...i){i=ku(i);let t="THREE."+i.shift();if(As)As("error",t,...i);else{let e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function Ji(...i){let t=i.join(" ");t in Uh||(Uh[t]=!0,$t(...i))}function Vu(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var Wu={[Bo]:Oo,[zo]:ko,[Ho]:Vo,[Qi]:Go,[Oo]:Bo,[ko]:zo,[Vo]:Ho,[Go]:Qi},Kn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}},en=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Dc=Math.PI/180,qo=180/Math.PI;function Hs(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(en[i&255]+en[i>>8&255]+en[i>>16&255]+en[i>>24&255]+"-"+en[t&255]+en[t>>8&255]+"-"+en[t>>16&15|64]+en[t>>24&255]+"-"+en[e&63|128]+en[e>>8&255]+"-"+en[e>>16&255]+en[e>>24&255]+en[n&255]+en[n>>8&255]+en[n>>16&255]+en[n>>24&255]).toLowerCase()}function le(i,t,e){return Math.max(t,Math.min(e,i))}function Af(i,t){return(i%t+t)%t}function Uc(i,t,e){return(1-e)*i+e*t}function Js(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function dn(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var pt=class i{static{i.prototype.isVector2=!0}constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=le(this.x,t.x,e.x),this.y=le(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=le(this.x,t,e),this.y=le(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(le(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(le(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Se=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let c=n[s+0],l=n[s+1],h=n[s+2],d=n[s+3],u=r[o+0],f=r[o+1],g=r[o+2],y=r[o+3];if(d!==y||c!==u||l!==f||h!==g){let p=c*u+l*f+h*g+d*y;p<0&&(u=-u,f=-f,g=-g,y=-y,p=-p);let m=1-a;if(p<.9995){let M=Math.acos(p),E=Math.sin(M);m=Math.sin(m*M)/E,a=Math.sin(a*M)/E,c=c*m+u*a,l=l*m+f*a,h=h*m+g*a,d=d*m+y*a}else{c=c*m+u*a,l=l*m+f*a,h=h*m+g*a,d=d*m+y*a;let M=1/Math.sqrt(c*c+l*l+h*h+d*d);c*=M,l*=M,h*=M,d*=M}}t[e]=c,t[e+1]=l,t[e+2]=h,t[e+3]=d}static multiplyQuaternionsFlat(t,e,n,s,r,o){let a=n[s],c=n[s+1],l=n[s+2],h=n[s+3],d=r[o],u=r[o+1],f=r[o+2],g=r[o+3];return t[e]=a*g+h*d+c*f-l*u,t[e+1]=c*g+h*u+l*d-a*f,t[e+2]=l*g+h*f+a*u-c*d,t[e+3]=h*g-a*d-c*u-l*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,c=Math.sin,l=a(n/2),h=a(s/2),d=a(r/2),u=c(n/2),f=c(s/2),g=c(r/2);switch(o){case"XYZ":this._x=u*h*d+l*f*g,this._y=l*f*d-u*h*g,this._z=l*h*g+u*f*d,this._w=l*h*d-u*f*g;break;case"YXZ":this._x=u*h*d+l*f*g,this._y=l*f*d-u*h*g,this._z=l*h*g-u*f*d,this._w=l*h*d+u*f*g;break;case"ZXY":this._x=u*h*d-l*f*g,this._y=l*f*d+u*h*g,this._z=l*h*g+u*f*d,this._w=l*h*d-u*f*g;break;case"ZYX":this._x=u*h*d-l*f*g,this._y=l*f*d+u*h*g,this._z=l*h*g-u*f*d,this._w=l*h*d+u*f*g;break;case"YZX":this._x=u*h*d+l*f*g,this._y=l*f*d+u*h*g,this._z=l*h*g-u*f*d,this._w=l*h*d-u*f*g;break;case"XZY":this._x=u*h*d-l*f*g,this._y=l*f*d-u*h*g,this._z=l*h*g+u*f*d,this._w=l*h*d+u*f*g;break;default:$t("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],c=e[9],l=e[2],h=e[6],d=e[10],u=n+a+d;if(u>0){let f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(h-c)*f,this._y=(r-l)*f,this._z=(o-s)*f}else if(n>a&&n>d){let f=2*Math.sqrt(1+n-a-d);this._w=(h-c)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+l)/f}else if(a>d){let f=2*Math.sqrt(1+a-n-d);this._w=(r-l)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(c+h)/f}else{let f=2*Math.sqrt(1+d-n-a);this._w=(o-s)/f,this._x=(r+l)/f,this._y=(c+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(le(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,c=e._y,l=e._z,h=e._w;return this._x=n*h+o*a+s*l-r*c,this._y=s*h+o*c+r*a-n*l,this._z=r*h+o*l+n*c-s*a,this._w=o*h-n*a-s*c-r*l,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=this.dot(t);a<0&&(n=-n,s=-s,r=-r,o=-o,a=-a);let c=1-e;if(a<.9995){let l=Math.acos(a),h=Math.sin(l);c=Math.sin(c*l)/h,e=Math.sin(e*l)/h,this._x=this._x*c+n*e,this._y=this._y*c+s*e,this._z=this._z*c+r*e,this._w=this._w*c+o*e,this._onChangeCallback()}else this._x=this._x*c+n*e,this._y=this._y*c+s*e,this._z=this._z*c+r*e,this._w=this._w*c+o*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},L=class i{static{i.prototype.isVector3=!0}constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Nh.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Nh.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,c=t.w,l=2*(o*s-a*n),h=2*(a*e-r*s),d=2*(r*n-o*e);return this.x=e+c*l+o*d-a*h,this.y=n+c*h+a*l-r*d,this.z=s+c*d+r*h-o*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=le(this.x,t.x,e.x),this.y=le(this.y,t.y,e.y),this.z=le(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=le(this.x,t,e),this.y=le(this.y,t,e),this.z=le(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(le(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,c=e.z;return this.x=s*c-r*a,this.y=r*o-n*c,this.z=n*a-s*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Nc.copy(this).projectOnVector(t),this.sub(Nc)}reflect(t){return this.sub(Nc.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(le(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Nc=new L,Nh=new Se,Qt=class i{static{i.prototype.isMatrix3=!0}constructor(t,e,n,s,r,o,a,c,l){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,c,l)}set(t,e,n,s,r,o,a,c,l){let h=this.elements;return h[0]=t,h[1]=s,h[2]=a,h[3]=e,h[4]=r,h[5]=c,h[6]=n,h[7]=o,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],h=n[4],d=n[7],u=n[2],f=n[5],g=n[8],y=s[0],p=s[3],m=s[6],M=s[1],E=s[4],_=s[7],A=s[2],S=s[5],w=s[8];return r[0]=o*y+a*M+c*A,r[3]=o*p+a*E+c*S,r[6]=o*m+a*_+c*w,r[1]=l*y+h*M+d*A,r[4]=l*p+h*E+d*S,r[7]=l*m+h*_+d*w,r[2]=u*y+f*M+g*A,r[5]=u*p+f*E+g*S,r[8]=u*m+f*_+g*w,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8];return e*o*h-e*a*l-n*r*h+n*a*c+s*r*l-s*o*c}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8],d=h*o-a*l,u=a*c-h*r,f=l*r-o*c,g=e*d+n*u+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/g;return t[0]=d*y,t[1]=(s*l-h*n)*y,t[2]=(a*n-s*o)*y,t[3]=u*y,t[4]=(h*e-s*c)*y,t[5]=(s*r-a*e)*y,t[6]=f*y,t[7]=(n*c-l*e)*y,t[8]=(o*e-n*r)*y,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){let c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*o+l*a)+o+t,-s*l,s*c,-s*(-l*o+c*a)+a+e,0,0,1),this}scale(t,e){return Ji("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Fc.makeScale(t,e)),this}rotate(t){return Ji("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Fc.makeRotation(-t)),this}translate(t,e){return Ji("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Fc.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Fc=new Qt,Fh=new Qt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Bh=new Qt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Rf(){let i={enabled:!0,workingColorSpace:ar,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===de&&(s.r=di(s.r),s.g=di(s.g),s.b=di(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===de&&(s.r=Es(s.r),s.g=Es(s.g),s.b=Es(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===xi?cr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Ji("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Ji("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[ar]:{primaries:t,whitePoint:n,transfer:cr,toXYZ:Fh,fromXYZ:Bh,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:De},outputColorSpaceConfig:{drawingBufferColorSpace:De}},[De]:{primaries:t,whitePoint:n,transfer:de,toXYZ:Fh,fromXYZ:Bh,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:De}}}),i}var he=Rf();function di(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Es(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var us,Yo=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{us===void 0&&(us=lr("canvas")),us.width=t.width,us.height=t.height;let s=us.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=us}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=lr("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=di(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(di(e[n]/255)*255):e[n]=di(e[n]);return{data:e,width:t.width,height:t.height}}else return $t("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Cf=0,Rs=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Cf++}),this.uuid=Hs(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Bc(s[o].image)):r.push(Bc(s[o]))}else r=Bc(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function Bc(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Yo.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:($t("Texture: Unable to serialize Texture."),{})}var If=0,Oc=new L,cn=class i extends Kn{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=$n,s=$n,r=Je,o=ti,a=Pn,c=pn,l=i.DEFAULT_ANISOTROPY,h=xi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:If++}),this.uuid=Hs(),this.name="",this.source=new Rs(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new pt(0,0),this.repeat=new pt(1,1),this.center=new pt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Qt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Oc).x}get height(){return this.source.getSize(Oc).y}get depth(){return this.source.getSize(Oc).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){$t(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){$t(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Il)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ws:t.x=t.x-Math.floor(t.x);break;case $n:t.x=t.x<0?0:1;break;case Wo:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ws:t.y=t.y-Math.floor(t.y);break;case $n:t.y=t.y<0?0:1;break;case Wo:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};cn.DEFAULT_IMAGE=null;cn.DEFAULT_MAPPING=Il;cn.DEFAULT_ANISOTROPY=1;var we=class i{static{i.prototype.isVector4=!0}constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,c=t.elements,l=c[0],h=c[4],d=c[8],u=c[1],f=c[5],g=c[9],y=c[2],p=c[6],m=c[10];if(Math.abs(h-u)<.01&&Math.abs(d-y)<.01&&Math.abs(g-p)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+y)<.1&&Math.abs(g+p)<.1&&Math.abs(l+f+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let E=(l+1)/2,_=(f+1)/2,A=(m+1)/2,S=(h+u)/4,w=(d+y)/4,x=(g+p)/4;return E>_&&E>A?E<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(E),s=S/n,r=w/n):_>A?_<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(_),n=S/s,r=x/s):A<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(A),n=w/r,s=x/r),this.set(n,s,r,e),this}let M=Math.sqrt((p-g)*(p-g)+(d-y)*(d-y)+(u-h)*(u-h));return Math.abs(M)<.001&&(M=1),this.x=(p-g)/M,this.y=(d-y)/M,this.z=(u-h)/M,this.w=Math.acos((l+f+m-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=le(this.x,t.x,e.x),this.y=le(this.y,t.y,e.y),this.z=le(this.z,t.z,e.z),this.w=le(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=le(this.x,t,e),this.y=le(this.y,t,e),this.z=le(this.z,t,e),this.w=le(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(le(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Zo=class extends Kn{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Je,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new we(0,0,t,e),this.scissorTest=!1,this.viewport=new we(0,0,t,e),this.textures=[];let s={width:t,height:e,depth:n.depth},r=new cn(s),o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Je,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new Rs(s)}return this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},yn=class extends Zo{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},hr=class extends cn{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=qe,this.minFilter=qe,this.wrapR=$n,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var $o=class extends cn{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=qe,this.minFilter=qe,this.wrapR=$n,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ee=class i{static{i.prototype.isMatrix4=!0}constructor(t,e,n,s,r,o,a,c,l,h,d,u,f,g,y,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,c,l,h,d,u,f,g,y,p)}set(t,e,n,s,r,o,a,c,l,h,d,u,f,g,y,p){let m=this.elements;return m[0]=t,m[4]=e,m[8]=n,m[12]=s,m[1]=r,m[5]=o,m[9]=a,m[13]=c,m[2]=l,m[6]=h,m[10]=d,m[14]=u,m[3]=f,m[7]=g,m[11]=y,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,s=1/ds.setFromMatrixColumn(t,0).length(),r=1/ds.setFromMatrixColumn(t,1).length(),o=1/ds.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(s),l=Math.sin(s),h=Math.cos(r),d=Math.sin(r);if(t.order==="XYZ"){let u=o*h,f=o*d,g=a*h,y=a*d;e[0]=c*h,e[4]=-c*d,e[8]=l,e[1]=f+g*l,e[5]=u-y*l,e[9]=-a*c,e[2]=y-u*l,e[6]=g+f*l,e[10]=o*c}else if(t.order==="YXZ"){let u=c*h,f=c*d,g=l*h,y=l*d;e[0]=u+y*a,e[4]=g*a-f,e[8]=o*l,e[1]=o*d,e[5]=o*h,e[9]=-a,e[2]=f*a-g,e[6]=y+u*a,e[10]=o*c}else if(t.order==="ZXY"){let u=c*h,f=c*d,g=l*h,y=l*d;e[0]=u-y*a,e[4]=-o*d,e[8]=g+f*a,e[1]=f+g*a,e[5]=o*h,e[9]=y-u*a,e[2]=-o*l,e[6]=a,e[10]=o*c}else if(t.order==="ZYX"){let u=o*h,f=o*d,g=a*h,y=a*d;e[0]=c*h,e[4]=g*l-f,e[8]=u*l+y,e[1]=c*d,e[5]=y*l+u,e[9]=f*l-g,e[2]=-l,e[6]=a*c,e[10]=o*c}else if(t.order==="YZX"){let u=o*c,f=o*l,g=a*c,y=a*l;e[0]=c*h,e[4]=y-u*d,e[8]=g*d+f,e[1]=d,e[5]=o*h,e[9]=-a*h,e[2]=-l*h,e[6]=f*d+g,e[10]=u-y*d}else if(t.order==="XZY"){let u=o*c,f=o*l,g=a*c,y=a*l;e[0]=c*h,e[4]=-d,e[8]=l*h,e[1]=u*d+y,e[5]=o*h,e[9]=f*d-g,e[2]=g*d-f,e[6]=a*h,e[10]=y*d+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Pf,t,Lf)}lookAt(t,e,n){let s=this.elements;return xn.subVectors(t,e),xn.lengthSq()===0&&(xn.z=1),xn.normalize(),bi.crossVectors(n,xn),bi.lengthSq()===0&&(Math.abs(n.z)===1?xn.x+=1e-4:xn.z+=1e-4,xn.normalize(),bi.crossVectors(n,xn)),bi.normalize(),ho.crossVectors(xn,bi),s[0]=bi.x,s[4]=ho.x,s[8]=xn.x,s[1]=bi.y,s[5]=ho.y,s[9]=xn.y,s[2]=bi.z,s[6]=ho.z,s[10]=xn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],h=n[1],d=n[5],u=n[9],f=n[13],g=n[2],y=n[6],p=n[10],m=n[14],M=n[3],E=n[7],_=n[11],A=n[15],S=s[0],w=s[4],x=s[8],b=s[12],R=s[1],I=s[5],P=s[9],U=s[13],O=s[2],D=s[6],k=s[10],F=s[14],H=s[3],Y=s[7],J=s[11],$=s[15];return r[0]=o*S+a*R+c*O+l*H,r[4]=o*w+a*I+c*D+l*Y,r[8]=o*x+a*P+c*k+l*J,r[12]=o*b+a*U+c*F+l*$,r[1]=h*S+d*R+u*O+f*H,r[5]=h*w+d*I+u*D+f*Y,r[9]=h*x+d*P+u*k+f*J,r[13]=h*b+d*U+u*F+f*$,r[2]=g*S+y*R+p*O+m*H,r[6]=g*w+y*I+p*D+m*Y,r[10]=g*x+y*P+p*k+m*J,r[14]=g*b+y*U+p*F+m*$,r[3]=M*S+E*R+_*O+A*H,r[7]=M*w+E*I+_*D+A*Y,r[11]=M*x+E*P+_*k+A*J,r[15]=M*b+E*U+_*F+A*$,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],c=t[9],l=t[13],h=t[2],d=t[6],u=t[10],f=t[14],g=t[3],y=t[7],p=t[11],m=t[15],M=c*f-l*u,E=a*f-l*d,_=a*u-c*d,A=o*f-l*h,S=o*u-c*h,w=o*d-a*h;return e*(y*M-p*E+m*_)-n*(g*M-p*A+m*S)+s*(g*E-y*A+m*w)-r*(g*_-y*S+p*w)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],o=t[5],a=t[9],c=t[2],l=t[6],h=t[10];return e*(o*h-a*l)-n*(r*h-a*c)+s*(r*l-o*c)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8],d=t[9],u=t[10],f=t[11],g=t[12],y=t[13],p=t[14],m=t[15],M=e*a-n*o,E=e*c-s*o,_=e*l-r*o,A=n*c-s*a,S=n*l-r*a,w=s*l-r*c,x=h*y-d*g,b=h*p-u*g,R=h*m-f*g,I=d*p-u*y,P=d*m-f*y,U=u*m-f*p,O=M*U-E*P+_*I+A*R-S*b+w*x;if(O===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let D=1/O;return t[0]=(a*U-c*P+l*I)*D,t[1]=(s*P-n*U-r*I)*D,t[2]=(y*w-p*S+m*A)*D,t[3]=(u*S-d*w-f*A)*D,t[4]=(c*R-o*U-l*b)*D,t[5]=(e*U-s*R+r*b)*D,t[6]=(p*_-g*w-m*E)*D,t[7]=(h*w-u*_+f*E)*D,t[8]=(o*P-a*R+l*x)*D,t[9]=(n*R-e*P-r*x)*D,t[10]=(g*S-y*_+m*M)*D,t[11]=(d*_-h*S-f*M)*D,t[12]=(a*b-o*I-c*x)*D,t[13]=(e*I-n*b+s*x)*D,t[14]=(y*E-g*A-p*M)*D,t[15]=(h*A-d*E+u*M)*D,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,c=t.z,l=r*o,h=r*a;return this.set(l*o+n,l*a-s*c,l*c+s*a,0,l*a+s*c,h*a+n,h*c-s*o,0,l*c-s*a,h*c+s*o,r*c*c+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,o=e._y,a=e._z,c=e._w,l=r+r,h=o+o,d=a+a,u=r*l,f=r*h,g=r*d,y=o*h,p=o*d,m=a*d,M=c*l,E=c*h,_=c*d,A=n.x,S=n.y,w=n.z;return s[0]=(1-(y+m))*A,s[1]=(f+_)*A,s[2]=(g-E)*A,s[3]=0,s[4]=(f-_)*S,s[5]=(1-(u+m))*S,s[6]=(p+M)*S,s[7]=0,s[8]=(g+E)*w,s[9]=(p-M)*w,s[10]=(1-(u+y))*w,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let o=ds.set(s[0],s[1],s[2]).length(),a=ds.set(s[4],s[5],s[6]).length(),c=ds.set(s[8],s[9],s[10]).length();r<0&&(o=-o),Fn.copy(this);let l=1/o,h=1/a,d=1/c;return Fn.elements[0]*=l,Fn.elements[1]*=l,Fn.elements[2]*=l,Fn.elements[4]*=h,Fn.elements[5]*=h,Fn.elements[6]*=h,Fn.elements[8]*=d,Fn.elements[9]*=d,Fn.elements[10]*=d,e.setFromRotationMatrix(Fn),n.x=o,n.y=a,n.z=c,this}makePerspective(t,e,n,s,r,o,a=zn,c=!1){let l=this.elements,h=2*r/(e-t),d=2*r/(n-s),u=(e+t)/(e-t),f=(n+s)/(n-s),g,y;if(c)g=r/(o-r),y=o*r/(o-r);else if(a===zn)g=-(o+r)/(o-r),y=-2*o*r/(o-r);else if(a===Ts)g=-o/(o-r),y=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=d,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=y,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=zn,c=!1){let l=this.elements,h=2/(e-t),d=2/(n-s),u=-(e+t)/(e-t),f=-(n+s)/(n-s),g,y;if(c)g=1/(o-r),y=o/(o-r);else if(a===zn)g=-2/(o-r),y=-(o+r)/(o-r);else if(a===Ts)g=-1/(o-r),y=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=0,l[12]=u,l[1]=0,l[5]=d,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=g,l[14]=y,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},ds=new L,Fn=new ee,Pf=new L(0,0,0),Lf=new L(1,1,1),bi=new L,ho=new L,xn=new L,Oh=new ee,zh=new Se,Te=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],o=s[4],a=s[8],c=s[1],l=s[5],h=s[9],d=s[2],u=s[6],f=s[10];switch(e){case"XYZ":this._y=Math.asin(le(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(u,l),this._z=0);break;case"YXZ":this._x=Math.asin(-le(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(le(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-le(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(le(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-le(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(u,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:$t("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Oh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Oh,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return zh.setFromEuler(this),this.setFromQuaternion(zh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Te.DEFAULT_ORDER="XYZ";var Cs=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Df=0,Hh=new L,fs=new Se,ai=new ee,uo=new L,Ks=new L,Uf=new L,Nf=new Se,Gh=new L(1,0,0),kh=new L(0,1,0),Vh=new L(0,0,1),Wh={type:"added"},Ff={type:"removed"},ps={type:"childadded",child:null},zc={type:"childremoved",child:null},rn=class i extends Kn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Df++}),this.uuid=Hs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new L,e=new Te,n=new Se,s=new L(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ee},normalMatrix:{value:new Qt}}),this.matrix=new ee,this.matrixWorld=new ee,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Cs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return fs.setFromAxisAngle(t,e),this.quaternion.multiply(fs),this}rotateOnWorldAxis(t,e){return fs.setFromAxisAngle(t,e),this.quaternion.premultiply(fs),this}rotateX(t){return this.rotateOnAxis(Gh,t)}rotateY(t){return this.rotateOnAxis(kh,t)}rotateZ(t){return this.rotateOnAxis(Vh,t)}translateOnAxis(t,e){return Hh.copy(t).applyQuaternion(this.quaternion),this.position.add(Hh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Gh,t)}translateY(t){return this.translateOnAxis(kh,t)}translateZ(t){return this.translateOnAxis(Vh,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(ai.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?uo.copy(t):uo.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Ks.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ai.lookAt(Ks,uo,this.up):ai.lookAt(uo,Ks,this.up),this.quaternion.setFromRotationMatrix(ai),s&&(ai.extractRotation(s.matrixWorld),fs.setFromRotationMatrix(ai),this.quaternion.premultiply(fs.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Zt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Wh),ps.child=t,this.dispatchEvent(ps),ps.child=null):Zt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Ff),zc.child=t,this.dispatchEvent(zc),zc.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),ai.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),ai.multiply(t.parent.matrixWorld)),t.applyMatrix4(ai),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Wh),ps.child=t,this.dispatchEvent(ps),ps.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ks,t,Uf),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ks,Nf,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let c=a.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){let d=c[l];r(t.shapes,d)}else r(t.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(t.materials,this.material[c]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let c=this.animations[a];s.animations.push(r(t.animations,c))}}if(e){let a=o(t.geometries),c=o(t.materials),l=o(t.textures),h=o(t.images),d=o(t.shapes),u=o(t.skeletons),f=o(t.animations),g=o(t.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),u.length>0&&(n.skeletons=u),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){let c=[];for(let l in a){let h=a[l];delete h.metadata,c.push(h)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}};rn.DEFAULT_UP=new L(0,1,0);rn.DEFAULT_MATRIX_AUTO_UPDATE=!0;rn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var ge=class extends rn{constructor(){super(),this.isGroup=!0,this.type="Group"}},Bf={type:"move"},Is=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ge,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ge,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ge,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null,a=this._targetRay,c=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){o=!0;for(let y of t.hand.values()){let p=e.getJointPose(y,n),m=this._getHandJoint(l,y);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let h=l.joints["index-finger-tip"],d=l.joints["thumb-tip"],u=h.position.distanceTo(d.position),f=.02,g=.005;l.inputState.pinching&&u>f+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!l.inputState.pinching&&u<=f-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Bf)))}return a!==null&&(a.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new ge;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},Xu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ei={h:0,s:0,l:0},fo={h:0,s:0,l:0};function Hc(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var Vt=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=De){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,he.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=he.workingColorSpace){return this.r=t,this.g=e,this.b=n,he.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=he.workingColorSpace){if(t=Af(t,1),e=le(e,0,1),n=le(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=Hc(o,r,t+1/3),this.g=Hc(o,r,t),this.b=Hc(o,r,t-1/3)}return he.colorSpaceToWorking(this,s),this}setStyle(t,e=De){function n(r){r!==void 0&&parseFloat(r)<1&&$t("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:$t("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);$t("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=De){let n=Xu[t.toLowerCase()];return n!==void 0?this.setHex(n,e):$t("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=di(t.r),this.g=di(t.g),this.b=di(t.b),this}copyLinearToSRGB(t){return this.r=Es(t.r),this.g=Es(t.g),this.b=Es(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=De){return he.workingToColorSpace(nn.copy(this),t),Math.round(le(nn.r*255,0,255))*65536+Math.round(le(nn.g*255,0,255))*256+Math.round(le(nn.b*255,0,255))}getHexString(t=De){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=he.workingColorSpace){he.workingToColorSpace(nn.copy(this),e);let n=nn.r,s=nn.g,r=nn.b,o=Math.max(n,s,r),a=Math.min(n,s,r),c,l,h=(a+o)/2;if(a===o)c=0,l=0;else{let d=o-a;switch(l=h<=.5?d/(o+a):d/(2-o-a),o){case n:c=(s-r)/d+(s<r?6:0);break;case s:c=(r-n)/d+2;break;case r:c=(n-s)/d+4;break}c/=6}return t.h=c,t.s=l,t.l=h,t}getRGB(t,e=he.workingColorSpace){return he.workingToColorSpace(nn.copy(this),e),t.r=nn.r,t.g=nn.g,t.b=nn.b,t}getStyle(t=De){he.workingToColorSpace(nn.copy(this),t);let e=nn.r,n=nn.g,s=nn.b;return t!==De?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Ei),this.setHSL(Ei.h+t,Ei.s+e,Ei.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Ei),t.getHSL(fo);let n=Uc(Ei.h,fo.h,e),s=Uc(Ei.s,fo.s,e),r=Uc(Ei.l,fo.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},nn=new Vt;Vt.NAMES=Xu;var ur=class i{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new Vt(t),this.density=e}clone(){return new i(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var dr=class extends rn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Te,this.environmentIntensity=1,this.environmentRotation=new Te,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}},Bn=new L,ci=new L,Gc=new L,li=new L,ms=new L,gs=new L,Xh=new L,kc=new L,Vc=new L,Wc=new L,Xc=new we,qc=new we,Yc=new we,Ci=class i{constructor(t=new L,e=new L,n=new L){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),Bn.subVectors(t,e),s.cross(Bn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){Bn.subVectors(s,e),ci.subVectors(n,e),Gc.subVectors(t,e);let o=Bn.dot(Bn),a=Bn.dot(ci),c=Bn.dot(Gc),l=ci.dot(ci),h=ci.dot(Gc),d=o*l-a*a;if(d===0)return r.set(0,0,0),null;let u=1/d,f=(l*c-a*h)*u,g=(o*h-a*c)*u;return r.set(1-f-g,g,f)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,li)===null?!1:li.x>=0&&li.y>=0&&li.x+li.y<=1}static getInterpolation(t,e,n,s,r,o,a,c){return this.getBarycoord(t,e,n,s,li)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,li.x),c.addScaledVector(o,li.y),c.addScaledVector(a,li.z),c)}static getInterpolatedAttribute(t,e,n,s,r,o){return Xc.setScalar(0),qc.setScalar(0),Yc.setScalar(0),Xc.fromBufferAttribute(t,e),qc.fromBufferAttribute(t,n),Yc.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(Xc,r.x),o.addScaledVector(qc,r.y),o.addScaledVector(Yc,r.z),o}static isFrontFacing(t,e,n,s){return Bn.subVectors(n,e),ci.subVectors(t,e),Bn.cross(ci).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Bn.subVectors(this.c,this.b),ci.subVectors(this.a,this.b),Bn.cross(ci).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,o,a;ms.subVectors(s,n),gs.subVectors(r,n),kc.subVectors(t,n);let c=ms.dot(kc),l=gs.dot(kc);if(c<=0&&l<=0)return e.copy(n);Vc.subVectors(t,s);let h=ms.dot(Vc),d=gs.dot(Vc);if(h>=0&&d<=h)return e.copy(s);let u=c*d-h*l;if(u<=0&&c>=0&&h<=0)return o=c/(c-h),e.copy(n).addScaledVector(ms,o);Wc.subVectors(t,r);let f=ms.dot(Wc),g=gs.dot(Wc);if(g>=0&&f<=g)return e.copy(r);let y=f*l-c*g;if(y<=0&&l>=0&&g<=0)return a=l/(l-g),e.copy(n).addScaledVector(gs,a);let p=h*g-f*d;if(p<=0&&d-h>=0&&f-g>=0)return Xh.subVectors(r,s),a=(d-h)/(d-h+(f-g)),e.copy(s).addScaledVector(Xh,a);let m=1/(p+y+u);return o=y*m,a=u*m,e.copy(n).addScaledVector(ms,o).addScaledVector(gs,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Rn=class{constructor(t=new L(1/0,1/0,1/0),e=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(On.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(On.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=On.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,On):On.fromBufferAttribute(r,o),On.applyMatrix4(t.matrixWorld),this.expandByPoint(On);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),po.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),po.copy(n.boundingBox)),po.applyMatrix4(t.matrixWorld),this.union(po)}let s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,On),On.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Qs),mo.subVectors(this.max,Qs),xs.subVectors(t.a,Qs),_s.subVectors(t.b,Qs),ys.subVectors(t.c,Qs),wi.subVectors(_s,xs),Ti.subVectors(ys,_s),Wi.subVectors(xs,ys);let e=[0,-wi.z,wi.y,0,-Ti.z,Ti.y,0,-Wi.z,Wi.y,wi.z,0,-wi.x,Ti.z,0,-Ti.x,Wi.z,0,-Wi.x,-wi.y,wi.x,0,-Ti.y,Ti.x,0,-Wi.y,Wi.x,0];return!Zc(e,xs,_s,ys,mo)||(e=[1,0,0,0,1,0,0,0,1],!Zc(e,xs,_s,ys,mo))?!1:(go.crossVectors(wi,Ti),e=[go.x,go.y,go.z],Zc(e,xs,_s,ys,mo))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,On).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(On).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(hi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),hi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),hi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),hi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),hi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),hi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),hi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),hi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(hi),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},hi=[new L,new L,new L,new L,new L,new L,new L,new L],On=new L,po=new Rn,xs=new L,_s=new L,ys=new L,wi=new L,Ti=new L,Wi=new L,Qs=new L,mo=new L,go=new L,Xi=new L;function Zc(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Xi.fromArray(i,r);let a=s.x*Math.abs(Xi.x)+s.y*Math.abs(Xi.y)+s.z*Math.abs(Xi.z),c=t.dot(Xi),l=e.dot(Xi),h=n.dot(Xi);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>a)return!1}return!0}var Ge=new L,xo=new pt,Of=0,fn=class extends Kn{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Of++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=ul,this.updateRanges=[],this.gpuType=In,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)xo.fromBufferAttribute(this,e),xo.applyMatrix3(t),this.setXY(e,xo.x,xo.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Ge.fromBufferAttribute(this,e),Ge.applyMatrix3(t),this.setXYZ(e,Ge.x,Ge.y,Ge.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Ge.fromBufferAttribute(this,e),Ge.applyMatrix4(t),this.setXYZ(e,Ge.x,Ge.y,Ge.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ge.fromBufferAttribute(this,e),Ge.applyNormalMatrix(t),this.setXYZ(e,Ge.x,Ge.y,Ge.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ge.fromBufferAttribute(this,e),Ge.transformDirection(t),this.setXYZ(e,Ge.x,Ge.y,Ge.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Js(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=dn(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Js(e,this.array)),e}setX(t,e){return this.normalized&&(e=dn(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Js(e,this.array)),e}setY(t,e){return this.normalized&&(e=dn(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Js(e,this.array)),e}setZ(t,e){return this.normalized&&(e=dn(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Js(e,this.array)),e}setW(t,e){return this.normalized&&(e=dn(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=dn(e,this.array),n=dn(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=dn(e,this.array),n=dn(n,this.array),s=dn(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=dn(e,this.array),n=dn(n,this.array),s=dn(s,this.array),r=dn(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==ul&&(t.usage=this.usage),t}dispose(){this.dispatchEvent({type:"dispose"})}};var fr=class extends fn{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var pr=class extends fn{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var se=class extends fn{constructor(t,e,n){super(new Float32Array(t),e,n)}},zf=new Rn,js=new L,$c=new L,Pi=class{constructor(t=new L,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):zf.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;js.subVectors(t,this.center);let e=js.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(js,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):($c.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(js.copy(t.center).add($c)),this.expandByPoint(js.copy(t.center).sub($c))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Hf=0,An=new ee,Jc=new rn,vs=new L,_n=new Rn,tr=new Rn,Xe=new L,Be=class i extends Kn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Hf++}),this.uuid=Hs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(wf(t)?pr:fr)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Qt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return An.makeRotationFromQuaternion(t),this.applyMatrix4(An),this}rotateX(t){return An.makeRotationX(t),this.applyMatrix4(An),this}rotateY(t){return An.makeRotationY(t),this.applyMatrix4(An),this}rotateZ(t){return An.makeRotationZ(t),this.applyMatrix4(An),this}translate(t,e,n){return An.makeTranslation(t,e,n),this.applyMatrix4(An),this}scale(t,e,n){return An.makeScale(t,e,n),this.applyMatrix4(An),this}lookAt(t){return Jc.lookAt(t),Jc.updateMatrix(),this.applyMatrix4(Jc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(vs).negate(),this.translate(vs.x,vs.y,vs.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let o=t[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new se(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&$t("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Rn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Zt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];_n.setFromBufferAttribute(r),this.morphTargetsRelative?(Xe.addVectors(this.boundingBox.min,_n.min),this.boundingBox.expandByPoint(Xe),Xe.addVectors(this.boundingBox.max,_n.max),this.boundingBox.expandByPoint(Xe)):(this.boundingBox.expandByPoint(_n.min),this.boundingBox.expandByPoint(_n.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Zt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Pi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Zt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(t){let n=this.boundingSphere.center;if(_n.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];tr.setFromBufferAttribute(a),this.morphTargetsRelative?(Xe.addVectors(_n.min,tr.min),_n.expandByPoint(Xe),Xe.addVectors(_n.max,tr.max),_n.expandByPoint(Xe)):(_n.expandByPoint(tr.min),_n.expandByPoint(tr.max))}_n.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)Xe.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Xe));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],c=this.morphTargetsRelative;for(let l=0,h=a.count;l<h;l++)Xe.fromBufferAttribute(a,l),c&&(vs.fromBufferAttribute(t,l),Xe.add(vs)),s=Math.max(s,n.distanceToSquared(Xe))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Zt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Zt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new fn(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],c=[];for(let x=0;x<n.count;x++)a[x]=new L,c[x]=new L;let l=new L,h=new L,d=new L,u=new pt,f=new pt,g=new pt,y=new L,p=new L;function m(x,b,R){l.fromBufferAttribute(n,x),h.fromBufferAttribute(n,b),d.fromBufferAttribute(n,R),u.fromBufferAttribute(r,x),f.fromBufferAttribute(r,b),g.fromBufferAttribute(r,R),h.sub(l),d.sub(l),f.sub(u),g.sub(u);let I=1/(f.x*g.y-g.x*f.y);isFinite(I)&&(y.copy(h).multiplyScalar(g.y).addScaledVector(d,-f.y).multiplyScalar(I),p.copy(d).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(I),a[x].add(y),a[b].add(y),a[R].add(y),c[x].add(p),c[b].add(p),c[R].add(p))}let M=this.groups;M.length===0&&(M=[{start:0,count:t.count}]);for(let x=0,b=M.length;x<b;++x){let R=M[x],I=R.start,P=R.count;for(let U=I,O=I+P;U<O;U+=3)m(t.getX(U+0),t.getX(U+1),t.getX(U+2))}let E=new L,_=new L,A=new L,S=new L;function w(x){A.fromBufferAttribute(s,x),S.copy(A);let b=a[x];E.copy(b),E.sub(A.multiplyScalar(A.dot(b))).normalize(),_.crossVectors(S,b);let I=_.dot(c[x])<0?-1:1;o.setXYZW(x,E.x,E.y,E.z,I)}for(let x=0,b=M.length;x<b;++x){let R=M[x],I=R.start,P=R.count;for(let U=I,O=I+P;U<O;U+=3)w(t.getX(U+0)),w(t.getX(U+1)),w(t.getX(U+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new fn(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let u=0,f=n.count;u<f;u++)n.setXYZ(u,0,0,0);let s=new L,r=new L,o=new L,a=new L,c=new L,l=new L,h=new L,d=new L;if(t)for(let u=0,f=t.count;u<f;u+=3){let g=t.getX(u+0),y=t.getX(u+1),p=t.getX(u+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,y),o.fromBufferAttribute(e,p),h.subVectors(o,r),d.subVectors(s,r),h.cross(d),a.fromBufferAttribute(n,g),c.fromBufferAttribute(n,y),l.fromBufferAttribute(n,p),a.add(h),c.add(h),l.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(y,c.x,c.y,c.z),n.setXYZ(p,l.x,l.y,l.z)}else for(let u=0,f=e.count;u<f;u+=3)s.fromBufferAttribute(e,u+0),r.fromBufferAttribute(e,u+1),o.fromBufferAttribute(e,u+2),h.subVectors(o,r),d.subVectors(s,r),h.cross(d),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Xe.fromBufferAttribute(t,e),Xe.normalize(),t.setXYZ(e,Xe.x,Xe.y,Xe.z)}toNonIndexed(){function t(a,c){let l=a.array,h=a.itemSize,d=a.normalized,u=new l.constructor(c.length*h),f=0,g=0;for(let y=0,p=c.length;y<p;y++){a.isInterleavedBufferAttribute?f=c[y]*a.data.stride+a.offset:f=c[y]*h;for(let m=0;m<h;m++)u[g++]=l[f++]}return new fn(u,h,d)}if(this.index===null)return $t("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let a in s){let c=s[a],l=t(c,n);e.setAttribute(a,l)}let r=this.morphAttributes;for(let a in r){let c=[],l=r[a];for(let h=0,d=l.length;h<d;h++){let u=l[h],f=t(u,n);c.push(f)}e.morphAttributes[a]=c}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,c=o.length;a<c;a++){let l=o[a];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let c in n){let l=n[c];t.data.attributes[c]=l.toJSON(t.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],h=[];for(let d=0,u=l.length;d<u;d++){let f=l[d];h.push(f.toJSON(t.data))}h.length>0&&(s[c]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let l in s){let h=s[l];this.setAttribute(l,h.clone(e))}let r=t.morphAttributes;for(let l in r){let h=[],d=r[l];for(let u=0,f=d.length;u<f;u++)h.push(d[u].clone(e));this.morphAttributes[l]=h}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let l=0,h=o.length;l<h;l++){let d=o[l];this.addGroup(d.start,d.count,d.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var Gf=0,pi=class extends Kn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Gf++}),this.uuid=Hs(),this.name="",this.type="Material",this.blending=Ki,this.side=fi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=No,this.blendDst=Fo,this.blendEquation=Ii,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Vt(0,0,0),this.blendAlpha=0,this.depthFunc=Qi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=hl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Zi,this.stencilZFail=Zi,this.stencilZPass=Zi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){$t(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){$t(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Ki&&(n.blending=this.blending),this.side!==fi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==No&&(n.blendSrc=this.blendSrc),this.blendDst!==Fo&&(n.blendDst=this.blendDst),this.blendEquation!==Ii&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Qi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==hl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Zi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Zi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Zi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let c=r[a];delete c.metadata,o.push(c)}return o}if(e){let r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Vt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new pt().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new pt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var ui=new L,Kc=new L,_o=new L,Ai=new L,Qc=new L,yo=new L,jc=new L,mr=class{constructor(t=new L,e=new L(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ui)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=ui.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(ui.copy(this.origin).addScaledVector(this.direction,e),ui.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Kc.copy(t).add(e).multiplyScalar(.5),_o.copy(e).sub(t).normalize(),Ai.copy(this.origin).sub(Kc);let r=t.distanceTo(e)*.5,o=-this.direction.dot(_o),a=Ai.dot(this.direction),c=-Ai.dot(_o),l=Ai.lengthSq(),h=Math.abs(1-o*o),d,u,f,g;if(h>0)if(d=o*c-a,u=o*a-c,g=r*h,d>=0)if(u>=-g)if(u<=g){let y=1/h;d*=y,u*=y,f=d*(d+o*u+2*a)+u*(o*d+u+2*c)+l}else u=r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*c)+l;else u=-r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*c)+l;else u<=-g?(d=Math.max(0,-(-o*r+a)),u=d>0?-r:Math.min(Math.max(-r,-c),r),f=-d*d+u*(u+2*c)+l):u<=g?(d=0,u=Math.min(Math.max(-r,-c),r),f=u*(u+2*c)+l):(d=Math.max(0,-(o*r+a)),u=d>0?r:Math.min(Math.max(-r,-c),r),f=-d*d+u*(u+2*c)+l);else u=o>0?-r:r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(Kc).addScaledVector(_o,u),f}intersectSphere(t,e){ui.subVectors(t.center,this.origin);let n=ui.dot(this.direction),s=ui.dot(ui)-n*n,r=t.radius*t.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,c,l=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return l>=0?(n=(t.min.x-u.x)*l,s=(t.max.x-u.x)*l):(n=(t.max.x-u.x)*l,s=(t.min.x-u.x)*l),h>=0?(r=(t.min.y-u.y)*h,o=(t.max.y-u.y)*h):(r=(t.max.y-u.y)*h,o=(t.min.y-u.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),d>=0?(a=(t.min.z-u.z)*d,c=(t.max.z-u.z)*d):(a=(t.max.z-u.z)*d,c=(t.min.z-u.z)*d),n>c||a>s)||((a>n||n!==n)&&(n=a),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,ui)!==null}intersectTriangle(t,e,n,s,r){Qc.subVectors(e,t),yo.subVectors(n,t),jc.crossVectors(Qc,yo);let o=this.direction.dot(jc),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Ai.subVectors(this.origin,t);let c=a*this.direction.dot(yo.crossVectors(Ai,yo));if(c<0)return null;let l=a*this.direction.dot(Qc.cross(Ai));if(l<0||c+l>o)return null;let h=-a*Ai.dot(jc);return h<0?null:this.at(h/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Cn=class extends pi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Vt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Te,this.combine=ya,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},qh=new ee,qi=new mr,vo=new Pi,Yh=new L,Mo=new L,So=new L,bo=new L,tl=new L,Eo=new L,Zh=new L,wo=new L,ft=class extends rn{constructor(t=new Be,e=new Cn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let a=this.morphTargetInfluences;if(r&&a){Eo.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let h=a[c],d=r[c];h!==0&&(tl.fromBufferAttribute(d,t),o?Eo.addScaledVector(tl,h):Eo.addScaledVector(tl.sub(e),h))}e.add(Eo)}return e}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),vo.copy(n.boundingSphere),vo.applyMatrix4(r),qi.copy(t.ray).recast(t.near),!(vo.containsPoint(qi.origin)===!1&&(qi.intersectSphere(vo,Yh)===null||qi.origin.distanceToSquared(Yh)>(t.far-t.near)**2))&&(qh.copy(r).invert(),qi.copy(t.ray).applyMatrix4(qh),!(n.boundingBox!==null&&qi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,qi)))}_computeIntersections(t,e,n){let s,r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,u=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,y=u.length;g<y;g++){let p=u[g],m=o[p.materialIndex],M=Math.max(p.start,f.start),E=Math.min(a.count,Math.min(p.start+p.count,f.start+f.count));for(let _=M,A=E;_<A;_+=3){let S=a.getX(_),w=a.getX(_+1),x=a.getX(_+2);s=To(this,m,t,n,l,h,d,S,w,x),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{let g=Math.max(0,f.start),y=Math.min(a.count,f.start+f.count);for(let p=g,m=y;p<m;p+=3){let M=a.getX(p),E=a.getX(p+1),_=a.getX(p+2);s=To(this,o,t,n,l,h,d,M,E,_),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,y=u.length;g<y;g++){let p=u[g],m=o[p.materialIndex],M=Math.max(p.start,f.start),E=Math.min(c.count,Math.min(p.start+p.count,f.start+f.count));for(let _=M,A=E;_<A;_+=3){let S=_,w=_+1,x=_+2;s=To(this,m,t,n,l,h,d,S,w,x),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{let g=Math.max(0,f.start),y=Math.min(c.count,f.start+f.count);for(let p=g,m=y;p<m;p+=3){let M=p,E=p+1,_=p+2;s=To(this,o,t,n,l,h,d,M,E,_),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}}};function kf(i,t,e,n,s,r,o,a){let c;if(t.side===Ke?c=n.intersectTriangle(o,r,s,!0,a):c=n.intersectTriangle(s,r,o,t.side===fi,a),c===null)return null;wo.copy(a),wo.applyMatrix4(i.matrixWorld);let l=e.ray.origin.distanceTo(wo);return l<e.near||l>e.far?null:{distance:l,point:wo.clone(),object:i}}function To(i,t,e,n,s,r,o,a,c,l){i.getVertexPosition(a,Mo),i.getVertexPosition(c,So),i.getVertexPosition(l,bo);let h=kf(i,t,e,n,Mo,So,bo,Zh);if(h){let d=new L;Ci.getBarycoord(Zh,Mo,So,bo,d),s&&(h.uv=Ci.getInterpolatedAttribute(s,a,c,l,d,new pt)),r&&(h.uv1=Ci.getInterpolatedAttribute(r,a,c,l,d,new pt)),o&&(h.normal=Ci.getInterpolatedAttribute(o,a,c,l,d,new L),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let u={a,b:c,c:l,normal:new L,materialIndex:0};Ci.getNormal(Mo,So,bo,u.normal),h.face=u,h.barycoord=d}return h}var gr=class extends cn{constructor(t=null,e=1,n=1,s,r,o,a,c,l=qe,h=qe,d,u){super(null,o,a,c,l,h,s,r,d,u),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var xr=class extends fn{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Ms=new ee,$h=new ee,Ao=[],Jh=new Rn,Vf=new ee,er=new ft,nr=new Pi,Oe=class extends ft{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new xr(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Vf)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Rn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ms),Jh.copy(t.boundingBox).applyMatrix4(Ms),this.boundingBox.union(Jh)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Pi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ms),nr.copy(t.boundingSphere).applyMatrix4(Ms),this.boundingSphere.union(nr)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=t*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(t,e){let n=this.matrixWorld,s=this.count;if(er.geometry=this.geometry,er.material=this.material,er.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),nr.copy(this.boundingSphere),nr.applyMatrix4(n),t.ray.intersectsSphere(nr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ms),$h.multiplyMatrices(n,Ms),er.matrixWorld=$h,er.raycast(t,Ao);for(let o=0,a=Ao.length;o<a;o++){let c=Ao[o];c.instanceId=r,c.object=this,e.push(c)}Ao.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new xr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new gr(new Float32Array(s*this.count),s,this.count,Ta,In));let r=this.morphTexture.source.data.data,o=0;for(let l=0;l<n.length;l++)o+=n[l];let a=this.geometry.morphTargetsRelative?1:1-o,c=s*t;return r[c]=a,r.set(n,c+1),this}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},el=new L,Wf=new L,Xf=new Qt,Zn=class{constructor(t=new L(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=el.subVectors(n,e).cross(Wf.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let s=t.delta(el),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let o=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(s,o)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Xf.getNormalMatrix(t),s=this.coplanarPoint(el).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},Yi=new Pi,qf=new pt(.5,.5),Ro=new L,Ps=class{constructor(t=new Zn,e=new Zn,n=new Zn,s=new Zn,r=new Zn,o=new Zn){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=zn,n=!1){let s=this.planes,r=t.elements,o=r[0],a=r[1],c=r[2],l=r[3],h=r[4],d=r[5],u=r[6],f=r[7],g=r[8],y=r[9],p=r[10],m=r[11],M=r[12],E=r[13],_=r[14],A=r[15];if(s[0].setComponents(l-o,f-h,m-g,A-M).normalize(),s[1].setComponents(l+o,f+h,m+g,A+M).normalize(),s[2].setComponents(l+a,f+d,m+y,A+E).normalize(),s[3].setComponents(l-a,f-d,m-y,A-E).normalize(),n)s[4].setComponents(c,u,p,_).normalize(),s[5].setComponents(l-c,f-u,m-p,A-_).normalize();else if(s[4].setComponents(l-c,f-u,m-p,A-_).normalize(),e===zn)s[5].setComponents(l+c,f+u,m+p,A+_).normalize();else if(e===Ts)s[5].setComponents(c,u,p,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Yi.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Yi.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Yi)}intersectsSprite(t){Yi.center.set(0,0,0);let e=qf.distanceTo(t.center);return Yi.radius=.7071067811865476+e,Yi.applyMatrix4(t.matrixWorld),this.intersectsSphere(Yi)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(Ro.x=s.normal.x>0?t.max.x:t.min.x,Ro.y=s.normal.y>0?t.max.y:t.min.y,Ro.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Ro)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var _r=class extends cn{constructor(t=[],e=Bi,n,s,r,o,a,c,l,h){super(t,e,n,s,r,o,a,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Qn=class extends cn{constructor(t,e,n,s,r,o,a,c,l){super(t,e,n,s,r,o,a,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}};var mi=class extends cn{constructor(t,e,n=Gn,s,r,o,a=qe,c=qe,l,h=Jn,d=1){if(h!==Jn&&h!==Oi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:e,depth:d};super(u,s,r,o,a,c,h,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Rs(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}},Jo=class extends mi{constructor(t,e=Gn,n=Bi,s,r,o=qe,a=qe,c,l=Jn){let h={width:t,height:t,depth:1},d=[h,h,h,h,h,h];super(t,t,e,n,s,r,o,a,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},yr=class extends cn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},ht=class i extends Be{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let c=[],l=[],h=[],d=[],u=0,f=0;g("z","y","x",-1,-1,n,e,t,o,r,0),g("z","y","x",1,-1,n,e,-t,o,r,1),g("x","z","y",1,1,t,n,e,s,o,2),g("x","z","y",1,-1,t,n,-e,s,o,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new se(l,3)),this.setAttribute("normal",new se(h,3)),this.setAttribute("uv",new se(d,2));function g(y,p,m,M,E,_,A,S,w,x,b){let R=_/w,I=A/x,P=_/2,U=A/2,O=S/2,D=w+1,k=x+1,F=0,H=0,Y=new L;for(let J=0;J<k;J++){let $=J*I-U;for(let st=0;st<D;st++){let rt=st*R-P;Y[y]=rt*M,Y[p]=$*E,Y[m]=O,l.push(Y.x,Y.y,Y.z),Y[y]=0,Y[p]=0,Y[m]=S>0?1:-1,h.push(Y.x,Y.y,Y.z),d.push(st/w),d.push(1-J/x),F+=1}}for(let J=0;J<x;J++)for(let $=0;$<w;$++){let st=u+$+D*J,rt=u+$+D*(J+1),Tt=u+($+1)+D*(J+1),vt=u+($+1)+D*J;c.push(st,rt,vt),c.push(rt,Tt,vt),H+=6}a.addGroup(f,H,b),f+=H,u+=F}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Re=class i extends Be{constructor(t=1,e=1,n=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:t,height:e,capSegments:n,radialSegments:s,heightSegments:r},e=Math.max(0,e),n=Math.max(1,Math.floor(n)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));let o=[],a=[],c=[],l=[],h=e/2,d=Math.PI/2*t,u=e,f=2*d+u,g=n*2+r,y=s+1,p=new L,m=new L;for(let M=0;M<=g;M++){let E=0,_=0,A=0,S=0;if(M<=n){let b=M/n,R=b*Math.PI/2;_=-h-t*Math.cos(R),A=t*Math.sin(R),S=-t*Math.cos(R),E=b*d}else if(M<=n+r){let b=(M-n)/r;_=-h+b*e,A=t,S=0,E=d+b*u}else{let b=(M-n-r)/n,R=b*Math.PI/2;_=h+t*Math.sin(R),A=t*Math.cos(R),S=t*Math.sin(R),E=d+u+b*d}let w=Math.max(0,Math.min(1,E/f)),x=0;M===0?x=.5/s:M===g&&(x=-.5/s);for(let b=0;b<=s;b++){let R=b/s,I=R*Math.PI*2,P=Math.sin(I),U=Math.cos(I);m.x=-A*U,m.y=_,m.z=A*P,a.push(m.x,m.y,m.z),p.set(-A*U,S,A*P),p.normalize(),c.push(p.x,p.y,p.z),l.push(R+x,w)}if(M>0){let b=(M-1)*y;for(let R=0;R<s;R++){let I=b+R,P=b+R+1,U=M*y+R,O=M*y+R+1;o.push(I,P,U),o.push(P,O,U)}}}this.setIndex(o),this.setAttribute("position",new se(a,3)),this.setAttribute("normal",new se(c,3)),this.setAttribute("uv",new se(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},Li=class i extends Be{constructor(t=1,e=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:s},e=Math.max(3,e);let r=[],o=[],a=[],c=[],l=new L,h=new pt;o.push(0,0,0),a.push(0,0,1),c.push(.5,.5);for(let d=0,u=3;d<=e;d++,u+=3){let f=n+d/e*s;l.x=t*Math.cos(f),l.y=t*Math.sin(f),o.push(l.x,l.y,l.z),a.push(0,0,1),h.x=(o[u]/t+1)/2,h.y=(o[u+1]/t+1)/2,c.push(h.x,h.y)}for(let d=1;d<=e;d++)r.push(d,d+1,0);this.setIndex(r),this.setAttribute("position",new se(o,3)),this.setAttribute("normal",new se(a,3)),this.setAttribute("uv",new se(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.segments,t.thetaStart,t.thetaLength)}},qt=class i extends Be{constructor(t=1,e=1,n=1,s=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};let l=this;s=Math.floor(s),r=Math.floor(r);let h=[],d=[],u=[],f=[],g=0,y=[],p=n/2,m=0;M(),o===!1&&(t>0&&E(!0),e>0&&E(!1)),this.setIndex(h),this.setAttribute("position",new se(d,3)),this.setAttribute("normal",new se(u,3)),this.setAttribute("uv",new se(f,2));function M(){let _=new L,A=new L,S=0,w=(e-t)/n;for(let x=0;x<=r;x++){let b=[],R=x/r,I=R*(e-t)+t;for(let P=0;P<=s;P++){let U=P/s,O=U*c+a,D=Math.sin(O),k=Math.cos(O);A.x=I*D,A.y=-R*n+p,A.z=I*k,d.push(A.x,A.y,A.z),_.set(D,w,k).normalize(),u.push(_.x,_.y,_.z),f.push(U,1-R),b.push(g++)}y.push(b)}for(let x=0;x<s;x++)for(let b=0;b<r;b++){let R=y[b][x],I=y[b+1][x],P=y[b+1][x+1],U=y[b][x+1];(t>0||b!==0)&&(h.push(R,I,U),S+=3),(e>0||b!==r-1)&&(h.push(I,P,U),S+=3)}l.addGroup(m,S,0),m+=S}function E(_){let A=g,S=new pt,w=new L,x=0,b=_===!0?t:e,R=_===!0?1:-1;for(let P=1;P<=s;P++)d.push(0,p*R,0),u.push(0,R,0),f.push(.5,.5),g++;let I=g;for(let P=0;P<=s;P++){let O=P/s*c+a,D=Math.cos(O),k=Math.sin(O);w.x=b*k,w.y=p*R,w.z=b*D,d.push(w.x,w.y,w.z),u.push(0,R,0),S.x=D*.5+.5,S.y=k*.5*R+.5,f.push(S.x,S.y),g++}for(let P=0;P<s;P++){let U=A+P,O=I+P;_===!0?h.push(O,O+1,U):h.push(O+1,O,U),x+=3}l.addGroup(m,x,_===!0?1:2),m+=x}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},gi=class i extends qt{constructor(t=1,e=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new i(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Ko=class i extends Be{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};let r=[],o=[];a(s),l(n),h(),this.setAttribute("position",new se(r,3)),this.setAttribute("normal",new se(r.slice(),3)),this.setAttribute("uv",new se(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(M){let E=new L,_=new L,A=new L;for(let S=0;S<e.length;S+=3)f(e[S+0],E),f(e[S+1],_),f(e[S+2],A),c(E,_,A,M)}function c(M,E,_,A){let S=A+1,w=[];for(let x=0;x<=S;x++){w[x]=[];let b=M.clone().lerp(_,x/S),R=E.clone().lerp(_,x/S),I=S-x;for(let P=0;P<=I;P++)P===0&&x===S?w[x][P]=b:w[x][P]=b.clone().lerp(R,P/I)}for(let x=0;x<S;x++)for(let b=0;b<2*(S-x)-1;b++){let R=Math.floor(b/2);b%2===0?(u(w[x][R+1]),u(w[x+1][R]),u(w[x][R])):(u(w[x][R+1]),u(w[x+1][R+1]),u(w[x+1][R]))}}function l(M){let E=new L;for(let _=0;_<r.length;_+=3)E.x=r[_+0],E.y=r[_+1],E.z=r[_+2],E.normalize().multiplyScalar(M),r[_+0]=E.x,r[_+1]=E.y,r[_+2]=E.z}function h(){let M=new L;for(let E=0;E<r.length;E+=3){M.x=r[E+0],M.y=r[E+1],M.z=r[E+2];let _=p(M)/2/Math.PI+.5,A=m(M)/Math.PI+.5;o.push(_,1-A)}g(),d()}function d(){for(let M=0;M<o.length;M+=6){let E=o[M+0],_=o[M+2],A=o[M+4],S=Math.max(E,_,A),w=Math.min(E,_,A);S>.9&&w<.1&&(E<.2&&(o[M+0]+=1),_<.2&&(o[M+2]+=1),A<.2&&(o[M+4]+=1))}}function u(M){r.push(M.x,M.y,M.z)}function f(M,E){let _=M*3;E.x=t[_+0],E.y=t[_+1],E.z=t[_+2]}function g(){let M=new L,E=new L,_=new L,A=new L,S=new pt,w=new pt,x=new pt;for(let b=0,R=0;b<r.length;b+=9,R+=6){M.set(r[b+0],r[b+1],r[b+2]),E.set(r[b+3],r[b+4],r[b+5]),_.set(r[b+6],r[b+7],r[b+8]),S.set(o[R+0],o[R+1]),w.set(o[R+2],o[R+3]),x.set(o[R+4],o[R+5]),A.copy(M).add(E).add(_).divideScalar(3);let I=p(A);y(S,R+0,M,I),y(w,R+2,E,I),y(x,R+4,_,I)}}function y(M,E,_,A){A<0&&M.x===1&&(o[E]=M.x-1),_.x===0&&_.z===0&&(o[E]=A/2/Math.PI+.5)}function p(M){return Math.atan2(M.z,-M.x)}function m(M){return Math.atan2(-M.y,Math.sqrt(M.x*M.x+M.z*M.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.vertices,t.indices,t.radius,t.detail)}};var vn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){$t("Curve: .getPoint() not implemented.")}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,s=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let n=this.getLengths(),s=0,r=n.length,o;e?o=e:o=t*n[r-1];let a=0,c=r-1,l;for(;a<=c;)if(s=Math.floor(a+(c-a)/2),l=n[s]-o,l<0)a=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,n[s]===o)return s/(r-1);let h=n[s],u=n[s+1]-h,f=(o-h)/u;return(s+f)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),c=e||(o.isVector2?new pt:new L);return c.copy(a).sub(o).normalize(),c}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){let n=new L,s=[],r=[],o=[],a=new L,c=new ee;for(let f=0;f<=t;f++){let g=f/t;s[f]=this.getTangentAt(g,new L)}r[0]=new L,o[0]=new L;let l=Number.MAX_VALUE,h=Math.abs(s[0].x),d=Math.abs(s[0].y),u=Math.abs(s[0].z);h<=l&&(l=h,n.set(1,0,0)),d<=l&&(l=d,n.set(0,1,0)),u<=l&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(s[f-1],s[f]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(le(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(c.makeRotationAxis(a,g))}o[f].crossVectors(s[f],r[f])}if(e===!0){let f=Math.acos(le(r[0].dot(r[t]),-1,1));f/=t,s[0].dot(a.crossVectors(r[0],r[t]))>0&&(f=-f);for(let g=1;g<=t;g++)r[g].applyMatrix4(c.makeRotationAxis(s[g],f*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},Ls=class extends vn{constructor(t=0,e=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=c}getPoint(t,e=new pt){let n=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+t*r,c=this.aX+this.xRadius*Math.cos(a),l=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),u=c-this.aX,f=l-this.aY;c=u*h-f*d+this.aX,l=u*d+f*h+this.aY}return n.set(c,l)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Qo=class extends Ls{constructor(t,e,n,s,r,o){super(t,e,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function zl(){let i=0,t=0,e=0,n=0;function s(r,o,a,c){i=r,t=a,e=-3*r+3*o-2*a-c,n=2*r-2*o+a+c}return{initCatmullRom:function(r,o,a,c,l){s(o,a,l*(a-r),l*(c-o))},initNonuniformCatmullRom:function(r,o,a,c,l,h,d){let u=(o-r)/l-(a-r)/(l+h)+(a-o)/h,f=(a-o)/h-(c-o)/(h+d)+(c-a)/d;u*=h,f*=h,s(o,a,u,f)},calc:function(r){let o=r*r,a=o*r;return i+t*r+e*o+n*a}}}var Kh=new L,Qh=new L,nl=new zl,il=new zl,sl=new zl,jo=class extends vn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new L){let n=e,s=this.points,r=s.length,o=(r-(this.closed?0:1))*t,a=Math.floor(o),c=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:c===0&&a===r-1&&(a=r-2,c=1);let l,h;this.closed||a>0?l=s[(a-1)%r]:(Qh.subVectors(s[0],s[1]).add(s[0]),l=Qh);let d=s[a%r],u=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(Kh.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=Kh),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,g=Math.pow(l.distanceToSquared(d),f),y=Math.pow(d.distanceToSquared(u),f),p=Math.pow(u.distanceToSquared(h),f);y<1e-4&&(y=1),g<1e-4&&(g=y),p<1e-4&&(p=y),nl.initNonuniformCatmullRom(l.x,d.x,u.x,h.x,g,y,p),il.initNonuniformCatmullRom(l.y,d.y,u.y,h.y,g,y,p),sl.initNonuniformCatmullRom(l.z,d.z,u.z,h.z,g,y,p)}else this.curveType==="catmullrom"&&(nl.initCatmullRom(l.x,d.x,u.x,h.x,this.tension),il.initCatmullRom(l.y,d.y,u.y,h.y,this.tension),sl.initCatmullRom(l.z,d.z,u.z,h.z,this.tension));return n.set(nl.calc(c),il.calc(c),sl.calc(c)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new L().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function jh(i,t,e,n,s){let r=(n-t)*.5,o=(s-e)*.5,a=i*i,c=i*a;return(2*e-2*n+r+o)*c+(-3*e+3*n-2*r-o)*a+r*i+e}function Yf(i,t){let e=1-i;return e*e*t}function Zf(i,t){return 2*(1-i)*i*t}function $f(i,t){return i*i*t}function sr(i,t,e,n){return Yf(i,t)+Zf(i,e)+$f(i,n)}function Jf(i,t){let e=1-i;return e*e*e*t}function Kf(i,t){let e=1-i;return 3*e*e*i*t}function Qf(i,t){return 3*(1-i)*i*i*t}function jf(i,t){return i*i*i*t}function rr(i,t,e,n,s){return Jf(i,t)+Kf(i,e)+Qf(i,n)+jf(i,s)}var vr=class extends vn{constructor(t=new pt,e=new pt,n=new pt,s=new pt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new pt){let n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(rr(t,s.x,r.x,o.x,a.x),rr(t,s.y,r.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},ta=class extends vn{constructor(t=new L,e=new L,n=new L,s=new L){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new L){let n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(rr(t,s.x,r.x,o.x,a.x),rr(t,s.y,r.y,o.y,a.y),rr(t,s.z,r.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Mr=class extends vn{constructor(t=new pt,e=new pt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new pt){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new pt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},ea=class extends vn{constructor(t=new L,e=new L){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new L){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new L){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Sr=class extends vn{constructor(t=new pt,e=new pt,n=new pt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new pt){let n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(sr(t,s.x,r.x,o.x),sr(t,s.y,r.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},na=class extends vn{constructor(t=new L,e=new L,n=new L){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new L){let n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(sr(t,s.x,r.x,o.x),sr(t,s.y,r.y,o.y),sr(t,s.z,r.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},br=class extends vn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new pt){let n=e,s=this.points,r=(s.length-1)*t,o=Math.floor(r),a=r-o,c=s[o===0?o:o-1],l=s[o],h=s[o>s.length-2?s.length-1:o+1],d=s[o>s.length-3?s.length-1:o+2];return n.set(jh(a,c.x,l.x,h.x,d.x),jh(a,c.y,l.y,h.y,d.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new pt().fromArray(s))}return this}},dl=Object.freeze({__proto__:null,ArcCurve:Qo,CatmullRomCurve3:jo,CubicBezierCurve:vr,CubicBezierCurve3:ta,EllipseCurve:Ls,LineCurve:Mr,LineCurve3:ea,QuadraticBezierCurve:Sr,QuadraticBezierCurve3:na,SplineCurve:br}),ia=class extends vn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new dl[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let o=s[r]-n,a=this.curves[r],c=a.getLength(),l=c===0?0:1-o/c;return a.getPointAt(l,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,c=o.getPoints(a);for(let l=0;l<c.length;l++){let h=c[l];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(new dl[s.type]().fromJSON(s))}return this}},Er=class extends ia{constructor(t){super(),this.type="Path",this.currentPoint=new pt,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let n=new Mr(this.currentPoint.clone(),new pt(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){let r=new Sr(this.currentPoint.clone(),new pt(t,e),new pt(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,o){let a=new vr(this.currentPoint.clone(),new pt(t,e),new pt(n,s),new pt(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),n=new br(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,o){let a=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(t+a,e+c,n,s,r,o),this}absarc(t,e,n,s,r,o){return this.absellipse(t,e,n,n,s,r,o),this}ellipse(t,e,n,s,r,o,a,c){let l=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+l,e+h,n,s,r,o,a,c),this}absellipse(t,e,n,s,r,o,a,c){let l=new Ls(t,e,n,s,r,o,a,c);if(this.curves.length>0){let d=l.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(l);let h=l.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},Ds=class extends Er{constructor(t){super(t),this.uuid=Hs(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){let s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(new Er().fromJSON(s))}return this}};function tp(i,t,e=2){let n=t&&t.length,s=n?t[0]*e:i.length,r=qu(i,0,s,e,!0),o=[];if(!r||r.next===r.prev)return o;let a,c,l;if(n&&(r=rp(i,t,r,e)),i.length>80*e){a=i[0],c=i[1];let h=a,d=c;for(let u=e;u<s;u+=e){let f=i[u],g=i[u+1];f<a&&(a=f),g<c&&(c=g),f>h&&(h=f),g>d&&(d=g)}l=Math.max(h-a,d-c),l=l!==0?32767/l:0}return wr(r,o,e,a,c,l,0),o}function qu(i,t,e,n,s){let r;if(s===gp(i,t,e,n)>0)for(let o=t;o<e;o+=n)r=tu(o/n|0,i[o],i[o+1],r);else for(let o=e-n;o>=t;o-=n)r=tu(o/n|0,i[o],i[o+1],r);return r&&Us(r,r.next)&&(Ar(r),r=r.next),r}function ji(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(Us(e,e.next)||Ae(e.prev,e,e.next)===0)){if(Ar(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function wr(i,t,e,n,s,r,o){if(!i)return;!o&&r&&hp(i,n,s,r);let a=i;for(;i.prev!==i.next;){let c=i.prev,l=i.next;if(r?np(i,n,s,r):ep(i)){t.push(c.i,i.i,l.i),Ar(i),i=l.next,a=l.next;continue}if(i=l,i===a){o?o===1?(i=ip(ji(i),t),wr(i,t,e,n,s,r,2)):o===2&&sp(i,t,e,n,s,r):wr(ji(i),t,e,n,s,r,1);break}}}function ep(i){let t=i.prev,e=i,n=i.next;if(Ae(t,e,n)>=0)return!1;let s=t.x,r=e.x,o=n.x,a=t.y,c=e.y,l=n.y,h=Math.min(s,r,o),d=Math.min(a,c,l),u=Math.max(s,r,o),f=Math.max(a,c,l),g=n.next;for(;g!==t;){if(g.x>=h&&g.x<=u&&g.y>=d&&g.y<=f&&ir(s,a,r,c,o,l,g.x,g.y)&&Ae(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function np(i,t,e,n){let s=i.prev,r=i,o=i.next;if(Ae(s,r,o)>=0)return!1;let a=s.x,c=r.x,l=o.x,h=s.y,d=r.y,u=o.y,f=Math.min(a,c,l),g=Math.min(h,d,u),y=Math.max(a,c,l),p=Math.max(h,d,u),m=fl(f,g,t,e,n),M=fl(y,p,t,e,n),E=i.prevZ,_=i.nextZ;for(;E&&E.z>=m&&_&&_.z<=M;){if(E.x>=f&&E.x<=y&&E.y>=g&&E.y<=p&&E!==s&&E!==o&&ir(a,h,c,d,l,u,E.x,E.y)&&Ae(E.prev,E,E.next)>=0||(E=E.prevZ,_.x>=f&&_.x<=y&&_.y>=g&&_.y<=p&&_!==s&&_!==o&&ir(a,h,c,d,l,u,_.x,_.y)&&Ae(_.prev,_,_.next)>=0))return!1;_=_.nextZ}for(;E&&E.z>=m;){if(E.x>=f&&E.x<=y&&E.y>=g&&E.y<=p&&E!==s&&E!==o&&ir(a,h,c,d,l,u,E.x,E.y)&&Ae(E.prev,E,E.next)>=0)return!1;E=E.prevZ}for(;_&&_.z<=M;){if(_.x>=f&&_.x<=y&&_.y>=g&&_.y<=p&&_!==s&&_!==o&&ir(a,h,c,d,l,u,_.x,_.y)&&Ae(_.prev,_,_.next)>=0)return!1;_=_.nextZ}return!0}function ip(i,t){let e=i;do{let n=e.prev,s=e.next.next;!Us(n,s)&&Zu(n,e,e.next,s)&&Tr(n,s)&&Tr(s,n)&&(t.push(n.i,e.i,s.i),Ar(e),Ar(e.next),e=i=s),e=e.next}while(e!==i);return ji(e)}function sp(i,t,e,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&fp(o,a)){let c=$u(o,a);o=ji(o,o.next),c=ji(c,c.next),wr(o,t,e,n,s,r,0),wr(c,t,e,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function rp(i,t,e,n){let s=[];for(let r=0,o=t.length;r<o;r++){let a=t[r]*n,c=r<o-1?t[r+1]*n:i.length,l=qu(i,a,c,n,!1);l===l.next&&(l.steiner=!0),s.push(dp(l))}s.sort(op);for(let r=0;r<s.length;r++)e=ap(s[r],e);return e}function op(i,t){let e=i.x-t.x;if(e===0&&(e=i.y-t.y,e===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(t.next.y-t.y)/(t.next.x-t.x);e=n-s}return e}function ap(i,t){let e=cp(i,t);if(!e)return t;let n=$u(e,i);return ji(n,n.next),ji(e,e.next)}function cp(i,t){let e=t,n=i.x,s=i.y,r=-1/0,o;if(Us(i,e))return e;do{if(Us(i,e.next))return e.next;if(s<=e.y&&s>=e.next.y&&e.next.y!==e.y){let d=e.x+(s-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(d<=n&&d>r&&(r=d,o=e.x<e.next.x?e:e.next,d===n))return o}e=e.next}while(e!==t);if(!o)return null;let a=o,c=o.x,l=o.y,h=1/0;e=o;do{if(n>=e.x&&e.x>=c&&n!==e.x&&Yu(s<l?n:r,s,c,l,s<l?r:n,s,e.x,e.y)){let d=Math.abs(s-e.y)/(n-e.x);Tr(e,i)&&(d<h||d===h&&(e.x>o.x||e.x===o.x&&lp(o,e)))&&(o=e,h=d)}e=e.next}while(e!==a);return o}function lp(i,t){return Ae(i.prev,i,t.prev)<0&&Ae(t.next,i,i.next)<0}function hp(i,t,e,n){let s=i;do s.z===0&&(s.z=fl(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,up(s)}function up(i){let t,e=1;do{let n=i,s;i=null;let r=null;for(t=0;n;){t++;let o=n,a=0;for(let l=0;l<e&&(a++,o=o.nextZ,!!o);l++);let c=e;for(;a>0||c>0&&o;)a!==0&&(c===0||!o||n.z<=o.z)?(s=n,n=n.nextZ,a--):(s=o,o=o.nextZ,c--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=o}r.nextZ=null,e*=2}while(t>1);return i}function fl(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function dp(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function Yu(i,t,e,n,s,r,o,a){return(s-o)*(t-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(s-o)*(n-a)}function ir(i,t,e,n,s,r,o,a){return!(i===o&&t===a)&&Yu(i,t,e,n,s,r,o,a)}function fp(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!pp(i,t)&&(Tr(i,t)&&Tr(t,i)&&mp(i,t)&&(Ae(i.prev,i,t.prev)||Ae(i,t.prev,t))||Us(i,t)&&Ae(i.prev,i,i.next)>0&&Ae(t.prev,t,t.next)>0)}function Ae(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function Us(i,t){return i.x===t.x&&i.y===t.y}function Zu(i,t,e,n){let s=Io(Ae(i,t,e)),r=Io(Ae(i,t,n)),o=Io(Ae(e,n,i)),a=Io(Ae(e,n,t));return!!(s!==r&&o!==a||s===0&&Co(i,e,t)||r===0&&Co(i,n,t)||o===0&&Co(e,i,n)||a===0&&Co(e,t,n))}function Co(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function Io(i){return i>0?1:i<0?-1:0}function pp(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&Zu(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function Tr(i,t){return Ae(i.prev,i,i.next)<0?Ae(i,t,i.next)>=0&&Ae(i,i.prev,t)>=0:Ae(i,t,i.prev)<0||Ae(i,i.next,t)<0}function mp(i,t){let e=i,n=!1,s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function $u(i,t){let e=pl(i.i,i.x,i.y),n=pl(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function tu(i,t,e,n){let s=pl(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Ar(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function pl(i,t,e){return{i,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function gp(i,t,e,n){let s=0;for(let r=t,o=e-n;r<e;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}var ml=class{static triangulate(t,e,n=2){return tp(t,e,n)}},$i=class i{static area(t){let e=t.length,n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return i.area(t)<0}static triangulateShape(t,e){let n=[],s=[],r=[];eu(t),nu(n,t);let o=t.length;e.forEach(eu);for(let c=0;c<e.length;c++)s.push(o),o+=e[c].length,nu(n,e[c]);let a=ml.triangulate(n,s);for(let c=0;c<a.length;c+=3)r.push(a.slice(c,c+3));return r}};function eu(i){let t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function nu(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}var Ns=class i extends Be{constructor(t=new Ds([new pt(.5,.5),new pt(-.5,.5),new pt(-.5,-.5),new pt(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let n=this,s=[],r=[];for(let a=0,c=t.length;a<c;a++){let l=t[a];o(l)}this.setAttribute("position",new se(s,3)),this.setAttribute("uv",new se(r,2)),this.computeVertexNormals();function o(a){let c=[],l=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,d=e.depth!==void 0?e.depth:1,u=e.bevelEnabled!==void 0?e.bevelEnabled:!0,f=e.bevelThickness!==void 0?e.bevelThickness:.2,g=e.bevelSize!==void 0?e.bevelSize:f-.1,y=e.bevelOffset!==void 0?e.bevelOffset:0,p=e.bevelSegments!==void 0?e.bevelSegments:3,m=e.extrudePath,M=e.UVGenerator!==void 0?e.UVGenerator:xp,E,_=!1,A,S,w,x;if(m){E=m.getSpacedPoints(h),_=!0,u=!1;let j=m.isCatmullRomCurve3?m.closed:!1;A=m.computeFrenetFrames(h,j),S=new L,w=new L,x=new L}u||(p=0,f=0,g=0,y=0);let b=a.extractPoints(l),R=b.shape,I=b.holes;if(!$i.isClockWise(R)){R=R.reverse();for(let j=0,lt=I.length;j<lt;j++){let ct=I[j];$i.isClockWise(ct)&&(I[j]=ct.reverse())}}function U(j){let ct=10000000000000001e-36,Et=j[0];for(let Mt=1;Mt<=j.length;Mt++){let Yt=Mt%j.length,Ht=j[Yt],Kt=Ht.x-Et.x,te=Ht.y-Et.y,N=Kt*Kt+te*te,pe=Math.max(Math.abs(Ht.x),Math.abs(Ht.y),Math.abs(Et.x),Math.abs(Et.y)),ce=ct*pe*pe;if(N<=ce){j.splice(Yt,1),Mt--;continue}Et=Ht}}U(R),I.forEach(U);let O=I.length,D=R;for(let j=0;j<O;j++){let lt=I[j];R=R.concat(lt)}function k(j,lt,ct){return lt||Zt("ExtrudeGeometry: vec does not exist"),j.clone().addScaledVector(lt,ct)}let F=R.length;function H(j,lt,ct){let Et,Mt,Yt,Ht=j.x-lt.x,Kt=j.y-lt.y,te=ct.x-j.x,N=ct.y-j.y,pe=Ht*Ht+Kt*Kt,ce=Ht*N-Kt*te;if(Math.abs(ce)>Number.EPSILON){let C=Math.sqrt(pe),v=Math.sqrt(te*te+N*N),G=lt.x-Kt/C,X=lt.y+Ht/C,K=ct.x-N/v,dt=ct.y+te/v,mt=((K-G)*N-(dt-X)*te)/(Ht*N-Kt*te);Et=G+Ht*mt-j.x,Mt=X+Kt*mt-j.y;let Q=Et*Et+Mt*Mt;if(Q<=2)return new pt(Et,Mt);Yt=Math.sqrt(Q/2)}else{let C=!1;Ht>Number.EPSILON?te>Number.EPSILON&&(C=!0):Ht<-Number.EPSILON?te<-Number.EPSILON&&(C=!0):Math.sign(Kt)===Math.sign(N)&&(C=!0),C?(Et=-Kt,Mt=Ht,Yt=Math.sqrt(pe)):(Et=Ht,Mt=Kt,Yt=Math.sqrt(pe/2))}return new pt(Et/Yt,Mt/Yt)}let Y=[];for(let j=0,lt=D.length,ct=lt-1,Et=j+1;j<lt;j++,ct++,Et++)ct===lt&&(ct=0),Et===lt&&(Et=0),Y[j]=H(D[j],D[ct],D[Et]);let J=[],$,st=Y.concat();for(let j=0,lt=O;j<lt;j++){let ct=I[j];$=[];for(let Et=0,Mt=ct.length,Yt=Mt-1,Ht=Et+1;Et<Mt;Et++,Yt++,Ht++)Yt===Mt&&(Yt=0),Ht===Mt&&(Ht=0),$[Et]=H(ct[Et],ct[Yt],ct[Ht]);J.push($),st=st.concat($)}let rt;if(p===0)rt=$i.triangulateShape(D,I);else{let j=[],lt=[];for(let ct=0;ct<p;ct++){let Et=ct/p,Mt=f*Math.cos(Et*Math.PI/2),Yt=g*Math.sin(Et*Math.PI/2)+y;for(let Ht=0,Kt=D.length;Ht<Kt;Ht++){let te=k(D[Ht],Y[Ht],Yt);ut(te.x,te.y,-Mt),Et===0&&j.push(te)}for(let Ht=0,Kt=O;Ht<Kt;Ht++){let te=I[Ht];$=J[Ht];let N=[];for(let pe=0,ce=te.length;pe<ce;pe++){let C=k(te[pe],$[pe],Yt);ut(C.x,C.y,-Mt),Et===0&&N.push(C)}Et===0&&lt.push(N)}}rt=$i.triangulateShape(j,lt)}let Tt=rt.length,vt=g+y;for(let j=0;j<F;j++){let lt=u?k(R[j],st[j],vt):R[j];_?(w.copy(A.normals[0]).multiplyScalar(lt.x),S.copy(A.binormals[0]).multiplyScalar(lt.y),x.copy(E[0]).add(w).add(S),ut(x.x,x.y,x.z)):ut(lt.x,lt.y,0)}for(let j=1;j<=h;j++)for(let lt=0;lt<F;lt++){let ct=u?k(R[lt],st[lt],vt):R[lt];_?(w.copy(A.normals[j]).multiplyScalar(ct.x),S.copy(A.binormals[j]).multiplyScalar(ct.y),x.copy(E[j]).add(w).add(S),ut(x.x,x.y,x.z)):ut(ct.x,ct.y,d/h*j)}for(let j=p-1;j>=0;j--){let lt=j/p,ct=f*Math.cos(lt*Math.PI/2),Et=g*Math.sin(lt*Math.PI/2)+y;for(let Mt=0,Yt=D.length;Mt<Yt;Mt++){let Ht=k(D[Mt],Y[Mt],Et);ut(Ht.x,Ht.y,d+ct)}for(let Mt=0,Yt=I.length;Mt<Yt;Mt++){let Ht=I[Mt];$=J[Mt];for(let Kt=0,te=Ht.length;Kt<te;Kt++){let N=k(Ht[Kt],$[Kt],Et);_?ut(N.x,N.y+E[h-1].y,E[h-1].x+ct):ut(N.x,N.y,d+ct)}}}q(),ot();function q(){let j=s.length/3;if(u){let lt=0,ct=F*lt;for(let Et=0;Et<Tt;Et++){let Mt=rt[Et];Ot(Mt[2]+ct,Mt[1]+ct,Mt[0]+ct)}lt=h+p*2,ct=F*lt;for(let Et=0;Et<Tt;Et++){let Mt=rt[Et];Ot(Mt[0]+ct,Mt[1]+ct,Mt[2]+ct)}}else{for(let lt=0;lt<Tt;lt++){let ct=rt[lt];Ot(ct[2],ct[1],ct[0])}for(let lt=0;lt<Tt;lt++){let ct=rt[lt];Ot(ct[0]+F*h,ct[1]+F*h,ct[2]+F*h)}}n.addGroup(j,s.length/3-j,0)}function ot(){let j=s.length/3,lt=0;et(D,lt),lt+=D.length;for(let ct=0,Et=I.length;ct<Et;ct++){let Mt=I[ct];et(Mt,lt),lt+=Mt.length}n.addGroup(j,s.length/3-j,1)}function et(j,lt){let ct=j.length;for(;--ct>=0;){let Et=ct,Mt=ct-1;Mt<0&&(Mt=j.length-1);for(let Yt=0,Ht=h+p*2;Yt<Ht;Yt++){let Kt=F*Yt,te=F*(Yt+1),N=lt+Et+Kt,pe=lt+Mt+Kt,ce=lt+Mt+te,C=lt+Et+te;Nt(N,pe,ce,C)}}}function ut(j,lt,ct){c.push(j),c.push(lt),c.push(ct)}function Ot(j,lt,ct){oe(j),oe(lt),oe(ct);let Et=s.length/3,Mt=M.generateTopUV(n,s,Et-3,Et-2,Et-1);It(Mt[0]),It(Mt[1]),It(Mt[2])}function Nt(j,lt,ct,Et){oe(j),oe(lt),oe(Et),oe(lt),oe(ct),oe(Et);let Mt=s.length/3,Yt=M.generateSideWallUV(n,s,Mt-6,Mt-3,Mt-2,Mt-1);It(Yt[0]),It(Yt[1]),It(Yt[3]),It(Yt[1]),It(Yt[2]),It(Yt[3])}function oe(j){s.push(c[j*3+0]),s.push(c[j*3+1]),s.push(c[j*3+2])}function It(j){r.push(j.x),r.push(j.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return _p(e,n,t)}static fromJSON(t,e){let n=[];for(let r=0,o=t.shapes.length;r<o;r++){let a=e[t.shapes[r]];n.push(a)}let s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new dl[s.type]().fromJSON(s)),new i(n,t.options)}},xp={generateTopUV:function(i,t,e,n,s){let r=t[e*3],o=t[e*3+1],a=t[n*3],c=t[n*3+1],l=t[s*3],h=t[s*3+1];return[new pt(r,o),new pt(a,c),new pt(l,h)]},generateSideWallUV:function(i,t,e,n,s,r){let o=t[e*3],a=t[e*3+1],c=t[e*3+2],l=t[n*3],h=t[n*3+1],d=t[n*3+2],u=t[s*3],f=t[s*3+1],g=t[s*3+2],y=t[r*3],p=t[r*3+1],m=t[r*3+2];return Math.abs(a-h)<Math.abs(o-l)?[new pt(o,1-c),new pt(l,1-d),new pt(u,1-g),new pt(y,1-m)]:[new pt(a,1-c),new pt(h,1-d),new pt(f,1-g),new pt(p,1-m)]}};function _p(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var Rr=class i extends Ko{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};var Ee=class i extends Be{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,o=e/2,a=Math.floor(n),c=Math.floor(s),l=a+1,h=c+1,d=t/a,u=e/c,f=[],g=[],y=[],p=[];for(let m=0;m<h;m++){let M=m*u-o;for(let E=0;E<l;E++){let _=E*d-r;g.push(_,-M,0),y.push(0,0,1),p.push(E/a),p.push(1-m/c)}}for(let m=0;m<c;m++)for(let M=0;M<a;M++){let E=M+l*m,_=M+l*(m+1),A=M+1+l*(m+1),S=M+1+l*m;f.push(E,_,S),f.push(_,A,S)}this.setIndex(f),this.setAttribute("position",new se(g,3)),this.setAttribute("normal",new se(y,3)),this.setAttribute("uv",new se(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}};var fe=class i extends Be{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let c=Math.min(o+a,Math.PI),l=0,h=[],d=new L,u=new L,f=[],g=[],y=[],p=[];for(let m=0;m<=n;m++){let M=[],E=m/n,_=o+E*a,A=t*Math.cos(_),S=Math.sqrt(t*t-A*A),w=0;m===0&&o===0?w=.5/e:m===n&&c===Math.PI&&(w=-.5/e);for(let x=0;x<=e;x++){let b=x/e,R=s+b*r;d.x=-S*Math.cos(R),d.y=A,d.z=S*Math.sin(R),g.push(d.x,d.y,d.z),u.copy(d).normalize(),y.push(u.x,u.y,u.z),p.push(b+w,1-E),M.push(l++)}h.push(M)}for(let m=0;m<n;m++)for(let M=0;M<e;M++){let E=h[m][M+1],_=h[m][M],A=h[m+1][M],S=h[m+1][M+1];(m!==0||o>0)&&f.push(E,_,S),(m!==n-1||c<Math.PI)&&f.push(_,A,S)}this.setIndex(f),this.setAttribute("position",new se(g,3)),this.setAttribute("normal",new se(y,3)),this.setAttribute("uv",new se(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var Cr=class i extends Be{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r,thetaStart:o,thetaLength:a},n=Math.floor(n),s=Math.floor(s);let c=[],l=[],h=[],d=[],u=new L,f=new L,g=new L;for(let y=0;y<=n;y++){let p=o+y/n*a;for(let m=0;m<=s;m++){let M=m/s*r;f.x=(t+e*Math.cos(p))*Math.cos(M),f.y=(t+e*Math.cos(p))*Math.sin(M),f.z=e*Math.sin(p),l.push(f.x,f.y,f.z),u.x=t*Math.cos(M),u.y=t*Math.sin(M),g.subVectors(f,u).normalize(),h.push(g.x,g.y,g.z),d.push(m/s),d.push(y/n)}}for(let y=1;y<=n;y++)for(let p=1;p<=s;p++){let m=(s+1)*y+p-1,M=(s+1)*(y-1)+p-1,E=(s+1)*(y-1)+p,_=(s+1)*y+p;c.push(m,M,_),c.push(M,E,_)}this.setIndex(c),this.setAttribute("position",new se(l,3)),this.setAttribute("normal",new se(h,3)),this.setAttribute("uv",new se(d,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}};function es(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];if(iu(s))s.isRenderTargetTexture?($t("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(iu(s[0])){let r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function on(i){let t={};for(let e=0;e<i.length;e++){let n=es(i[e]);for(let s in n)t[s]=n[s]}return t}function iu(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function yp(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Hl(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:he.workingColorSpace}var Ju={clone:es,merge:on},vp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Mp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,ln=class extends pi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=vp,this.fragmentShader=Mp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=es(t.uniforms),this.uniformsGroups=yp(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new Vt().setHex(s.value);break;case"v2":this.uniforms[n].value=new pt().fromArray(s.value);break;case"v3":this.uniforms[n].value=new L().fromArray(s.value);break;case"v4":this.uniforms[n].value=new we().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Qt().fromArray(s.value);break;case"m4":this.uniforms[n].value=new ee().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},sa=class extends ln{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Rt=class extends pi{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Vt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Vt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Yr,this.normalScale=new pt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Te,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var Ue=class extends pi{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Vt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Vt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Yr,this.normalScale=new pt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Te,this.combine=ya,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},ra=class extends pi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Du,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},oa=class extends pi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Po(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}var Di=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let o;e:{i:if(!(t<s)){for(let a=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=e[++n],t<s)break t}o=e.length;break e}if(!(t>=r)){let a=e[1];t<a&&(n=2,r=a);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=e[--n-1],t>=r)break t}o=n,n=0;break e}break n}for(;n<o;){let a=n+o>>>1;t<e[a]?o=a:n=a+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let o=0;o!==s;++o)e[o]=n[r+o];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},aa=class extends Di{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:al,endingEnd:al}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,o=t+1,a=s[r],c=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case cl:r=t,a=2*e-n;break;case ll:r=s.length-2,a=e+s[r]-s[r+1];break;default:r=t,a=n}if(c===void 0)switch(this.getSettings_().endingEnd){case cl:o=t,c=2*n-e;break;case ll:o=1,c=n+s[1]-s[0];break;default:o=t-1,c=e}let l=(n-e)*.5,h=this.valueSize;this._weightPrev=l/(e-a),this._weightNext=l/(c-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=t*a,l=c-a,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,f=this._weightNext,g=(n-e)/(s-e),y=g*g,p=y*g,m=-u*p+2*u*y-u*g,M=(1+u)*p+(-1.5-2*u)*y+(-.5+u)*g+1,E=(-1-f)*p+(1.5+f)*y+.5*g,_=f*p-f*y;for(let A=0;A!==a;++A)r[A]=m*o[h+A]+M*o[l+A]+E*o[c+A]+_*o[d+A];return r}},ca=class extends Di{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=t*a,l=c-a,h=(n-e)/(s-e),d=1-h;for(let u=0;u!==a;++u)r[u]=o[l+u]*d+o[c+u]*h;return r}},la=class extends Di{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},ha=class extends Di{interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=t*a,l=c-a,h=this.inTangents,d=this.outTangents;if(!h||!d){let g=(n-e)/(s-e),y=1-g;for(let p=0;p!==a;++p)r[p]=o[l+p]*y+o[c+p]*g;return r}let u=a*2,f=t-1;for(let g=0;g!==a;++g){let y=o[l+g],p=o[c+g],m=f*u+g*2,M=d[m],E=d[m+1],_=t*u+g*2,A=h[_],S=h[_+1],w=(n-e)/(s-e),x,b,R,I,P;for(let U=0;U<8;U++){x=w*w,b=x*w,R=1-w,I=R*R,P=I*R;let D=P*e+3*I*w*M+3*R*x*A+b*s-n;if(Math.abs(D)<1e-10)break;let k=3*I*(M-e)+6*R*w*(A-M)+3*x*(s-A);if(Math.abs(k)<1e-10)break;w=w-D/k,w=Math.max(0,Math.min(1,w))}r[g]=P*y+3*I*w*E+3*R*x*S+b*p}return r}},Mn=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Po(e,this.TimeBufferType),this.values=Po(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:Po(t.times,Array),values:Po(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s)}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new la(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new ca(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new aa(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new ha(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case or:e=this.InterpolantFactoryMethodDiscrete;break;case Xo:e=this.InterpolantFactoryMethodLinear;break;case Uo:e=this.InterpolantFactoryMethodSmooth;break;case ol:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return $t("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return or;case this.InterpolantFactoryMethodLinear:return Xo;case this.InterpolantFactoryMethodSmooth:return Uo;case this.InterpolantFactoryMethodBezier:return ol}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t}return this}trim(t,e){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<t;)++r;for(;o!==-1&&n[o]>e;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Zt("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Zt("KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let c=n[a];if(typeof c=="number"&&isNaN(c)){Zt("KeyframeTrack: Time is not a valid number.",this,a,c),t=!1;break}if(o!==null&&o>c){Zt("KeyframeTrack: Out of order keys.",this,a,c,o),t=!1;break}o=c}if(s!==void 0&&Tf(s))for(let a=0,c=s.length;a!==c;++a){let l=s[a];if(isNaN(l)){Zt("KeyframeTrack: Value is not a valid number.",this,a,l),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Uo,r=t.length-1,o=1;for(let a=1;a<r;++a){let c=!1,l=t[a],h=t[a+1];if(l!==h&&(a!==1||l!==t[0]))if(s)c=!0;else{let d=a*n,u=d-n,f=d+n;for(let g=0;g!==n;++g){let y=e[d+g];if(y!==e[u+g]||y!==e[f+g]){c=!0;break}}}if(c){if(a!==o){t[o]=t[a];let d=a*n,u=o*n;for(let f=0;f!==n;++f)e[u+f]=e[d+f]}++o}}if(r>0){t[o]=t[r];for(let a=r*n,c=o*n,l=0;l!==n;++l)e[c+l]=e[a+l];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,s}};Mn.prototype.ValueTypeName="";Mn.prototype.TimeBufferType=Float32Array;Mn.prototype.ValueBufferType=Float32Array;Mn.prototype.DefaultInterpolation=Xo;var Ui=class extends Mn{constructor(t,e,n){super(t,e,n)}};Ui.prototype.ValueTypeName="bool";Ui.prototype.ValueBufferType=Array;Ui.prototype.DefaultInterpolation=or;Ui.prototype.InterpolantFactoryMethodLinear=void 0;Ui.prototype.InterpolantFactoryMethodSmooth=void 0;var ua=class extends Mn{constructor(t,e,n,s){super(t,e,n,s)}};ua.prototype.ValueTypeName="color";var da=class extends Mn{constructor(t,e,n,s){super(t,e,n,s)}};da.prototype.ValueTypeName="number";var fa=class extends Di{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(n-e)/(s-e),l=t*a;for(let h=l+a;l!==h;l+=4)Se.slerpFlat(r,0,o,l-a,o,l,c);return r}},Ir=class extends Mn{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new fa(this.times,this.values,this.getValueSize(),t)}};Ir.prototype.ValueTypeName="quaternion";Ir.prototype.InterpolantFactoryMethodSmooth=void 0;var Ni=class extends Mn{constructor(t,e,n){super(t,e,n)}};Ni.prototype.ValueTypeName="string";Ni.prototype.ValueBufferType=Array;Ni.prototype.DefaultInterpolation=or;Ni.prototype.InterpolantFactoryMethodLinear=void 0;Ni.prototype.InterpolantFactoryMethodSmooth=void 0;var pa=class extends Mn{constructor(t,e,n,s){super(t,e,n,s)}};pa.prototype.ValueTypeName="vector";var ma=class{constructor(t,e,n){let s=this,r=!1,o=0,a=0,c,l=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,d){return l.push(h,d),this},this.removeHandler=function(h){let d=l.indexOf(h);return d!==-1&&l.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=l.length;d<u;d+=2){let f=l[d],g=l[d+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Ku=new ma,ga=class{constructor(t){this.manager=t!==void 0?t:Ku,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};ga.DEFAULT_MATERIAL_NAME="__DEFAULT";var Pr=class extends rn{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Vt(t),this.intensity=e}dispose(){this.dispatchEvent({type:"dispose"})}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},Lr=class extends Pr{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(rn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Vt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},rl=new ee,su=new L,ru=new L,gl=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new pt(512,512),this.mapType=pn,this.map=null,this.mapPass=null,this.matrix=new ee,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ps,this._frameExtents=new pt(1,1),this._viewportCount=1,this._viewports=[new we(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera,n=this.matrix;su.setFromMatrixPosition(t.matrixWorld),e.position.copy(su),ru.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(ru),e.updateMatrixWorld(),rl.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(rl,e.coordinateSystem,e.reversedDepth),e.coordinateSystem===Ts||e.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(rl)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Lo=new L,Do=new Se,Yn=new L,Dr=class extends rn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ee,this.projectionMatrix=new ee,this.projectionMatrixInverse=new ee,this.coordinateSystem=zn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Lo,Do,Yn),Yn.x===1&&Yn.y===1&&Yn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Lo,Do,Yn.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(Lo,Do,Yn),Yn.x===1&&Yn.y===1&&Yn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Lo,Do,Yn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Ri=new L,ou=new pt,au=new pt,sn=class extends Dr{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=qo*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Dc*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return qo*2*Math.atan(Math.tan(Dc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Ri.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Ri.x,Ri.y).multiplyScalar(-t/Ri.z),Ri.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ri.x,Ri.y).multiplyScalar(-t/Ri.z)}getViewSize(t,e){return this.getViewBounds(t,ou,au),e.subVectors(au,ou)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Dc*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*s/c,e-=o.offsetY*n/l,s*=o.width/c,n*=o.height/l}let a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var Fi=class extends Dr{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,o=n+t,a=s+e,c=s-e;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=h*this.view.offsetY,c=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},xl=class extends gl{constructor(){super(new Fi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ur=class extends Pr{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(rn.DEFAULT_UP),this.updateMatrix(),this.target=new rn,this.shadow=new xl}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var Ss=-90,bs=1,Fs=class extends rn{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new sn(Ss,bs,t,e);s.layers=this.layers,this.add(s);let r=new sn(Ss,bs,t,e);r.layers=this.layers,this.add(r);let o=new sn(Ss,bs,t,e);o.layers=this.layers,this.add(o);let a=new sn(Ss,bs,t,e);a.layers=this.layers,this.add(a);let c=new sn(Ss,bs,t,e);c.layers=this.layers,this.add(c);let l=new sn(Ss,bs,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,c]=e;for(let l of e)this.remove(l);if(t===zn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===Ts)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let l of e)this.add(l),l.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,c,l,h]=this.children,d=t.getRenderTarget(),u=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let p=!1;t.isWebGLRenderer===!0?p=t.state.buffers.depth.getReversed():p=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,2,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,3,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),t.setRenderTarget(n,4,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),n.texture.generateMipmaps=y,t.setRenderTarget(n,5,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(d,u,f),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},xa=class extends sn{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var Gl="\\[\\]\\.:\\/",Sp=new RegExp("["+Gl+"]","g"),kl="[^"+Gl+"]",bp="[^"+Gl.replace("\\.","")+"]",Ep=/((?:WC+[\/:])*)/.source.replace("WC",kl),wp=/(WCOD+)?/.source.replace("WCOD",bp),Tp=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",kl),Ap=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",kl),Rp=new RegExp("^"+Ep+wp+Tp+Ap+"$"),Cp=["material","materials","bones","map"],_l=class{constructor(t,e,n){let s=n||be.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},be=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Sp,"")}static parseTrackName(t){let e=Rp.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Cp.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let c=n(a.children);if(c)return c}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){$t("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=e.objectIndex;switch(n){case"materials":if(!t.material){Zt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Zt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Zt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===l){l=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Zt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Zt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){Zt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(l!==void 0){if(t[l]===void 0){Zt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[l]}}let o=t[s];if(o===void 0){let l=e.nodeName;Zt("PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Zt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Zt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};be.Composite=_l;be.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};be.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};be.prototype.GetterByBindingType=[be.prototype._getValue_direct,be.prototype._getValue_array,be.prototype._getValue_arrayElement,be.prototype._getValue_toArray];be.prototype.SetterByBindingTypeAndVersioning=[[be.prototype._setValue_direct,be.prototype._setValue_direct_setNeedsUpdate,be.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[be.prototype._setValue_array,be.prototype._setValue_array_setNeedsUpdate,be.prototype._setValue_array_setMatrixWorldNeedsUpdate],[be.prototype._setValue_arrayElement,be.prototype._setValue_arrayElement_setNeedsUpdate,be.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[be.prototype._setValue_fromArray,be.prototype._setValue_fromArray_setNeedsUpdate,be.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var fy=new Float32Array(1);var cu=new ee,Nr=class{constructor(t,e,n=0,s=1/0){this.ray=new mr(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new Cs,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):Zt("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return cu.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(cu),this}intersectObject(t,e=!0,n=[]){return yl(t,this,n,e),n.sort(lu),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)yl(t[s],this,n,e);return n.sort(lu),n}};function lu(i,t){return i.distance-t.distance}function yl(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let o=0,a=r.length;o<a;o++)yl(r[o],t,e,!0)}}var vl=class i{static{i.prototype.isMatrix2=!0}constructor(t,e,n,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=s,this}};function Vl(i,t,e,n){let s=Ip(n);switch(e){case Nl:return i*t;case Ta:return i*t/s.components*s.byteLength;case Aa:return i*t/s.components*s.byteLength;case zi:return i*t*2/s.components*s.byteLength;case Ra:return i*t*2/s.components*s.byteLength;case Fl:return i*t*3/s.components*s.byteLength;case Pn:return i*t*4/s.components*s.byteLength;case Ca:return i*t*4/s.components*s.byteLength;case Gr:case kr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Vr:case Wr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Pa:case Da:return Math.max(i,16)*Math.max(t,8)/4;case Ia:case La:return Math.max(i,8)*Math.max(t,8)/2;case Ua:case Na:case Ba:case Oa:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Fa:case Xr:case za:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Ha:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Ga:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case ka:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Va:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Wa:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case Xa:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case qa:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Ya:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Za:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case $a:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Ja:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Ka:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Qa:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case ja:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case tc:case ec:case nc:return Math.ceil(i/4)*Math.ceil(t/4)*16;case ic:case sc:return Math.ceil(i/4)*Math.ceil(t/4)*8;case qr:case rc:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Ip(i){switch(i){case pn:case Pl:return{byteLength:1,components:1};case Os:case Ll:case ei:return{byteLength:2,components:1};case Ea:case wa:return{byteLength:2,components:4};case Gn:case ba:case In:return{byteLength:4,components:1};case Dl:case Ul:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"185"}}));typeof window<"u"&&(window.__THREE__?$t("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="185");function vd(){let i=null,t=!1,e=null,n=null;function s(r,o){e(r,o),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Lp(i){let t=new WeakMap;function e(a,c){let l=a.array,h=a.usage,d=l.byteLength,u=i.createBuffer();i.bindBuffer(c,u),i.bufferData(c,l,h),a.onUploadCallback();let f;if(l instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=i.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=i.SHORT;else if(l instanceof Uint32Array)f=i.UNSIGNED_INT;else if(l instanceof Int32Array)f=i.INT;else if(l instanceof Int8Array)f=i.BYTE;else if(l instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:u,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:d}}function n(a,c,l){let h=c.array,d=c.updateRanges;if(i.bindBuffer(l,a),d.length===0)i.bufferSubData(l,0,h);else{d.sort((f,g)=>f.start-g.start);let u=0;for(let f=1;f<d.length;f++){let g=d[u],y=d[f];y.start<=g.start+g.count+1?g.count=Math.max(g.count,y.start+y.count-g.start):(++u,d[u]=y)}d.length=u+1;for(let f=0,g=d.length;f<g;f++){let y=d[f];i.bufferSubData(l,y.start*h.BYTES_PER_ELEMENT,h,y.start,y.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let c=t.get(a);c&&(i.deleteBuffer(c.buffer),t.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let l=t.get(a);if(l===void 0)t.set(a,e(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,a,c),l.version=a.version}}return{get:s,remove:r,update:o}}var Dp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Up=`#ifdef USE_ALPHAHASH
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
#endif`,Np=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Fp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Bp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Op=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,zp=`#ifdef USE_AOMAP
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
#endif`,Hp=`#ifdef USE_AOMAP
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
#endif`,kp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Vp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Wp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Xp=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,qp=`#ifdef USE_IRIDESCENCE
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
#endif`,Yp=`#ifdef USE_BUMPMAP
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
#endif`,Zp=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,$p=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Jp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Kp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Qp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,jp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,tm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,em=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,nm=`#define PI 3.141592653589793
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
} // validated`,im=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,sm=`vec3 transformedNormal = objectNormal;
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
#endif`,rm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,om=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,am=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,cm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,lm="gl_FragColor = linearToOutputTexel( gl_FragColor );",hm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,um=`#ifdef USE_ENVMAP
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
#endif`,dm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,fm=`#ifdef USE_ENVMAP
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
#endif`,pm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,mm=`#ifdef USE_ENVMAP
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
#endif`,gm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,xm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,_m=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,ym=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,vm=`#ifdef USE_GRADIENTMAP
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
}`,Mm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Sm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,bm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Em=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,wm=`#ifdef USE_ENVMAP
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
#endif`,Tm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Am=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Rm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Cm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Im=`PhysicalMaterial material;
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
#endif`,Pm=`uniform sampler2D dfgLUT;
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
}`,Lm=`
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
#endif`,Dm=`#if defined( RE_IndirectDiffuse )
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
#endif`,Um=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Nm=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,Fm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Bm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Om=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,zm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Hm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Gm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,km=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Vm=`#if defined( USE_POINTS_UV )
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
#endif`,Wm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Xm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,qm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Ym=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Zm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,$m=`#ifdef USE_MORPHTARGETS
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
#endif`,Jm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Km=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Qm=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,jm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,t0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,e0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,n0=`#ifdef USE_NORMALMAP
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
#endif`,i0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,s0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,r0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,o0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,a0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,c0=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,l0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,h0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,u0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,d0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,f0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,p0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,m0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,g0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,x0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,_0=`float getShadowMask() {
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
}`,y0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,v0=`#ifdef USE_SKINNING
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
#endif`,M0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,S0=`#ifdef USE_SKINNING
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
#endif`,b0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,E0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,w0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,T0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,A0=`#ifdef USE_TRANSMISSION
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
#endif`,R0=`#ifdef USE_TRANSMISSION
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
#endif`,C0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,I0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,P0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,L0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,D0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,U0=`uniform sampler2D t2D;
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
}`,N0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,F0=`#ifdef ENVMAP_TYPE_CUBE
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
}`,B0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,O0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,z0=`#include <common>
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
}`,H0=`#if DEPTH_PACKING == 3200
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
}`,k0=`#define DISTANCE
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
}`,V0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,W0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,X0=`uniform float scale;
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
}`,q0=`uniform vec3 diffuse;
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
}`,Y0=`#include <common>
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
}`,Z0=`uniform vec3 diffuse;
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
}`,$0=`#define LAMBERT
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
}`,J0=`#define LAMBERT
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
}`,K0=`#define MATCAP
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
}`,Q0=`#define MATCAP
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
}`,j0=`#define NORMAL
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
}`,tg=`#define NORMAL
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
}`,eg=`#define PHONG
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
}`,ng=`#define PHONG
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
}`,ig=`#define STANDARD
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
}`,sg=`#define STANDARD
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
}`,rg=`#define TOON
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
}`,og=`#define TOON
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
}`,ag=`uniform float size;
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
}`,cg=`uniform vec3 diffuse;
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
}`,lg=`#include <common>
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
}`,hg=`uniform vec3 color;
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
}`,ug=`uniform float rotation;
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
}`,dg=`uniform vec3 diffuse;
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
}`,re={alphahash_fragment:Dp,alphahash_pars_fragment:Up,alphamap_fragment:Np,alphamap_pars_fragment:Fp,alphatest_fragment:Bp,alphatest_pars_fragment:Op,aomap_fragment:zp,aomap_pars_fragment:Hp,batching_pars_vertex:Gp,batching_vertex:kp,begin_vertex:Vp,beginnormal_vertex:Wp,bsdfs:Xp,iridescence_fragment:qp,bumpmap_pars_fragment:Yp,clipping_planes_fragment:Zp,clipping_planes_pars_fragment:$p,clipping_planes_pars_vertex:Jp,clipping_planes_vertex:Kp,color_fragment:Qp,color_pars_fragment:jp,color_pars_vertex:tm,color_vertex:em,common:nm,cube_uv_reflection_fragment:im,defaultnormal_vertex:sm,displacementmap_pars_vertex:rm,displacementmap_vertex:om,emissivemap_fragment:am,emissivemap_pars_fragment:cm,colorspace_fragment:lm,colorspace_pars_fragment:hm,envmap_fragment:um,envmap_common_pars_fragment:dm,envmap_pars_fragment:fm,envmap_pars_vertex:pm,envmap_physical_pars_fragment:wm,envmap_vertex:mm,fog_vertex:gm,fog_pars_vertex:xm,fog_fragment:_m,fog_pars_fragment:ym,gradientmap_pars_fragment:vm,lightmap_pars_fragment:Mm,lights_lambert_fragment:Sm,lights_lambert_pars_fragment:bm,lights_pars_begin:Em,lights_toon_fragment:Tm,lights_toon_pars_fragment:Am,lights_phong_fragment:Rm,lights_phong_pars_fragment:Cm,lights_physical_fragment:Im,lights_physical_pars_fragment:Pm,lights_fragment_begin:Lm,lights_fragment_maps:Dm,lights_fragment_end:Um,lightprobes_pars_fragment:Nm,logdepthbuf_fragment:Fm,logdepthbuf_pars_fragment:Bm,logdepthbuf_pars_vertex:Om,logdepthbuf_vertex:zm,map_fragment:Hm,map_pars_fragment:Gm,map_particle_fragment:km,map_particle_pars_fragment:Vm,metalnessmap_fragment:Wm,metalnessmap_pars_fragment:Xm,morphinstance_vertex:qm,morphcolor_vertex:Ym,morphnormal_vertex:Zm,morphtarget_pars_vertex:$m,morphtarget_vertex:Jm,normal_fragment_begin:Km,normal_fragment_maps:Qm,normal_pars_fragment:jm,normal_pars_vertex:t0,normal_vertex:e0,normalmap_pars_fragment:n0,clearcoat_normal_fragment_begin:i0,clearcoat_normal_fragment_maps:s0,clearcoat_pars_fragment:r0,iridescence_pars_fragment:o0,opaque_fragment:a0,packing:c0,premultiplied_alpha_fragment:l0,project_vertex:h0,dithering_fragment:u0,dithering_pars_fragment:d0,roughnessmap_fragment:f0,roughnessmap_pars_fragment:p0,shadowmap_pars_fragment:m0,shadowmap_pars_vertex:g0,shadowmap_vertex:x0,shadowmask_pars_fragment:_0,skinbase_vertex:y0,skinning_pars_vertex:v0,skinning_vertex:M0,skinnormal_vertex:S0,specularmap_fragment:b0,specularmap_pars_fragment:E0,tonemapping_fragment:w0,tonemapping_pars_fragment:T0,transmission_fragment:A0,transmission_pars_fragment:R0,uv_pars_fragment:C0,uv_pars_vertex:I0,uv_vertex:P0,worldpos_vertex:L0,background_vert:D0,background_frag:U0,backgroundCube_vert:N0,backgroundCube_frag:F0,cube_vert:B0,cube_frag:O0,depth_vert:z0,depth_frag:H0,distance_vert:G0,distance_frag:k0,equirect_vert:V0,equirect_frag:W0,linedashed_vert:X0,linedashed_frag:q0,meshbasic_vert:Y0,meshbasic_frag:Z0,meshlambert_vert:$0,meshlambert_frag:J0,meshmatcap_vert:K0,meshmatcap_frag:Q0,meshnormal_vert:j0,meshnormal_frag:tg,meshphong_vert:eg,meshphong_frag:ng,meshphysical_vert:ig,meshphysical_frag:sg,meshtoon_vert:rg,meshtoon_frag:og,points_vert:ag,points_frag:cg,shadow_vert:lg,shadow_frag:hg,sprite_vert:ug,sprite_frag:dg},bt={common:{diffuse:{value:new Vt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Qt},alphaMap:{value:null},alphaMapTransform:{value:new Qt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Qt}},envmap:{envMap:{value:null},envMapRotation:{value:new Qt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Qt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Qt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Qt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Qt},normalScale:{value:new pt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Qt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Qt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Qt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Qt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Vt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new L},probesMax:{value:new L},probesResolution:{value:new L}},points:{diffuse:{value:new Vt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Qt},alphaTest:{value:0},uvTransform:{value:new Qt}},sprite:{diffuse:{value:new Vt(16777215)},opacity:{value:1},center:{value:new pt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Qt},alphaMap:{value:null},alphaMapTransform:{value:new Qt},alphaTest:{value:0}}},ii={basic:{uniforms:on([bt.common,bt.specularmap,bt.envmap,bt.aomap,bt.lightmap,bt.fog]),vertexShader:re.meshbasic_vert,fragmentShader:re.meshbasic_frag},lambert:{uniforms:on([bt.common,bt.specularmap,bt.envmap,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.fog,bt.lights,{emissive:{value:new Vt(0)},envMapIntensity:{value:1}}]),vertexShader:re.meshlambert_vert,fragmentShader:re.meshlambert_frag},phong:{uniforms:on([bt.common,bt.specularmap,bt.envmap,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.fog,bt.lights,{emissive:{value:new Vt(0)},specular:{value:new Vt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:re.meshphong_vert,fragmentShader:re.meshphong_frag},standard:{uniforms:on([bt.common,bt.envmap,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.roughnessmap,bt.metalnessmap,bt.fog,bt.lights,{emissive:{value:new Vt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:re.meshphysical_vert,fragmentShader:re.meshphysical_frag},toon:{uniforms:on([bt.common,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.gradientmap,bt.fog,bt.lights,{emissive:{value:new Vt(0)}}]),vertexShader:re.meshtoon_vert,fragmentShader:re.meshtoon_frag},matcap:{uniforms:on([bt.common,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.fog,{matcap:{value:null}}]),vertexShader:re.meshmatcap_vert,fragmentShader:re.meshmatcap_frag},points:{uniforms:on([bt.points,bt.fog]),vertexShader:re.points_vert,fragmentShader:re.points_frag},dashed:{uniforms:on([bt.common,bt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:re.linedashed_vert,fragmentShader:re.linedashed_frag},depth:{uniforms:on([bt.common,bt.displacementmap]),vertexShader:re.depth_vert,fragmentShader:re.depth_frag},normal:{uniforms:on([bt.common,bt.bumpmap,bt.normalmap,bt.displacementmap,{opacity:{value:1}}]),vertexShader:re.meshnormal_vert,fragmentShader:re.meshnormal_frag},sprite:{uniforms:on([bt.sprite,bt.fog]),vertexShader:re.sprite_vert,fragmentShader:re.sprite_frag},background:{uniforms:{uvTransform:{value:new Qt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:re.background_vert,fragmentShader:re.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Qt}},vertexShader:re.backgroundCube_vert,fragmentShader:re.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:re.cube_vert,fragmentShader:re.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:re.equirect_vert,fragmentShader:re.equirect_frag},distance:{uniforms:on([bt.common,bt.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:re.distance_vert,fragmentShader:re.distance_frag},shadow:{uniforms:on([bt.lights,bt.fog,{color:{value:new Vt(0)},opacity:{value:1}}]),vertexShader:re.shadow_vert,fragmentShader:re.shadow_frag}};ii.physical={uniforms:on([ii.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Qt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Qt},clearcoatNormalScale:{value:new pt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Qt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Qt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Qt},sheen:{value:0},sheenColor:{value:new Vt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Qt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Qt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Qt},transmissionSamplerSize:{value:new pt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Qt},attenuationDistance:{value:0},attenuationColor:{value:new Vt(0)},specularColor:{value:new Vt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Qt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Qt},anisotropyVector:{value:new pt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Qt}}]),vertexShader:re.meshphysical_vert,fragmentShader:re.meshphysical_frag};var cc={r:0,b:0,g:0},fg=new ee,Md=new Qt;Md.set(-1,0,0,0,1,0,0,0,1);function pg(i,t,e,n,s,r){let o=new Vt(0),a=s===!0?0:1,c,l,h=null,d=0,u=null;function f(M){let E=M.isScene===!0?M.background:null;if(E&&E.isTexture){let _=M.backgroundBlurriness>0;E=t.get(E,_)}return E}function g(M){let E=!1,_=f(M);_===null?p(o,a):_&&_.isColor&&(p(_,1),E=!0);let A=i.xr.getEnvironmentBlendMode();A==="additive"?e.buffers.color.setClear(0,0,0,1,r):A==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||E)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function y(M,E){let _=f(E);_&&(_.isCubeTexture||_.mapping===zr)?(l===void 0&&(l=new ft(new ht(1,1,1),new ln({name:"BackgroundCubeMaterial",uniforms:es(ii.backgroundCube.uniforms),vertexShader:ii.backgroundCube.vertexShader,fragmentShader:ii.backgroundCube.fragmentShader,side:Ke,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(A,S,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(l)),l.material.uniforms.envMap.value=_,l.material.uniforms.backgroundBlurriness.value=E.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(fg.makeRotationFromEuler(E.backgroundRotation)).transpose(),_.isCubeTexture&&_.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Md),l.material.toneMapped=he.getTransfer(_.colorSpace)!==de,(h!==_||d!==_.version||u!==i.toneMapping)&&(l.material.needsUpdate=!0,h=_,d=_.version,u=i.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null)):_&&_.isTexture&&(c===void 0&&(c=new ft(new Ee(2,2),new ln({name:"BackgroundMaterial",uniforms:es(ii.background.uniforms),vertexShader:ii.background.vertexShader,fragmentShader:ii.background.fragmentShader,side:fi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=_,c.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,c.material.toneMapped=he.getTransfer(_.colorSpace)!==de,_.matrixAutoUpdate===!0&&_.updateMatrix(),c.material.uniforms.uvTransform.value.copy(_.matrix),(h!==_||d!==_.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,h=_,d=_.version,u=i.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null))}function p(M,E){M.getRGB(cc,Hl(i)),e.buffers.color.setClear(cc.r,cc.g,cc.b,E,r)}function m(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(M,E=1){o.set(M),a=E,p(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(M){a=M,p(o,a)},render:g,addToRenderList:y,dispose:m}}function mg(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null),r=s,o=!1;function a(I,P,U,O,D){let k=!1,F=d(I,O,U,P);r!==F&&(r=F,l(r.object)),k=f(I,O,U,D),k&&g(I,O,U,D),D!==null&&t.update(D,i.ELEMENT_ARRAY_BUFFER),(k||o)&&(o=!1,_(I,P,U,O),D!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(D).buffer))}function c(){return i.createVertexArray()}function l(I){return i.bindVertexArray(I)}function h(I){return i.deleteVertexArray(I)}function d(I,P,U,O){let D=O.wireframe===!0,k=n[P.id];k===void 0&&(k={},n[P.id]=k);let F=I.isInstancedMesh===!0?I.id:0,H=k[F];H===void 0&&(H={},k[F]=H);let Y=H[U.id];Y===void 0&&(Y={},H[U.id]=Y);let J=Y[D];return J===void 0&&(J=u(c()),Y[D]=J),J}function u(I){let P=[],U=[],O=[];for(let D=0;D<e;D++)P[D]=0,U[D]=0,O[D]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:U,attributeDivisors:O,object:I,attributes:{},index:null}}function f(I,P,U,O){let D=r.attributes,k=P.attributes,F=0,H=U.getAttributes();for(let Y in H)if(H[Y].location>=0){let $=D[Y],st=k[Y];if(st===void 0&&(Y==="instanceMatrix"&&I.instanceMatrix&&(st=I.instanceMatrix),Y==="instanceColor"&&I.instanceColor&&(st=I.instanceColor)),$===void 0||$.attribute!==st||st&&$.data!==st.data)return!0;F++}return r.attributesNum!==F||r.index!==O}function g(I,P,U,O){let D={},k=P.attributes,F=0,H=U.getAttributes();for(let Y in H)if(H[Y].location>=0){let $=k[Y];$===void 0&&(Y==="instanceMatrix"&&I.instanceMatrix&&($=I.instanceMatrix),Y==="instanceColor"&&I.instanceColor&&($=I.instanceColor));let st={};st.attribute=$,$&&$.data&&(st.data=$.data),D[Y]=st,F++}r.attributes=D,r.attributesNum=F,r.index=O}function y(){let I=r.newAttributes;for(let P=0,U=I.length;P<U;P++)I[P]=0}function p(I){m(I,0)}function m(I,P){let U=r.newAttributes,O=r.enabledAttributes,D=r.attributeDivisors;U[I]=1,O[I]===0&&(i.enableVertexAttribArray(I),O[I]=1),D[I]!==P&&(i.vertexAttribDivisor(I,P),D[I]=P)}function M(){let I=r.newAttributes,P=r.enabledAttributes;for(let U=0,O=P.length;U<O;U++)P[U]!==I[U]&&(i.disableVertexAttribArray(U),P[U]=0)}function E(I,P,U,O,D,k,F){F===!0?i.vertexAttribIPointer(I,P,U,D,k):i.vertexAttribPointer(I,P,U,O,D,k)}function _(I,P,U,O){y();let D=O.attributes,k=U.getAttributes(),F=P.defaultAttributeValues;for(let H in k){let Y=k[H];if(Y.location>=0){let J=D[H];if(J===void 0&&(H==="instanceMatrix"&&I.instanceMatrix&&(J=I.instanceMatrix),H==="instanceColor"&&I.instanceColor&&(J=I.instanceColor)),J!==void 0){let $=J.normalized,st=J.itemSize,rt=t.get(J);if(rt===void 0)continue;let Tt=rt.buffer,vt=rt.type,q=rt.bytesPerElement,ot=vt===i.INT||vt===i.UNSIGNED_INT||J.gpuType===ba;if(J.isInterleavedBufferAttribute){let et=J.data,ut=et.stride,Ot=J.offset;if(et.isInstancedInterleavedBuffer){for(let Nt=0;Nt<Y.locationSize;Nt++)m(Y.location+Nt,et.meshPerAttribute);I.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=et.meshPerAttribute*et.count)}else for(let Nt=0;Nt<Y.locationSize;Nt++)p(Y.location+Nt);i.bindBuffer(i.ARRAY_BUFFER,Tt);for(let Nt=0;Nt<Y.locationSize;Nt++)E(Y.location+Nt,st/Y.locationSize,vt,$,ut*q,(Ot+st/Y.locationSize*Nt)*q,ot)}else{if(J.isInstancedBufferAttribute){for(let et=0;et<Y.locationSize;et++)m(Y.location+et,J.meshPerAttribute);I.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=J.meshPerAttribute*J.count)}else for(let et=0;et<Y.locationSize;et++)p(Y.location+et);i.bindBuffer(i.ARRAY_BUFFER,Tt);for(let et=0;et<Y.locationSize;et++)E(Y.location+et,st/Y.locationSize,vt,$,st*q,st/Y.locationSize*et*q,ot)}}else if(F!==void 0){let $=F[H];if($!==void 0)switch($.length){case 2:i.vertexAttrib2fv(Y.location,$);break;case 3:i.vertexAttrib3fv(Y.location,$);break;case 4:i.vertexAttrib4fv(Y.location,$);break;default:i.vertexAttrib1fv(Y.location,$)}}}}M()}function A(){b();for(let I in n){let P=n[I];for(let U in P){let O=P[U];for(let D in O){let k=O[D];for(let F in k)h(k[F].object),delete k[F];delete O[D]}}delete n[I]}}function S(I){if(n[I.id]===void 0)return;let P=n[I.id];for(let U in P){let O=P[U];for(let D in O){let k=O[D];for(let F in k)h(k[F].object),delete k[F];delete O[D]}}delete n[I.id]}function w(I){for(let P in n){let U=n[P];for(let O in U){let D=U[O];if(D[I.id]===void 0)continue;let k=D[I.id];for(let F in k)h(k[F].object),delete k[F];delete D[I.id]}}}function x(I){for(let P in n){let U=n[P],O=I.isInstancedMesh===!0?I.id:0,D=U[O];if(D!==void 0){for(let k in D){let F=D[k];for(let H in F)h(F[H].object),delete F[H];delete D[k]}delete U[O],Object.keys(U).length===0&&delete n[P]}}}function b(){R(),o=!0,r!==s&&(r=s,l(r.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:b,resetDefaultState:R,dispose:A,releaseStatesOfGeometry:S,releaseStatesOfObject:x,releaseStatesOfProgram:w,initAttributes:y,enableAttribute:p,disableUnusedAttributes:M}}function gg(i,t,e){let n;function s(c){n=c}function r(c,l){i.drawArrays(n,c,l),e.update(l,n,1)}function o(c,l,h){h!==0&&(i.drawArraysInstanced(n,c,l,h),e.update(l,n,h))}function a(c,l,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,l,0,h);let u=0;for(let f=0;f<h;f++)u+=l[f];e.update(u,n,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function xg(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let w=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(w){return!(w!==Pn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(w){let x=w===ei&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(w!==pn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==In&&!x)}function c(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=e.precision!==void 0?e.precision:"highp",h=c(l);h!==l&&($t("WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);let d=e.logarithmicDepthBuffer===!0,u=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&u===!1&&$t("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=i.getParameter(i.MAX_TEXTURE_SIZE),p=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),E=i.getParameter(i.MAX_VARYING_VECTORS),_=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),A=i.getParameter(i.MAX_SAMPLES),S=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:g,maxTextureSize:y,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:M,maxVaryings:E,maxFragmentUniforms:_,maxSamples:A,samples:S}}function _g(i){let t=this,e=null,n=0,s=!1,r=!1,o=new Zn,a=new Qt,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){let f=d.length!==0||u||n!==0||s;return s=u,n=d.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,u){e=h(d,u,0)},this.setState=function(d,u,f){let g=d.clippingPlanes,y=d.clipIntersection,p=d.clipShadows,m=i.get(d);if(!s||g===null||g.length===0||r&&!p)r?h(null):l();else{let M=r?0:n,E=M*4,_=m.clippingState||null;c.value=_,_=h(g,u,E,f);for(let A=0;A!==E;++A)_[A]=e[A];m.clippingState=_,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=M}};function l(){c.value!==e&&(c.value=e,c.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(d,u,f,g){let y=d!==null?d.length:0,p=null;if(y!==0){if(p=c.value,g!==!0||p===null){let m=f+y*4,M=u.matrixWorldInverse;a.getNormalMatrix(M),(p===null||p.length<m)&&(p=new Float32Array(m));for(let E=0,_=f;E!==y;++E,_+=4)o.copy(d[E]).applyMatrix4(M,a),o.normal.toArray(p,_),p[_+3]=o.constant}c.value=p,c.needsUpdate=!0}return t.numPlanes=y,t.numIntersection=0,p}}var Hi=4,Qu=[.125,.215,.35,.446,.526,.582],ns=20,yg=256,Zr=new Fi,ju=new Vt,Wl=null,Xl=0,ql=0,Yl=!1,vg=new L,hc=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){let{size:o=256,position:a=vg}=r;Wl=this._renderer.getRenderTarget(),Xl=this._renderer.getActiveCubeFace(),ql=this._renderer.getActiveMipmapLevel(),Yl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(t,n,s,c,a),e>0&&this._blur(c,0,0,e),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=nd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ed(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(Wl,Xl,ql),this._renderer.xr.enabled=Yl,t.scissorTest=!1,Gs(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Bi||t.mapping===ts?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Wl=this._renderer.getRenderTarget(),Xl=this._renderer.getActiveCubeFace(),ql=this._renderer.getActiveMipmapLevel(),Yl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Je,minFilter:Je,generateMipmaps:!1,type:ei,format:Pn,colorSpace:ar,depthBuffer:!1},s=td(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=td(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=Mg(r)),this._blurMaterial=bg(r,t,e),this._ggxMaterial=Sg(r,t,e)}return s}_compileMaterial(t){let e=new ft(new Be,t);this._renderer.compile(e,Zr)}_sceneToCubeUV(t,e,n,s,r){let c=new sn(90,1,e,n),l=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,f=d.toneMapping;d.getClearColor(ju),d.toneMapping=Hn,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new ft(new ht,new Cn({name:"PMREM.Background",side:Ke,depthWrite:!1,depthTest:!1})));let y=this._backgroundBox,p=y.material,m=!1,M=t.background;M?M.isColor&&(p.color.copy(M),t.background=null,m=!0):(p.color.copy(ju),m=!0);for(let E=0;E<6;E++){let _=E%3;_===0?(c.up.set(0,l[E],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+h[E],r.y,r.z)):_===1?(c.up.set(0,0,l[E]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+h[E],r.z)):(c.up.set(0,l[E],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+h[E]));let A=this._cubeSize;Gs(s,_*A,E>2?A:0,A,A),d.setRenderTarget(s),m&&d.render(y,c),d.render(t,c)}d.toneMapping=f,d.autoClear=u,t.background=M}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===Bi||t.mapping===ts;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=nd()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ed());let r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=t;let c=this._cubeSize;Gs(e,0,0,3*c,2*c),n.setRenderTarget(e),n.render(o,Zr)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;let c=o.uniforms,l=n/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),d=Math.sqrt(l*l-h*h),u=0+l*1.25,f=d*u,{_lodMax:g}=this,y=this._sizeLods[n],p=3*y*(n>g-Hi?n-g+Hi:0),m=4*(this._cubeSize-y);c.envMap.value=t.texture,c.roughness.value=f,c.mipInt.value=g-e,Gs(r,p,m,3*y,2*y),s.setRenderTarget(r),s.render(a,Zr),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=g-n,Gs(t,p,m,3*y,2*y),s.setRenderTarget(t),s.render(a,Zr)}_blur(t,e,n,s,r){let o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,s,"latitudinal",r),this._halfBlur(o,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,o,a){let c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&Zt("blur direction must be either latitudinal or longitudinal!");let h=3,d=this._lodMeshes[s];d.material=l;let u=l.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*ns-1),y=r/g,p=isFinite(r)?1+Math.floor(h*y):ns;p>ns&&$t(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${ns}`);let m=[],M=0;for(let w=0;w<ns;++w){let x=w/y,b=Math.exp(-x*x/2);m.push(b),w===0?M+=b:w<p&&(M+=2*b)}for(let w=0;w<m.length;w++)m[w]=m[w]/M;u.envMap.value=t.texture,u.samples.value=p,u.weights.value=m,u.latitudinal.value=o==="latitudinal",a&&(u.poleAxis.value=a);let{_lodMax:E}=this;u.dTheta.value=g,u.mipInt.value=E-n;let _=this._sizeLods[s],A=3*_*(s>E-Hi?s-E+Hi:0),S=4*(this._cubeSize-_);Gs(e,A,S,3*_,2*_),c.setRenderTarget(e),c.render(d,Zr)}};function Mg(i){let t=[],e=[],n=[],s=i,r=i-Hi+1+Qu.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);t.push(a);let c=1/a;o>i-Hi?c=Qu[o-i+Hi-1]:o===0&&(c=0),e.push(c);let l=1/(a-2),h=-l,d=1+l,u=[h,h,d,h,d,d,h,h,d,d,h,d],f=6,g=6,y=3,p=2,m=1,M=new Float32Array(y*g*f),E=new Float32Array(p*g*f),_=new Float32Array(m*g*f);for(let S=0;S<f;S++){let w=S%3*2/3-1,x=S>2?0:-1,b=[w,x,0,w+2/3,x,0,w+2/3,x+1,0,w,x,0,w+2/3,x+1,0,w,x+1,0];M.set(b,y*g*S),E.set(u,p*g*S);let R=[S,S,S,S,S,S];_.set(R,m*g*S)}let A=new Be;A.setAttribute("position",new fn(M,y)),A.setAttribute("uv",new fn(E,p)),A.setAttribute("faceIndex",new fn(_,m)),n.push(new ft(A,null)),s>Hi&&s--}return{lodMeshes:n,sizeLods:t,sigmas:e}}function td(i,t,e){let n=new yn(i,t,e);return n.texture.mapping=zr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Gs(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Sg(i,t,e){return new ln({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:yg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:dc(),fragmentShader:`

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
		`,blending:jn,depthTest:!1,depthWrite:!1})}function bg(i,t,e){let n=new Float32Array(ns),s=new L(0,1,0);return new ln({name:"SphericalGaussianBlur",defines:{n:ns,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:dc(),fragmentShader:`

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
		`,blending:jn,depthTest:!1,depthWrite:!1})}function ed(){return new ln({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:dc(),fragmentShader:`

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
		`,blending:jn,depthTest:!1,depthWrite:!1})}function nd(){return new ln({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:dc(),fragmentShader:`

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
			`},s=new ht(5,5,5),r=new ln({name:"CubemapFromEquirect",uniforms:es(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ke,blending:jn});r.uniforms.tEquirect.value=e;let o=new ft(s,r),a=e.minFilter;return e.minFilter===ti&&(e.minFilter=Je),new Fs(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}};function Eg(i){let t=new WeakMap,e=new WeakMap,n=null;function s(u,f=!1){return u==null?null:f?o(u):r(u)}function r(u){if(u&&u.isTexture){let f=u.mapping;if(f===va||f===Ma)if(t.has(u)){let g=t.get(u).texture;return a(g,u.mapping)}else{let g=u.image;if(g&&g.height>0){let y=new Vs(g.height);return y.fromEquirectangularTexture(i,u),t.set(u,y),u.addEventListener("dispose",l),a(y.texture,u.mapping)}else return null}}return u}function o(u){if(u&&u.isTexture){let f=u.mapping,g=f===va||f===Ma,y=f===Bi||f===ts;if(g||y){let p=e.get(u),m=p!==void 0?p.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==m)return n===null&&(n=new hc(i)),p=g?n.fromEquirectangular(u,p):n.fromCubemap(u,p),p.texture.pmremVersion=u.pmremVersion,e.set(u,p),p.texture;if(p!==void 0)return p.texture;{let M=u.image;return g&&M&&M.height>0||y&&M&&c(M)?(n===null&&(n=new hc(i)),p=g?n.fromEquirectangular(u):n.fromCubemap(u),p.texture.pmremVersion=u.pmremVersion,e.set(u,p),u.addEventListener("dispose",h),p.texture):null}}}return u}function a(u,f){return f===va?u.mapping=Bi:f===Ma&&(u.mapping=ts),u}function c(u){let f=0,g=6;for(let y=0;y<g;y++)u[y]!==void 0&&f++;return f===g}function l(u){let f=u.target;f.removeEventListener("dispose",l);let g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function h(u){let f=u.target;f.removeEventListener("dispose",h);let g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function d(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:d}}function wg(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&Ji("WebGLRenderer: "+n+" extension not supported."),s}}}function Tg(i,t,e,n){let s={},r=new WeakMap;function o(d){let u=d.target;u.index!==null&&t.remove(u.index);for(let g in u.attributes)t.remove(u.attributes[g]);u.removeEventListener("dispose",o),delete s[u.id];let f=r.get(u);f&&(t.remove(f),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function a(d,u){return s[u.id]===!0||(u.addEventListener("dispose",o),s[u.id]=!0,e.memory.geometries++),u}function c(d){let u=d.attributes;for(let f in u)t.update(u[f],i.ARRAY_BUFFER)}function l(d){let u=[],f=d.index,g=d.attributes.position,y=0;if(g===void 0)return;if(f!==null){let M=f.array;y=f.version;for(let E=0,_=M.length;E<_;E+=3){let A=M[E+0],S=M[E+1],w=M[E+2];u.push(A,S,S,w,w,A)}}else{let M=g.array;y=g.version;for(let E=0,_=M.length/3-1;E<_;E+=3){let A=E+0,S=E+1,w=E+2;u.push(A,S,S,w,w,A)}}let p=new(g.count>=65535?pr:fr)(u,1);p.version=y;let m=r.get(d);m&&t.remove(m),r.set(d,p)}function h(d){let u=r.get(d);if(u){let f=d.index;f!==null&&u.version<f.version&&l(d)}else l(d);return r.get(d)}return{get:a,update:c,getWireframeAttribute:h}}function Ag(i,t,e){let n;function s(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function c(d,u){i.drawElements(n,u,r,d*o),e.update(u,n,1)}function l(d,u,f){f!==0&&(i.drawElementsInstanced(n,u,r,d*o,f),e.update(u,n,f))}function h(d,u,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,r,d,0,f);let y=0;for(let p=0;p<f;p++)y+=u[p];e.update(y,n,1)}this.setMode=s,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=h}function Rg(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:Zt("WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Cg(i,t,e){let n=new WeakMap,s=new we;function r(o,a,c){let l=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=h!==void 0?h.length:0,u=n.get(a);if(u===void 0||u.count!==d){let b=function(){w.dispose(),n.delete(a),a.removeEventListener("dispose",b)};u!==void 0&&u.texture.dispose();let f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,y=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],M=a.morphAttributes.color||[],E=0;f===!0&&(E=1),g===!0&&(E=2),y===!0&&(E=3);let _=a.attributes.position.count*E,A=1;_>t.maxTextureSize&&(A=Math.ceil(_/t.maxTextureSize),_=t.maxTextureSize);let S=new Float32Array(_*A*4*d),w=new hr(S,_,A,d);w.type=In,w.needsUpdate=!0;let x=E*4;for(let R=0;R<d;R++){let I=p[R],P=m[R],U=M[R],O=_*A*4*R;for(let D=0;D<I.count;D++){let k=D*x;f===!0&&(s.fromBufferAttribute(I,D),S[O+k+0]=s.x,S[O+k+1]=s.y,S[O+k+2]=s.z,S[O+k+3]=0),g===!0&&(s.fromBufferAttribute(P,D),S[O+k+4]=s.x,S[O+k+5]=s.y,S[O+k+6]=s.z,S[O+k+7]=0),y===!0&&(s.fromBufferAttribute(U,D),S[O+k+8]=s.x,S[O+k+9]=s.y,S[O+k+10]=s.z,S[O+k+11]=U.itemSize===4?s.w:1)}}u={count:d,texture:w,size:new pt(_,A)},n.set(a,u),a.addEventListener("dispose",b)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let f=0;for(let y=0;y<l.length;y++)f+=l[y];let g=a.morphTargetsRelative?1:1-f;c.getUniforms().setValue(i,"morphTargetBaseInfluence",g),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",u.texture,e),c.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:r}}function Ig(i,t,e,n,s){let r=new WeakMap;function o(l){let h=s.render.frame,d=l.geometry,u=t.get(l,d);if(r.get(u)!==h&&(t.update(u),r.set(u,h)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==h&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,h))),l.isSkinnedMesh){let f=l.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return u}function a(){r=new WeakMap}function c(l){let h=l.target;h.removeEventListener("dispose",c),n.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:o,dispose:a}}var Pg={[El]:"LINEAR_TONE_MAPPING",[wl]:"REINHARD_TONE_MAPPING",[Tl]:"CINEON_TONE_MAPPING",[Or]:"ACES_FILMIC_TONE_MAPPING",[Rl]:"AGX_TONE_MAPPING",[Cl]:"NEUTRAL_TONE_MAPPING",[Al]:"CUSTOM_TONE_MAPPING"};function Lg(i,t,e,n,s,r){let o=new yn(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,depthTexture:s?new mi(t,e):void 0}),a=new yn(t,e,{type:ei,depthBuffer:!1,stencilBuffer:!1}),c=new Be;c.setAttribute("position",new se([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new se([0,2,0,0,2,0],2));let l=new sa({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),h=new ft(c,l),d=new Fi(-1,1,1,-1,0,1),u=null,f=null,g=!1,y,p=null,m=[],M=!1;this.setSize=function(E,_){o.setSize(E,_),a.setSize(E,_);for(let A=0;A<m.length;A++){let S=m[A];S.setSize&&S.setSize(E,_)}},this.setEffects=function(E){m=E,M=m.length>0&&m[0].isRenderPass===!0;let _=o.width,A=o.height;for(let S=0;S<m.length;S++){let w=m[S];w.setSize&&w.setSize(_,A)}},this.begin=function(E,_){if(g||E.toneMapping===Hn&&m.length===0)return!1;if(p=_,_!==null){let A=_.width,S=_.height;(o.width!==A||o.height!==S)&&this.setSize(A,S)}return M===!1&&E.setRenderTarget(o),y=E.toneMapping,E.toneMapping=Hn,!0},this.hasRenderPass=function(){return M},this.end=function(E,_){E.toneMapping=y,g=!0;let A=o,S=a;for(let w=0;w<m.length;w++){let x=m[w];if(x.enabled!==!1&&(x.render(E,S,A,_),x.needsSwap!==!1)){let b=A;A=S,S=b}}if(u!==E.outputColorSpace||f!==E.toneMapping){u=E.outputColorSpace,f=E.toneMapping,l.defines={},he.getTransfer(u)===de&&(l.defines.SRGB_TRANSFER="");let w=Pg[f];w&&(l.defines[w]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=A.texture,E.setRenderTarget(p),E.render(h,d),p=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){o.depthTexture&&o.depthTexture.dispose(),o.dispose(),a.dispose(),c.dispose(),l.dispose()}}var Sd=new cn,Jl=new mi(1,1),bd=new hr,Ed=new $o,wd=new _r,id=[],sd=[],rd=new Float32Array(16),od=new Float32Array(9),ad=new Float32Array(4);function Ws(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=id[s];if(r===void 0&&(r=new Float32Array(s),id[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function ke(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Ve(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function fc(i,t){let e=sd[t];e===void 0&&(e=new Int32Array(t),sd[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Dg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Ug(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ke(e,t))return;i.uniform2fv(this.addr,t),Ve(e,t)}}function Ng(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(ke(e,t))return;i.uniform3fv(this.addr,t),Ve(e,t)}}function Fg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ke(e,t))return;i.uniform4fv(this.addr,t),Ve(e,t)}}function Bg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(ke(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Ve(e,t)}else{if(ke(e,n))return;ad.set(n),i.uniformMatrix2fv(this.addr,!1,ad),Ve(e,n)}}function Og(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(ke(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Ve(e,t)}else{if(ke(e,n))return;od.set(n),i.uniformMatrix3fv(this.addr,!1,od),Ve(e,n)}}function zg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(ke(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Ve(e,t)}else{if(ke(e,n))return;rd.set(n),i.uniformMatrix4fv(this.addr,!1,rd),Ve(e,n)}}function Hg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Gg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ke(e,t))return;i.uniform2iv(this.addr,t),Ve(e,t)}}function kg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ke(e,t))return;i.uniform3iv(this.addr,t),Ve(e,t)}}function Vg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ke(e,t))return;i.uniform4iv(this.addr,t),Ve(e,t)}}function Wg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function Xg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ke(e,t))return;i.uniform2uiv(this.addr,t),Ve(e,t)}}function qg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ke(e,t))return;i.uniform3uiv(this.addr,t),Ve(e,t)}}function Yg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ke(e,t))return;i.uniform4uiv(this.addr,t),Ve(e,t)}}function Zg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Jl.compareFunction=e.isReversedDepthBuffer()?ac:oc,r=Jl):r=Sd,e.setTexture2D(t||r,s)}function $g(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||Ed,s)}function Jg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||wd,s)}function Kg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||bd,s)}function Qg(i){switch(i){case 5126:return Dg;case 35664:return Ug;case 35665:return Ng;case 35666:return Fg;case 35674:return Bg;case 35675:return Og;case 35676:return zg;case 5124:case 35670:return Hg;case 35667:case 35671:return Gg;case 35668:case 35672:return kg;case 35669:case 35673:return Vg;case 5125:return Wg;case 36294:return Xg;case 36295:return qg;case 36296:return Yg;case 35678:case 36198:case 36298:case 36306:case 35682:return Zg;case 35679:case 36299:case 36307:return $g;case 35680:case 36300:case 36308:case 36293:return Jg;case 36289:case 36303:case 36311:case 36292:return Kg}}function jg(i,t){i.uniform1fv(this.addr,t)}function tx(i,t){let e=Ws(t,this.size,2);i.uniform2fv(this.addr,e)}function ex(i,t){let e=Ws(t,this.size,3);i.uniform3fv(this.addr,e)}function nx(i,t){let e=Ws(t,this.size,4);i.uniform4fv(this.addr,e)}function ix(i,t){let e=Ws(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function sx(i,t){let e=Ws(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function rx(i,t){let e=Ws(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function ox(i,t){i.uniform1iv(this.addr,t)}function ax(i,t){i.uniform2iv(this.addr,t)}function cx(i,t){i.uniform3iv(this.addr,t)}function lx(i,t){i.uniform4iv(this.addr,t)}function hx(i,t){i.uniform1uiv(this.addr,t)}function ux(i,t){i.uniform2uiv(this.addr,t)}function dx(i,t){i.uniform3uiv(this.addr,t)}function fx(i,t){i.uniform4uiv(this.addr,t)}function px(i,t,e){let n=this.cache,s=t.length,r=fc(e,s);ke(n,r)||(i.uniform1iv(this.addr,r),Ve(n,r));let o;this.type===i.SAMPLER_2D_SHADOW?o=Jl:o=Sd;for(let a=0;a!==s;++a)e.setTexture2D(t[a]||o,r[a])}function mx(i,t,e){let n=this.cache,s=t.length,r=fc(e,s);ke(n,r)||(i.uniform1iv(this.addr,r),Ve(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||Ed,r[o])}function gx(i,t,e){let n=this.cache,s=t.length,r=fc(e,s);ke(n,r)||(i.uniform1iv(this.addr,r),Ve(n,r));for(let o=0;o!==s;++o)e.setTextureCube(t[o]||wd,r[o])}function xx(i,t,e){let n=this.cache,s=t.length,r=fc(e,s);ke(n,r)||(i.uniform1iv(this.addr,r),Ve(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||bd,r[o])}function _x(i){switch(i){case 5126:return jg;case 35664:return tx;case 35665:return ex;case 35666:return nx;case 35674:return ix;case 35675:return sx;case 35676:return rx;case 5124:case 35670:return ox;case 35667:case 35671:return ax;case 35668:case 35672:return cx;case 35669:case 35673:return lx;case 5125:return hx;case 36294:return ux;case 36295:return dx;case 36296:return fx;case 35678:case 36198:case 36298:case 36306:case 35682:return px;case 35679:case 36299:case 36307:return mx;case 35680:case 36300:case 36308:case 36293:return gx;case 36289:case 36303:case 36311:case 36292:return xx}}var Kl=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Qg(e.type)}},Ql=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=_x(e.type)}},jl=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(t,e[a.id],n)}}},Zl=/(\w+)(\])?(\[|\.)?/g;function cd(i,t){i.seq.push(t),i.map[t.id]=t}function yx(i,t,e){let n=i.name,s=n.length;for(Zl.lastIndex=0;;){let r=Zl.exec(n),o=Zl.lastIndex,a=r[1],c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===s){cd(e,l===void 0?new Kl(a,i,t):new Ql(a,i,t));break}else{let d=e.map[a];d===void 0&&(d=new jl(a),cd(e,d)),e=d}}}var ks=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=t.getActiveUniform(e,o),c=t.getUniformLocation(e,a.name);yx(a,c,this)}let s=[],r=[];for(let o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){let a=e[r],c=n[a.id];c.needsUpdate!==!1&&a.setValue(t,c.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let o=t[s];o.id in e&&n.push(o)}return n}};function ld(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var vx=37297,Mx=0;function Sx(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}var hd=new Qt;function bx(i){he._getMatrix(hd,he.workingColorSpace,i);let t=`mat3( ${hd.elements.map(e=>e.toFixed(4))} )`;switch(he.getTransfer(i)){case cr:return[t,"LinearTransferOETF"];case de:return[t,"sRGBTransferOETF"];default:return $t("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function ud(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return e.toUpperCase()+`

`+r+`

`+Sx(i.getShaderSource(t),a)}else return r}function Ex(i,t){let e=bx(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var wx={[El]:"Linear",[wl]:"Reinhard",[Tl]:"Cineon",[Or]:"ACESFilmic",[Rl]:"AgX",[Cl]:"Neutral",[Al]:"Custom"};function Tx(i,t){let e=wx[t];return e===void 0?($t("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var lc=new L;function Ax(){he.getLuminanceCoefficients(lc);let i=lc.x.toFixed(4),t=lc.y.toFixed(4),e=lc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Rx(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Jr).join(`
`)}function Cx(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Ix(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function Jr(i){return i!==""}function dd(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function fd(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Px=/^[ \t]*#include +<([\w\d./]+)>/gm;function th(i){return i.replace(Px,Dx)}var Lx=new Map;function Dx(i,t){let e=re[t];if(e===void 0){let n=Lx.get(t);if(n!==void 0)e=re[n],$t('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return th(e)}var Ux=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function pd(i){return i.replace(Ux,Nx)}function Nx(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function md(i){let t=`precision ${i.precision} float;
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
#define LOW_PRECISION`),t}var Fx={[Fr]:"SHADOWMAP_TYPE_PCF",[Bs]:"SHADOWMAP_TYPE_VSM"};function Bx(i){return Fx[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Ox={[Bi]:"ENVMAP_TYPE_CUBE",[ts]:"ENVMAP_TYPE_CUBE",[zr]:"ENVMAP_TYPE_CUBE_UV"};function zx(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":Ox[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var Hx={[ts]:"ENVMAP_MODE_REFRACTION"};function Gx(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":Hx[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var kx={[ya]:"ENVMAP_BLENDING_MULTIPLY",[Iu]:"ENVMAP_BLENDING_MIX",[Pu]:"ENVMAP_BLENDING_ADD"};function Vx(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":kx[i.combine]||"ENVMAP_BLENDING_NONE"}function Wx(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function Xx(i,t,e,n){let s=i.getContext(),r=e.defines,o=e.vertexShader,a=e.fragmentShader,c=Bx(e),l=zx(e),h=Gx(e),d=Vx(e),u=Wx(e),f=Rx(e),g=Cx(r),y=s.createProgram(),p,m,M=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Jr).join(`
`),p.length>0&&(p+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Jr).join(`
`),m.length>0&&(m+=`
`)):(p=[md(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Jr).join(`
`),m=[md(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.envMap?"#define "+h:"",e.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Hn?"#define TONE_MAPPING":"",e.toneMapping!==Hn?re.tonemapping_pars_fragment:"",e.toneMapping!==Hn?Tx("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",re.colorspace_pars_fragment,Ex("linearToOutputTexel",e.outputColorSpace),Ax(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Jr).join(`
`)),o=th(o),o=dd(o,e),o=fd(o,e),a=th(a),a=dd(a,e),a=fd(a,e),o=pd(o),a=pd(a),e.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,p=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,m=["#define varying in",e.glslVersion===Bl?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Bl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let E=M+p+o,_=M+m+a,A=ld(s,s.VERTEX_SHADER,E),S=ld(s,s.FRAGMENT_SHADER,_);s.attachShader(y,A),s.attachShader(y,S),e.index0AttributeName!==void 0?s.bindAttribLocation(y,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(y,0,"position"),s.linkProgram(y);function w(I){if(i.debug.checkShaderErrors){let P=s.getProgramInfoLog(y)||"",U=s.getShaderInfoLog(A)||"",O=s.getShaderInfoLog(S)||"",D=P.trim(),k=U.trim(),F=O.trim(),H=!0,Y=!0;if(s.getProgramParameter(y,s.LINK_STATUS)===!1)if(H=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,y,A,S);else{let J=ud(s,A,"vertex"),$=ud(s,S,"fragment");Zt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(y,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+D+`
`+J+`
`+$)}else D!==""?$t("WebGLProgram: Program Info Log:",D):(k===""||F==="")&&(Y=!1);Y&&(I.diagnostics={runnable:H,programLog:D,vertexShader:{log:k,prefix:p},fragmentShader:{log:F,prefix:m}})}s.deleteShader(A),s.deleteShader(S),x=new ks(s,y),b=Ix(s,y)}let x;this.getUniforms=function(){return x===void 0&&w(this),x};let b;this.getAttributes=function(){return b===void 0&&w(this),b};let R=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=s.getProgramParameter(y,vx)),R},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(y),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Mx++,this.cacheKey=t,this.usedTimes=1,this.program=y,this.vertexShader=A,this.fragmentShader=S,this}var qx=0,eh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new nh(t),e.set(t,n)),n}},nh=class{constructor(t){this.id=qx++,this.code=t,this.usedTimes=0}};function Yx(i){return i===zi||i===Xr||i===qr}function Zx(i,t,e,n,s,r){let o=new Cs,a=new eh,c=new Set,l=[],h=new Map,d=n.logarithmicDepthBuffer,u=n.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(x){return c.add(x),x===0?"uv":`uv${x}`}function y(x,b,R,I,P,U){let O=I.fog,D=P.geometry,k=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?I.environment:null,F=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,H=t.get(x.envMap||k,F),Y=H&&H.mapping===zr?H.image.height:null,J=f[x.type];x.precision!==null&&(u=n.getMaxPrecision(x.precision),u!==x.precision&&$t("WebGLProgram.getParameters:",x.precision,"not supported, using",u,"instead."));let $=D.morphAttributes.position||D.morphAttributes.normal||D.morphAttributes.color,st=$!==void 0?$.length:0,rt=0;D.morphAttributes.position!==void 0&&(rt=1),D.morphAttributes.normal!==void 0&&(rt=2),D.morphAttributes.color!==void 0&&(rt=3);let Tt,vt,q,ot;if(J){let Ft=ii[J];Tt=Ft.vertexShader,vt=Ft.fragmentShader}else{Tt=x.vertexShader,vt=x.fragmentShader;let Ft=a.getVertexShaderStage(x),Pe=a.getFragmentShaderStage(x);a.update(x,Ft,Pe),q=Ft.id,ot=Pe.id}let et=i.getRenderTarget(),ut=i.state.buffers.depth.getReversed(),Ot=P.isInstancedMesh===!0,Nt=P.isBatchedMesh===!0,oe=!!x.map,It=!!x.matcap,j=!!H,lt=!!x.aoMap,ct=!!x.lightMap,Et=!!x.bumpMap&&x.wireframe===!1,Mt=!!x.normalMap,Yt=!!x.displacementMap,Ht=!!x.emissiveMap,Kt=!!x.metalnessMap,te=!!x.roughnessMap,N=x.anisotropy>0,pe=x.clearcoat>0,ce=x.dispersion>0,C=x.iridescence>0,v=x.sheen>0,G=x.transmission>0,X=N&&!!x.anisotropyMap,K=pe&&!!x.clearcoatMap,dt=pe&&!!x.clearcoatNormalMap,mt=pe&&!!x.clearcoatRoughnessMap,Q=C&&!!x.iridescenceMap,nt=C&&!!x.iridescenceThicknessMap,xt=v&&!!x.sheenColorMap,Gt=v&&!!x.sheenRoughnessMap,St=!!x.specularMap,_t=!!x.specularColorMap,Xt=!!x.specularIntensityMap,Jt=G&&!!x.transmissionMap,ne=G&&!!x.thicknessMap,B=!!x.gradientMap,gt=!!x.alphaMap,tt=x.alphaTest>0,yt=!!x.alphaHash,Ct=!!x.extensions,at=Hn;x.toneMapped&&(et===null||et.isXRRenderTarget===!0)&&(at=i.toneMapping);let zt={shaderID:J,shaderType:x.type,shaderName:x.name,vertexShader:Tt,fragmentShader:vt,defines:x.defines,customVertexShaderID:q,customFragmentShaderID:ot,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:u,batching:Nt,batchingColor:Nt&&P._colorsTexture!==null,instancing:Ot,instancingColor:Ot&&P.instanceColor!==null,instancingMorph:Ot&&P.morphTexture!==null,outputColorSpace:et===null?i.outputColorSpace:et.isXRRenderTarget===!0?et.texture.colorSpace:he.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:oe,matcap:It,envMap:j,envMapMode:j&&H.mapping,envMapCubeUVHeight:Y,aoMap:lt,lightMap:ct,bumpMap:Et,normalMap:Mt,displacementMap:Yt,emissiveMap:Ht,normalMapObjectSpace:Mt&&x.normalMapType===Uu,normalMapTangentSpace:Mt&&x.normalMapType===Yr,packedNormalMap:Mt&&x.normalMapType===Yr&&Yx(x.normalMap.format),metalnessMap:Kt,roughnessMap:te,anisotropy:N,anisotropyMap:X,clearcoat:pe,clearcoatMap:K,clearcoatNormalMap:dt,clearcoatRoughnessMap:mt,dispersion:ce,iridescence:C,iridescenceMap:Q,iridescenceThicknessMap:nt,sheen:v,sheenColorMap:xt,sheenRoughnessMap:Gt,specularMap:St,specularColorMap:_t,specularIntensityMap:Xt,transmission:G,transmissionMap:Jt,thicknessMap:ne,gradientMap:B,opaque:x.transparent===!1&&x.blending===Ki&&x.alphaToCoverage===!1,alphaMap:gt,alphaTest:tt,alphaHash:yt,combine:x.combine,mapUv:oe&&g(x.map.channel),aoMapUv:lt&&g(x.aoMap.channel),lightMapUv:ct&&g(x.lightMap.channel),bumpMapUv:Et&&g(x.bumpMap.channel),normalMapUv:Mt&&g(x.normalMap.channel),displacementMapUv:Yt&&g(x.displacementMap.channel),emissiveMapUv:Ht&&g(x.emissiveMap.channel),metalnessMapUv:Kt&&g(x.metalnessMap.channel),roughnessMapUv:te&&g(x.roughnessMap.channel),anisotropyMapUv:X&&g(x.anisotropyMap.channel),clearcoatMapUv:K&&g(x.clearcoatMap.channel),clearcoatNormalMapUv:dt&&g(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:mt&&g(x.clearcoatRoughnessMap.channel),iridescenceMapUv:Q&&g(x.iridescenceMap.channel),iridescenceThicknessMapUv:nt&&g(x.iridescenceThicknessMap.channel),sheenColorMapUv:xt&&g(x.sheenColorMap.channel),sheenRoughnessMapUv:Gt&&g(x.sheenRoughnessMap.channel),specularMapUv:St&&g(x.specularMap.channel),specularColorMapUv:_t&&g(x.specularColorMap.channel),specularIntensityMapUv:Xt&&g(x.specularIntensityMap.channel),transmissionMapUv:Jt&&g(x.transmissionMap.channel),thicknessMapUv:ne&&g(x.thicknessMap.channel),alphaMapUv:gt&&g(x.alphaMap.channel),vertexTangents:!!D.attributes.tangent&&(Mt||N),vertexNormals:!!D.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!D.attributes.color&&D.attributes.color.itemSize===4,pointsUvs:P.isPoints===!0&&!!D.attributes.uv&&(oe||gt),fog:!!O,useFog:x.fog===!0,fogExp2:!!O&&O.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||D.attributes.normal===void 0&&Mt===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:ut,skinning:P.isSkinnedMesh===!0,hasPositionAttribute:D.attributes.position!==void 0,morphTargets:D.morphAttributes.position!==void 0,morphNormals:D.morphAttributes.normal!==void 0,morphColors:D.morphAttributes.color!==void 0,morphTargetsCount:st,morphTextureStride:rt,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numLightProbeGrids:U.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&R.length>0,shadowMapType:i.shadowMap.type,toneMapping:at,decodeVideoTexture:oe&&x.map.isVideoTexture===!0&&he.getTransfer(x.map.colorSpace)===de,decodeVideoTextureEmissive:Ht&&x.emissiveMap.isVideoTexture===!0&&he.getTransfer(x.emissiveMap.colorSpace)===de,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Ce,flipSided:x.side===Ke,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:Ct&&x.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ct&&x.extensions.multiDraw===!0||Nt)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return zt.vertexUv1s=c.has(1),zt.vertexUv2s=c.has(2),zt.vertexUv3s=c.has(3),c.clear(),zt}function p(x){let b=[];if(x.shaderID?b.push(x.shaderID):(b.push(x.customVertexShaderID),b.push(x.customFragmentShaderID)),x.defines!==void 0)for(let R in x.defines)b.push(R),b.push(x.defines[R]);return x.isRawShaderMaterial===!1&&(m(b,x),M(b,x),b.push(i.outputColorSpace)),b.push(x.customProgramCacheKey),b.join()}function m(x,b){x.push(b.precision),x.push(b.outputColorSpace),x.push(b.envMapMode),x.push(b.envMapCubeUVHeight),x.push(b.mapUv),x.push(b.alphaMapUv),x.push(b.lightMapUv),x.push(b.aoMapUv),x.push(b.bumpMapUv),x.push(b.normalMapUv),x.push(b.displacementMapUv),x.push(b.emissiveMapUv),x.push(b.metalnessMapUv),x.push(b.roughnessMapUv),x.push(b.anisotropyMapUv),x.push(b.clearcoatMapUv),x.push(b.clearcoatNormalMapUv),x.push(b.clearcoatRoughnessMapUv),x.push(b.iridescenceMapUv),x.push(b.iridescenceThicknessMapUv),x.push(b.sheenColorMapUv),x.push(b.sheenRoughnessMapUv),x.push(b.specularMapUv),x.push(b.specularColorMapUv),x.push(b.specularIntensityMapUv),x.push(b.transmissionMapUv),x.push(b.thicknessMapUv),x.push(b.combine),x.push(b.fogExp2),x.push(b.sizeAttenuation),x.push(b.morphTargetsCount),x.push(b.morphAttributeCount),x.push(b.numDirLights),x.push(b.numPointLights),x.push(b.numSpotLights),x.push(b.numSpotLightMaps),x.push(b.numHemiLights),x.push(b.numRectAreaLights),x.push(b.numDirLightShadows),x.push(b.numPointLightShadows),x.push(b.numSpotLightShadows),x.push(b.numSpotLightShadowsWithMaps),x.push(b.numLightProbes),x.push(b.shadowMapType),x.push(b.toneMapping),x.push(b.numClippingPlanes),x.push(b.numClipIntersection),x.push(b.depthPacking)}function M(x,b){o.disableAll(),b.instancing&&o.enable(0),b.instancingColor&&o.enable(1),b.instancingMorph&&o.enable(2),b.matcap&&o.enable(3),b.envMap&&o.enable(4),b.normalMapObjectSpace&&o.enable(5),b.normalMapTangentSpace&&o.enable(6),b.clearcoat&&o.enable(7),b.iridescence&&o.enable(8),b.alphaTest&&o.enable(9),b.vertexColors&&o.enable(10),b.vertexAlphas&&o.enable(11),b.vertexUv1s&&o.enable(12),b.vertexUv2s&&o.enable(13),b.vertexUv3s&&o.enable(14),b.vertexTangents&&o.enable(15),b.anisotropy&&o.enable(16),b.alphaHash&&o.enable(17),b.batching&&o.enable(18),b.dispersion&&o.enable(19),b.batchingColor&&o.enable(20),b.gradientMap&&o.enable(21),b.packedNormalMap&&o.enable(22),b.vertexNormals&&o.enable(23),x.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.reversedDepthBuffer&&o.enable(4),b.skinning&&o.enable(5),b.morphTargets&&o.enable(6),b.morphNormals&&o.enable(7),b.morphColors&&o.enable(8),b.premultipliedAlpha&&o.enable(9),b.shadowMapEnabled&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),b.decodeVideoTextureEmissive&&o.enable(20),b.alphaToCoverage&&o.enable(21),b.numLightProbeGrids>0&&o.enable(22),b.hasPositionAttribute&&o.enable(23),x.push(o.mask)}function E(x){let b=f[x.type],R;if(b){let I=ii[b];R=Ju.clone(I.uniforms)}else R=x.uniforms;return R}function _(x,b){let R=h.get(b);return R!==void 0?++R.usedTimes:(R=new Xx(i,b,x,s),l.push(R),h.set(b,R)),R}function A(x){if(--x.usedTimes===0){let b=l.indexOf(x);l[b]=l[l.length-1],l.pop(),h.delete(x.cacheKey),x.destroy()}}function S(x){a.remove(x)}function w(){a.dispose()}return{getParameters:y,getProgramCacheKey:p,getUniforms:E,acquireProgram:_,releaseProgram:A,releaseShaderCache:S,programs:l,dispose:w}}function $x(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,c){i.get(o)[a]=c}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function Jx(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function gd(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function xd(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(u){let f=0;return u.isInstancedMesh&&(f+=2),u.isSkinnedMesh&&(f+=1),f}function a(u,f,g,y,p,m){let M=i[t];return M===void 0?(M={id:u.id,object:u,geometry:f,material:g,materialVariant:o(u),groupOrder:y,renderOrder:u.renderOrder,z:p,group:m},i[t]=M):(M.id=u.id,M.object=u,M.geometry=f,M.material=g,M.materialVariant=o(u),M.groupOrder=y,M.renderOrder=u.renderOrder,M.z=p,M.group=m),t++,M}function c(u,f,g,y,p,m){let M=a(u,f,g,y,p,m);g.transmission>0?n.push(M):g.transparent===!0?s.push(M):e.push(M)}function l(u,f,g,y,p,m){let M=a(u,f,g,y,p,m);g.transmission>0?n.unshift(M):g.transparent===!0?s.unshift(M):e.unshift(M)}function h(u,f,g){e.length>1&&e.sort(u||Jx),n.length>1&&n.sort(f||gd),s.length>1&&s.sort(f||gd),g&&(e.reverse(),n.reverse(),s.reverse())}function d(){for(let u=t,f=i.length;u<f;u++){let g=i[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:c,unshift:l,finish:d,sort:h}}function Kx(){let i=new WeakMap;function t(n,s){let r=i.get(n),o;return r===void 0?(o=new xd,i.set(n,[o])):s>=r.length?(o=new xd,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function Qx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new L,color:new Vt};break;case"SpotLight":e={position:new L,direction:new L,color:new Vt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new L,color:new Vt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new L,skyColor:new Vt,groundColor:new Vt};break;case"RectAreaLight":e={color:new Vt,position:new L,halfWidth:new L,halfHeight:new L};break}return i[t.id]=e,e}}}function jx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var t_=0;function e_(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function n_(i){let t=new Qx,e=jx(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new L);let s=new L,r=new ee,o=new ee;function a(l){let h=0,d=0,u=0;for(let b=0;b<9;b++)n.probe[b].set(0,0,0);let f=0,g=0,y=0,p=0,m=0,M=0,E=0,_=0,A=0,S=0,w=0;l.sort(e_);for(let b=0,R=l.length;b<R;b++){let I=l[b],P=I.color,U=I.intensity,O=I.distance,D=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===zi?D=I.shadow.map.texture:D=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)h+=P.r*U,d+=P.g*U,u+=P.b*U;else if(I.isLightProbe){for(let k=0;k<9;k++)n.probe[k].addScaledVector(I.sh.coefficients[k],U);w++}else if(I.isDirectionalLight){let k=t.get(I);if(k.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let F=I.shadow,H=e.get(I);H.shadowIntensity=F.intensity,H.shadowBias=F.bias,H.shadowNormalBias=F.normalBias,H.shadowRadius=F.radius,H.shadowMapSize=F.mapSize,n.directionalShadow[f]=H,n.directionalShadowMap[f]=D,n.directionalShadowMatrix[f]=I.shadow.matrix,M++}n.directional[f]=k,f++}else if(I.isSpotLight){let k=t.get(I);k.position.setFromMatrixPosition(I.matrixWorld),k.color.copy(P).multiplyScalar(U),k.distance=O,k.coneCos=Math.cos(I.angle),k.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),k.decay=I.decay,n.spot[y]=k;let F=I.shadow;if(I.map&&(n.spotLightMap[A]=I.map,A++,F.updateMatrices(I),I.castShadow&&S++),n.spotLightMatrix[y]=F.matrix,I.castShadow){let H=e.get(I);H.shadowIntensity=F.intensity,H.shadowBias=F.bias,H.shadowNormalBias=F.normalBias,H.shadowRadius=F.radius,H.shadowMapSize=F.mapSize,n.spotShadow[y]=H,n.spotShadowMap[y]=D,_++}y++}else if(I.isRectAreaLight){let k=t.get(I);k.color.copy(P).multiplyScalar(U),k.halfWidth.set(I.width*.5,0,0),k.halfHeight.set(0,I.height*.5,0),n.rectArea[p]=k,p++}else if(I.isPointLight){let k=t.get(I);if(k.color.copy(I.color).multiplyScalar(I.intensity),k.distance=I.distance,k.decay=I.decay,I.castShadow){let F=I.shadow,H=e.get(I);H.shadowIntensity=F.intensity,H.shadowBias=F.bias,H.shadowNormalBias=F.normalBias,H.shadowRadius=F.radius,H.shadowMapSize=F.mapSize,H.shadowCameraNear=F.camera.near,H.shadowCameraFar=F.camera.far,n.pointShadow[g]=H,n.pointShadowMap[g]=D,n.pointShadowMatrix[g]=I.shadow.matrix,E++}n.point[g]=k,g++}else if(I.isHemisphereLight){let k=t.get(I);k.skyColor.copy(I.color).multiplyScalar(U),k.groundColor.copy(I.groundColor).multiplyScalar(U),n.hemi[m]=k,m++}}p>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=bt.LTC_FLOAT_1,n.rectAreaLTC2=bt.LTC_FLOAT_2):(n.rectAreaLTC1=bt.LTC_HALF_1,n.rectAreaLTC2=bt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=d,n.ambient[2]=u;let x=n.hash;(x.directionalLength!==f||x.pointLength!==g||x.spotLength!==y||x.rectAreaLength!==p||x.hemiLength!==m||x.numDirectionalShadows!==M||x.numPointShadows!==E||x.numSpotShadows!==_||x.numSpotMaps!==A||x.numLightProbes!==w)&&(n.directional.length=f,n.spot.length=y,n.rectArea.length=p,n.point.length=g,n.hemi.length=m,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.pointShadow.length=E,n.pointShadowMap.length=E,n.spotShadow.length=_,n.spotShadowMap.length=_,n.directionalShadowMatrix.length=M,n.pointShadowMatrix.length=E,n.spotLightMatrix.length=_+A-S,n.spotLightMap.length=A,n.numSpotLightShadowsWithMaps=S,n.numLightProbes=w,x.directionalLength=f,x.pointLength=g,x.spotLength=y,x.rectAreaLength=p,x.hemiLength=m,x.numDirectionalShadows=M,x.numPointShadows=E,x.numSpotShadows=_,x.numSpotMaps=A,x.numLightProbes=w,n.version=t_++)}function c(l,h){let d=0,u=0,f=0,g=0,y=0,p=h.matrixWorldInverse;for(let m=0,M=l.length;m<M;m++){let E=l[m];if(E.isDirectionalLight){let _=n.directional[d];_.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),_.direction.sub(s),_.direction.transformDirection(p),d++}else if(E.isSpotLight){let _=n.spot[f];_.position.setFromMatrixPosition(E.matrixWorld),_.position.applyMatrix4(p),_.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),_.direction.sub(s),_.direction.transformDirection(p),f++}else if(E.isRectAreaLight){let _=n.rectArea[g];_.position.setFromMatrixPosition(E.matrixWorld),_.position.applyMatrix4(p),o.identity(),r.copy(E.matrixWorld),r.premultiply(p),o.extractRotation(r),_.halfWidth.set(E.width*.5,0,0),_.halfHeight.set(0,E.height*.5,0),_.halfWidth.applyMatrix4(o),_.halfHeight.applyMatrix4(o),g++}else if(E.isPointLight){let _=n.point[u];_.position.setFromMatrixPosition(E.matrixWorld),_.position.applyMatrix4(p),u++}else if(E.isHemisphereLight){let _=n.hemi[y];_.direction.setFromMatrixPosition(E.matrixWorld),_.direction.transformDirection(p),y++}}}return{setup:a,setupView:c,state:n}}function _d(i){let t=new n_(i),e=[],n=[],s=[];function r(u){d.camera=u,e.length=0,n.length=0,s.length=0}function o(u){e.push(u)}function a(u){n.push(u)}function c(u){s.push(u)}function l(){t.setup(e)}function h(u){t.setupView(e,u)}let d={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:l,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:c}}function i_(i){let t=new WeakMap;function e(s,r=0){let o=t.get(s),a;return o===void 0?(a=new _d(i),t.set(s,[a])):r>=o.length?(a=new _d(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}var s_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,r_=`uniform sampler2D shadow_pass;
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
}`,o_=[new L(1,0,0),new L(-1,0,0),new L(0,1,0),new L(0,-1,0),new L(0,0,1),new L(0,0,-1)],a_=[new L(0,-1,0),new L(0,-1,0),new L(0,0,1),new L(0,0,-1),new L(0,-1,0),new L(0,-1,0)],yd=new ee,$r=new L,$l=new L;function c_(i,t,e){let n=new Ps,s=new pt,r=new pt,o=new we,a=new ra,c=new oa,l={},h=e.maxTextureSize,d={[fi]:Ke,[Ke]:fi,[Ce]:Ce},u=new ln({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new pt},radius:{value:4}},vertexShader:s_,fragmentShader:r_}),f=u.clone();f.defines.HORIZONTAL_PASS=1;let g=new Be;g.setAttribute("position",new fn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new ft(g,u),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Fr;let m=this.type;this.render=function(S,w,x){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||S.length===0)return;this.type===_a&&($t("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Fr);let b=i.getRenderTarget(),R=i.getActiveCubeFace(),I=i.getActiveMipmapLevel(),P=i.state;P.setBlending(jn),P.buffers.depth.getReversed()===!0?P.buffers.color.setClear(0,0,0,0):P.buffers.color.setClear(1,1,1,1),P.buffers.depth.setTest(!0),P.setScissorTest(!1);let U=m!==this.type;U&&w.traverse(function(O){O.material&&(Array.isArray(O.material)?O.material.forEach(D=>D.needsUpdate=!0):O.material.needsUpdate=!0)});for(let O=0,D=S.length;O<D;O++){let k=S[O],F=k.shadow;if(F===void 0){$t("WebGLShadowMap:",k,"has no shadow.");continue}if(F.autoUpdate===!1&&F.needsUpdate===!1)continue;s.copy(F.mapSize);let H=F.getFrameExtents();s.multiply(H),r.copy(F.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/H.x),s.x=r.x*H.x,F.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/H.y),s.y=r.y*H.y,F.mapSize.y=r.y));let Y=i.state.buffers.depth.getReversed();if(F.camera._reversedDepth=Y,F.map===null||U===!0){if(F.map!==null&&(F.map.depthTexture!==null&&(F.map.depthTexture.dispose(),F.map.depthTexture=null),F.map.dispose()),this.type===Bs){if(k.isPointLight){$t("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}F.map=new yn(s.x,s.y,{format:zi,type:ei,minFilter:Je,magFilter:Je,generateMipmaps:!1}),F.map.texture.name=k.name+".shadowMap",F.map.depthTexture=new mi(s.x,s.y,In),F.map.depthTexture.name=k.name+".shadowMapDepth",F.map.depthTexture.format=Jn,F.map.depthTexture.compareFunction=null,F.map.depthTexture.minFilter=qe,F.map.depthTexture.magFilter=qe}else k.isPointLight?(F.map=new Vs(s.x),F.map.depthTexture=new Jo(s.x,Gn)):(F.map=new yn(s.x,s.y),F.map.depthTexture=new mi(s.x,s.y,Gn)),F.map.depthTexture.name=k.name+".shadowMap",F.map.depthTexture.format=Jn,this.type===Fr?(F.map.depthTexture.compareFunction=Y?ac:oc,F.map.depthTexture.minFilter=Je,F.map.depthTexture.magFilter=Je):(F.map.depthTexture.compareFunction=null,F.map.depthTexture.minFilter=qe,F.map.depthTexture.magFilter=qe);F.camera.updateProjectionMatrix()}let J=F.map.isWebGLCubeRenderTarget?6:1;for(let $=0;$<J;$++){if(F.map.isWebGLCubeRenderTarget)i.setRenderTarget(F.map,$),i.clear();else{$===0&&(i.setRenderTarget(F.map),i.clear());let st=F.getViewport($);o.set(r.x*st.x,r.y*st.y,r.x*st.z,r.y*st.w),P.viewport(o)}if(k.isPointLight){let st=F.camera,rt=F.matrix,Tt=k.distance||st.far;Tt!==st.far&&(st.far=Tt,st.updateProjectionMatrix()),$r.setFromMatrixPosition(k.matrixWorld),st.position.copy($r),$l.copy(st.position),$l.add(o_[$]),st.up.copy(a_[$]),st.lookAt($l),st.updateMatrixWorld(),rt.makeTranslation(-$r.x,-$r.y,-$r.z),yd.multiplyMatrices(st.projectionMatrix,st.matrixWorldInverse),F._frustum.setFromProjectionMatrix(yd,st.coordinateSystem,st.reversedDepth)}else F.updateMatrices(k);n=F.getFrustum(),_(w,x,F.camera,k,this.type)}F.isPointLightShadow!==!0&&this.type===Bs&&M(F,x),F.needsUpdate=!1}m=this.type,p.needsUpdate=!1,i.setRenderTarget(b,R,I)};function M(S,w){let x=t.update(y);u.defines.VSM_SAMPLES!==S.blurSamples&&(u.defines.VSM_SAMPLES=S.blurSamples,f.defines.VSM_SAMPLES=S.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),S.mapPass===null&&(S.mapPass=new yn(s.x,s.y,{format:zi,type:ei})),u.uniforms.shadow_pass.value=S.map.depthTexture,u.uniforms.resolution.value=S.mapSize,u.uniforms.radius.value=S.radius,i.setRenderTarget(S.mapPass),i.clear(),i.renderBufferDirect(w,null,x,u,y,null),f.uniforms.shadow_pass.value=S.mapPass.texture,f.uniforms.resolution.value=S.mapSize,f.uniforms.radius.value=S.radius,i.setRenderTarget(S.map),i.clear(),i.renderBufferDirect(w,null,x,f,y,null)}function E(S,w,x,b){let R=null,I=x.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(I!==void 0)R=I;else if(R=x.isPointLight===!0?c:a,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){let P=R.uuid,U=w.uuid,O=l[P];O===void 0&&(O={},l[P]=O);let D=O[U];D===void 0&&(D=R.clone(),O[U]=D,w.addEventListener("dispose",A)),R=D}if(R.visible=w.visible,R.wireframe=w.wireframe,b===Bs?R.side=w.shadowSide!==null?w.shadowSide:w.side:R.side=w.shadowSide!==null?w.shadowSide:d[w.side],R.alphaMap=w.alphaMap,R.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,R.map=w.map,R.clipShadows=w.clipShadows,R.clippingPlanes=w.clippingPlanes,R.clipIntersection=w.clipIntersection,R.displacementMap=w.displacementMap,R.displacementScale=w.displacementScale,R.displacementBias=w.displacementBias,R.wireframeLinewidth=w.wireframeLinewidth,R.linewidth=w.linewidth,x.isPointLight===!0&&R.isMeshDistanceMaterial===!0){let P=i.properties.get(R);P.light=x}return R}function _(S,w,x,b,R){if(S.visible===!1)return;if(S.layers.test(w.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&R===Bs)&&(!S.frustumCulled||n.intersectsObject(S))){S.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,S.matrixWorld);let U=t.update(S),O=S.material;if(Array.isArray(O)){let D=U.groups;for(let k=0,F=D.length;k<F;k++){let H=D[k],Y=O[H.materialIndex];if(Y&&Y.visible){let J=E(S,Y,b,R);S.onBeforeShadow(i,S,w,x,U,J,H),i.renderBufferDirect(x,null,U,J,S,H),S.onAfterShadow(i,S,w,x,U,J,H)}}}else if(O.visible){let D=E(S,O,b,R);S.onBeforeShadow(i,S,w,x,U,D,null),i.renderBufferDirect(x,null,U,D,S,null),S.onAfterShadow(i,S,w,x,U,D,null)}}let P=S.children;for(let U=0,O=P.length;U<O;U++)_(P[U],w,x,b,R)}function A(S){S.target.removeEventListener("dispose",A);for(let x in l){let b=l[x],R=S.target.uuid;R in b&&(b[R].dispose(),delete b[R])}}}function l_(i,t){function e(){let B=!1,gt=new we,tt=null,yt=new we(0,0,0,0);return{setMask:function(Ct){tt!==Ct&&!B&&(i.colorMask(Ct,Ct,Ct,Ct),tt=Ct)},setLocked:function(Ct){B=Ct},setClear:function(Ct,at,zt,Ft,Pe){Pe===!0&&(Ct*=Ft,at*=Ft,zt*=Ft),gt.set(Ct,at,zt,Ft),yt.equals(gt)===!1&&(i.clearColor(Ct,at,zt,Ft),yt.copy(gt))},reset:function(){B=!1,tt=null,yt.set(-1,0,0,0)}}}function n(){let B=!1,gt=!1,tt=null,yt=null,Ct=null;return{setReversed:function(at){if(gt!==at){let zt=t.get("EXT_clip_control");at?zt.clipControlEXT(zt.LOWER_LEFT_EXT,zt.ZERO_TO_ONE_EXT):zt.clipControlEXT(zt.LOWER_LEFT_EXT,zt.NEGATIVE_ONE_TO_ONE_EXT),gt=at;let Ft=Ct;Ct=null,this.setClear(Ft)}},getReversed:function(){return gt},setTest:function(at){at?et(i.DEPTH_TEST):ut(i.DEPTH_TEST)},setMask:function(at){tt!==at&&!B&&(i.depthMask(at),tt=at)},setFunc:function(at){if(gt&&(at=Wu[at]),yt!==at){switch(at){case Bo:i.depthFunc(i.NEVER);break;case Oo:i.depthFunc(i.ALWAYS);break;case zo:i.depthFunc(i.LESS);break;case Qi:i.depthFunc(i.LEQUAL);break;case Ho:i.depthFunc(i.EQUAL);break;case Go:i.depthFunc(i.GEQUAL);break;case ko:i.depthFunc(i.GREATER);break;case Vo:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}yt=at}},setLocked:function(at){B=at},setClear:function(at){Ct!==at&&(Ct=at,gt&&(at=1-at),i.clearDepth(at))},reset:function(){B=!1,tt=null,yt=null,Ct=null,gt=!1}}}function s(){let B=!1,gt=null,tt=null,yt=null,Ct=null,at=null,zt=null,Ft=null,Pe=null;return{setTest:function(ve){B||(ve?et(i.STENCIL_TEST):ut(i.STENCIL_TEST))},setMask:function(ve){gt!==ve&&!B&&(i.stencilMask(ve),gt=ve)},setFunc:function(ve,Wn,Xn){(tt!==ve||yt!==Wn||Ct!==Xn)&&(i.stencilFunc(ve,Wn,Xn),tt=ve,yt=Wn,Ct=Xn)},setOp:function(ve,Wn,Xn){(at!==ve||zt!==Wn||Ft!==Xn)&&(i.stencilOp(ve,Wn,Xn),at=ve,zt=Wn,Ft=Xn)},setLocked:function(ve){B=ve},setClear:function(ve){Pe!==ve&&(i.clearStencil(ve),Pe=ve)},reset:function(){B=!1,gt=null,tt=null,yt=null,Ct=null,at=null,zt=null,Ft=null,Pe=null}}}let r=new e,o=new n,a=new s,c=new WeakMap,l=new WeakMap,h={},d={},u={},f=new WeakMap,g=[],y=null,p=!1,m=null,M=null,E=null,_=null,A=null,S=null,w=null,x=new Vt(0,0,0),b=0,R=!1,I=null,P=null,U=null,O=null,D=null,k=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),F=!1,H=0,Y=i.getParameter(i.VERSION);Y.indexOf("WebGL")!==-1?(H=parseFloat(/^WebGL (\d)/.exec(Y)[1]),F=H>=1):Y.indexOf("OpenGL ES")!==-1&&(H=parseFloat(/^OpenGL ES (\d)/.exec(Y)[1]),F=H>=2);let J=null,$={},st=i.getParameter(i.SCISSOR_BOX),rt=i.getParameter(i.VIEWPORT),Tt=new we().fromArray(st),vt=new we().fromArray(rt);function q(B,gt,tt,yt){let Ct=new Uint8Array(4),at=i.createTexture();i.bindTexture(B,at),i.texParameteri(B,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(B,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let zt=0;zt<tt;zt++)B===i.TEXTURE_3D||B===i.TEXTURE_2D_ARRAY?i.texImage3D(gt,0,i.RGBA,1,1,yt,0,i.RGBA,i.UNSIGNED_BYTE,Ct):i.texImage2D(gt+zt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Ct);return at}let ot={};ot[i.TEXTURE_2D]=q(i.TEXTURE_2D,i.TEXTURE_2D,1),ot[i.TEXTURE_CUBE_MAP]=q(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),ot[i.TEXTURE_2D_ARRAY]=q(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),ot[i.TEXTURE_3D]=q(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),et(i.DEPTH_TEST),o.setFunc(Qi),Et(!1),Mt(Ml),et(i.CULL_FACE),lt(jn);function et(B){h[B]!==!0&&(i.enable(B),h[B]=!0)}function ut(B){h[B]!==!1&&(i.disable(B),h[B]=!1)}function Ot(B,gt){return u[B]!==gt?(i.bindFramebuffer(B,gt),u[B]=gt,B===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=gt),B===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=gt),!0):!1}function Nt(B,gt){let tt=g,yt=!1;if(B){tt=f.get(gt),tt===void 0&&(tt=[],f.set(gt,tt));let Ct=B.textures;if(tt.length!==Ct.length||tt[0]!==i.COLOR_ATTACHMENT0){for(let at=0,zt=Ct.length;at<zt;at++)tt[at]=i.COLOR_ATTACHMENT0+at;tt.length=Ct.length,yt=!0}}else tt[0]!==i.BACK&&(tt[0]=i.BACK,yt=!0);yt&&i.drawBuffers(tt)}function oe(B){return y!==B?(i.useProgram(B),y=B,!0):!1}let It={[Ii]:i.FUNC_ADD,[fu]:i.FUNC_SUBTRACT,[pu]:i.FUNC_REVERSE_SUBTRACT};It[mu]=i.MIN,It[gu]=i.MAX;let j={[xu]:i.ZERO,[_u]:i.ONE,[yu]:i.SRC_COLOR,[No]:i.SRC_ALPHA,[wu]:i.SRC_ALPHA_SATURATE,[bu]:i.DST_COLOR,[Mu]:i.DST_ALPHA,[vu]:i.ONE_MINUS_SRC_COLOR,[Fo]:i.ONE_MINUS_SRC_ALPHA,[Eu]:i.ONE_MINUS_DST_COLOR,[Su]:i.ONE_MINUS_DST_ALPHA,[Tu]:i.CONSTANT_COLOR,[Au]:i.ONE_MINUS_CONSTANT_COLOR,[Ru]:i.CONSTANT_ALPHA,[Cu]:i.ONE_MINUS_CONSTANT_ALPHA};function lt(B,gt,tt,yt,Ct,at,zt,Ft,Pe,ve){if(B===jn){p===!0&&(ut(i.BLEND),p=!1);return}if(p===!1&&(et(i.BLEND),p=!0),B!==du){if(B!==m||ve!==R){if((M!==Ii||A!==Ii)&&(i.blendEquation(i.FUNC_ADD),M=Ii,A=Ii),ve)switch(B){case Ki:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Sl:i.blendFunc(i.ONE,i.ONE);break;case bl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Br:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Zt("WebGLState: Invalid blending: ",B);break}else switch(B){case Ki:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Sl:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case bl:Zt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Br:Zt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Zt("WebGLState: Invalid blending: ",B);break}E=null,_=null,S=null,w=null,x.set(0,0,0),b=0,m=B,R=ve}return}Ct=Ct||gt,at=at||tt,zt=zt||yt,(gt!==M||Ct!==A)&&(i.blendEquationSeparate(It[gt],It[Ct]),M=gt,A=Ct),(tt!==E||yt!==_||at!==S||zt!==w)&&(i.blendFuncSeparate(j[tt],j[yt],j[at],j[zt]),E=tt,_=yt,S=at,w=zt),(Ft.equals(x)===!1||Pe!==b)&&(i.blendColor(Ft.r,Ft.g,Ft.b,Pe),x.copy(Ft),b=Pe),m=B,R=!1}function ct(B,gt){B.side===Ce?ut(i.CULL_FACE):et(i.CULL_FACE);let tt=B.side===Ke;gt&&(tt=!tt),Et(tt),B.blending===Ki&&B.transparent===!1?lt(jn):lt(B.blending,B.blendEquation,B.blendSrc,B.blendDst,B.blendEquationAlpha,B.blendSrcAlpha,B.blendDstAlpha,B.blendColor,B.blendAlpha,B.premultipliedAlpha),o.setFunc(B.depthFunc),o.setTest(B.depthTest),o.setMask(B.depthWrite),r.setMask(B.colorWrite);let yt=B.stencilWrite;a.setTest(yt),yt&&(a.setMask(B.stencilWriteMask),a.setFunc(B.stencilFunc,B.stencilRef,B.stencilFuncMask),a.setOp(B.stencilFail,B.stencilZFail,B.stencilZPass)),Ht(B.polygonOffset,B.polygonOffsetFactor,B.polygonOffsetUnits),B.alphaToCoverage===!0?et(i.SAMPLE_ALPHA_TO_COVERAGE):ut(i.SAMPLE_ALPHA_TO_COVERAGE)}function Et(B){I!==B&&(B?i.frontFace(i.CW):i.frontFace(i.CCW),I=B)}function Mt(B){B!==hu?(et(i.CULL_FACE),B!==P&&(B===Ml?i.cullFace(i.BACK):B===uu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ut(i.CULL_FACE),P=B}function Yt(B){B!==U&&(F&&i.lineWidth(B),U=B)}function Ht(B,gt,tt){B?(et(i.POLYGON_OFFSET_FILL),(O!==gt||D!==tt)&&(O=gt,D=tt,o.getReversed()&&(gt=-gt),i.polygonOffset(gt,tt))):ut(i.POLYGON_OFFSET_FILL)}function Kt(B){B?et(i.SCISSOR_TEST):ut(i.SCISSOR_TEST)}function te(B){B===void 0&&(B=i.TEXTURE0+k-1),J!==B&&(i.activeTexture(B),J=B)}function N(B,gt,tt){tt===void 0&&(J===null?tt=i.TEXTURE0+k-1:tt=J);let yt=$[tt];yt===void 0&&(yt={type:void 0,texture:void 0},$[tt]=yt),(yt.type!==B||yt.texture!==gt)&&(J!==tt&&(i.activeTexture(tt),J=tt),i.bindTexture(B,gt||ot[B]),yt.type=B,yt.texture=gt)}function pe(){let B=$[J];B!==void 0&&B.type!==void 0&&(i.bindTexture(B.type,null),B.type=void 0,B.texture=void 0)}function ce(){try{i.compressedTexImage2D(...arguments)}catch(B){Zt("WebGLState:",B)}}function C(){try{i.compressedTexImage3D(...arguments)}catch(B){Zt("WebGLState:",B)}}function v(){try{i.texSubImage2D(...arguments)}catch(B){Zt("WebGLState:",B)}}function G(){try{i.texSubImage3D(...arguments)}catch(B){Zt("WebGLState:",B)}}function X(){try{i.compressedTexSubImage2D(...arguments)}catch(B){Zt("WebGLState:",B)}}function K(){try{i.compressedTexSubImage3D(...arguments)}catch(B){Zt("WebGLState:",B)}}function dt(){try{i.texStorage2D(...arguments)}catch(B){Zt("WebGLState:",B)}}function mt(){try{i.texStorage3D(...arguments)}catch(B){Zt("WebGLState:",B)}}function Q(){try{i.texImage2D(...arguments)}catch(B){Zt("WebGLState:",B)}}function nt(){try{i.texImage3D(...arguments)}catch(B){Zt("WebGLState:",B)}}function xt(B){return d[B]!==void 0?d[B]:i.getParameter(B)}function Gt(B,gt){d[B]!==gt&&(i.pixelStorei(B,gt),d[B]=gt)}function St(B){Tt.equals(B)===!1&&(i.scissor(B.x,B.y,B.z,B.w),Tt.copy(B))}function _t(B){vt.equals(B)===!1&&(i.viewport(B.x,B.y,B.z,B.w),vt.copy(B))}function Xt(B,gt){let tt=l.get(gt);tt===void 0&&(tt=new WeakMap,l.set(gt,tt));let yt=tt.get(B);yt===void 0&&(yt=i.getUniformBlockIndex(gt,B.name),tt.set(B,yt))}function Jt(B,gt){let yt=l.get(gt).get(B);c.get(gt)!==yt&&(i.uniformBlockBinding(gt,yt,B.__bindingPointIndex),c.set(gt,yt))}function ne(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},d={},J=null,$={},u={},f=new WeakMap,g=[],y=null,p=!1,m=null,M=null,E=null,_=null,A=null,S=null,w=null,x=new Vt(0,0,0),b=0,R=!1,I=null,P=null,U=null,O=null,D=null,Tt.set(0,0,i.canvas.width,i.canvas.height),vt.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:et,disable:ut,bindFramebuffer:Ot,drawBuffers:Nt,useProgram:oe,setBlending:lt,setMaterial:ct,setFlipSided:Et,setCullFace:Mt,setLineWidth:Yt,setPolygonOffset:Ht,setScissorTest:Kt,activeTexture:te,bindTexture:N,unbindTexture:pe,compressedTexImage2D:ce,compressedTexImage3D:C,texImage2D:Q,texImage3D:nt,pixelStorei:Gt,getParameter:xt,updateUBOMapping:Xt,uniformBlockBinding:Jt,texStorage2D:dt,texStorage3D:mt,texSubImage2D:v,texSubImage3D:G,compressedTexSubImage2D:X,compressedTexSubImage3D:K,scissor:St,viewport:_t,reset:ne}}function h_(i,t,e,n,s,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new pt,h=new WeakMap,d=new Set,u,f=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(C,v){return g?new OffscreenCanvas(C,v):lr("canvas")}function p(C,v,G){let X=1,K=ce(C);if((K.width>G||K.height>G)&&(X=G/Math.max(K.width,K.height)),X<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let dt=Math.floor(X*K.width),mt=Math.floor(X*K.height);u===void 0&&(u=y(dt,mt));let Q=v?y(dt,mt):u;return Q.width=dt,Q.height=mt,Q.getContext("2d").drawImage(C,0,0,dt,mt),$t("WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+dt+"x"+mt+")."),Q}else return"data"in C&&$t("WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),C;return C}function m(C){return C.generateMipmaps}function M(C){i.generateMipmap(C)}function E(C){return C.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?i.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function _(C,v,G,X,K,dt=!1){if(C!==null){if(i[C]!==void 0)return i[C];$t("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let mt;X&&(mt=t.get("EXT_texture_norm16"),mt||$t("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Q=v;if(v===i.RED&&(G===i.FLOAT&&(Q=i.R32F),G===i.HALF_FLOAT&&(Q=i.R16F),G===i.UNSIGNED_BYTE&&(Q=i.R8),G===i.UNSIGNED_SHORT&&mt&&(Q=mt.R16_EXT),G===i.SHORT&&mt&&(Q=mt.R16_SNORM_EXT)),v===i.RED_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.R8UI),G===i.UNSIGNED_SHORT&&(Q=i.R16UI),G===i.UNSIGNED_INT&&(Q=i.R32UI),G===i.BYTE&&(Q=i.R8I),G===i.SHORT&&(Q=i.R16I),G===i.INT&&(Q=i.R32I)),v===i.RG&&(G===i.FLOAT&&(Q=i.RG32F),G===i.HALF_FLOAT&&(Q=i.RG16F),G===i.UNSIGNED_BYTE&&(Q=i.RG8),G===i.UNSIGNED_SHORT&&mt&&(Q=mt.RG16_EXT),G===i.SHORT&&mt&&(Q=mt.RG16_SNORM_EXT)),v===i.RG_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.RG8UI),G===i.UNSIGNED_SHORT&&(Q=i.RG16UI),G===i.UNSIGNED_INT&&(Q=i.RG32UI),G===i.BYTE&&(Q=i.RG8I),G===i.SHORT&&(Q=i.RG16I),G===i.INT&&(Q=i.RG32I)),v===i.RGB_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.RGB8UI),G===i.UNSIGNED_SHORT&&(Q=i.RGB16UI),G===i.UNSIGNED_INT&&(Q=i.RGB32UI),G===i.BYTE&&(Q=i.RGB8I),G===i.SHORT&&(Q=i.RGB16I),G===i.INT&&(Q=i.RGB32I)),v===i.RGBA_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.RGBA8UI),G===i.UNSIGNED_SHORT&&(Q=i.RGBA16UI),G===i.UNSIGNED_INT&&(Q=i.RGBA32UI),G===i.BYTE&&(Q=i.RGBA8I),G===i.SHORT&&(Q=i.RGBA16I),G===i.INT&&(Q=i.RGBA32I)),v===i.RGB&&(G===i.UNSIGNED_SHORT&&mt&&(Q=mt.RGB16_EXT),G===i.SHORT&&mt&&(Q=mt.RGB16_SNORM_EXT),G===i.UNSIGNED_INT_5_9_9_9_REV&&(Q=i.RGB9_E5),G===i.UNSIGNED_INT_10F_11F_11F_REV&&(Q=i.R11F_G11F_B10F)),v===i.RGBA){let nt=dt?cr:he.getTransfer(K);G===i.FLOAT&&(Q=i.RGBA32F),G===i.HALF_FLOAT&&(Q=i.RGBA16F),G===i.UNSIGNED_BYTE&&(Q=nt===de?i.SRGB8_ALPHA8:i.RGBA8),G===i.UNSIGNED_SHORT&&mt&&(Q=mt.RGBA16_EXT),G===i.SHORT&&mt&&(Q=mt.RGBA16_SNORM_EXT),G===i.UNSIGNED_SHORT_4_4_4_4&&(Q=i.RGBA4),G===i.UNSIGNED_SHORT_5_5_5_1&&(Q=i.RGB5_A1)}return(Q===i.R16F||Q===i.R32F||Q===i.RG16F||Q===i.RG32F||Q===i.RGBA16F||Q===i.RGBA32F)&&t.get("EXT_color_buffer_float"),Q}function A(C,v){let G;return C?v===null||v===Gn||v===zs?G=i.DEPTH24_STENCIL8:v===In?G=i.DEPTH32F_STENCIL8:v===Os&&(G=i.DEPTH24_STENCIL8,$t("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===Gn||v===zs?G=i.DEPTH_COMPONENT24:v===In?G=i.DEPTH_COMPONENT32F:v===Os&&(G=i.DEPTH_COMPONENT16),G}function S(C,v){return m(C)===!0||C.isFramebufferTexture&&C.minFilter!==qe&&C.minFilter!==Je?Math.log2(Math.max(v.width,v.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?v.mipmaps.length:1}function w(C){let v=C.target;v.removeEventListener("dispose",w),b(v),v.isVideoTexture&&h.delete(v),v.isHTMLTexture&&d.delete(v)}function x(C){let v=C.target;v.removeEventListener("dispose",x),I(v)}function b(C){let v=n.get(C);if(v.__webglInit===void 0)return;let G=C.source,X=f.get(G);if(X){let K=X[v.__cacheKey];K.usedTimes--,K.usedTimes===0&&R(C),Object.keys(X).length===0&&f.delete(G)}n.remove(C)}function R(C){let v=n.get(C);i.deleteTexture(v.__webglTexture);let G=C.source,X=f.get(G);delete X[v.__cacheKey],o.memory.textures--}function I(C){let v=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let X=0;X<6;X++){if(Array.isArray(v.__webglFramebuffer[X]))for(let K=0;K<v.__webglFramebuffer[X].length;K++)i.deleteFramebuffer(v.__webglFramebuffer[X][K]);else i.deleteFramebuffer(v.__webglFramebuffer[X]);v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer[X])}else{if(Array.isArray(v.__webglFramebuffer))for(let X=0;X<v.__webglFramebuffer.length;X++)i.deleteFramebuffer(v.__webglFramebuffer[X]);else i.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&i.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let X=0;X<v.__webglColorRenderbuffer.length;X++)v.__webglColorRenderbuffer[X]&&i.deleteRenderbuffer(v.__webglColorRenderbuffer[X]);v.__webglDepthRenderbuffer&&i.deleteRenderbuffer(v.__webglDepthRenderbuffer)}let G=C.textures;for(let X=0,K=G.length;X<K;X++){let dt=n.get(G[X]);dt.__webglTexture&&(i.deleteTexture(dt.__webglTexture),o.memory.textures--),n.remove(G[X])}n.remove(C)}let P=0;function U(){P=0}function O(){return P}function D(C){P=C}function k(){let C=P;return C>=s.maxTextures&&$t("WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+s.maxTextures),P+=1,C}function F(C){let v=[];return v.push(C.wrapS),v.push(C.wrapT),v.push(C.wrapR||0),v.push(C.magFilter),v.push(C.minFilter),v.push(C.anisotropy),v.push(C.internalFormat),v.push(C.format),v.push(C.type),v.push(C.generateMipmaps),v.push(C.premultiplyAlpha),v.push(C.flipY),v.push(C.unpackAlignment),v.push(C.colorSpace),v.join()}function H(C,v){let G=n.get(C);if(C.isVideoTexture&&N(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&G.__version!==C.version){let X=C.image;if(X===null)$t("WebGLRenderer: Texture marked for update but no image data found.");else if(X.complete===!1)$t("WebGLRenderer: Texture marked for update but image is incomplete");else{ut(G,C,v);return}}else C.isExternalTexture&&(G.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,G.__webglTexture,i.TEXTURE0+v)}function Y(C,v){let G=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&G.__version!==C.version){ut(G,C,v);return}else C.isExternalTexture&&(G.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,G.__webglTexture,i.TEXTURE0+v)}function J(C,v){let G=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&G.__version!==C.version){ut(G,C,v);return}e.bindTexture(i.TEXTURE_3D,G.__webglTexture,i.TEXTURE0+v)}function $(C,v){let G=n.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&G.__version!==C.version){Ot(G,C,v);return}e.bindTexture(i.TEXTURE_CUBE_MAP,G.__webglTexture,i.TEXTURE0+v)}let st={[ws]:i.REPEAT,[$n]:i.CLAMP_TO_EDGE,[Wo]:i.MIRRORED_REPEAT},rt={[qe]:i.NEAREST,[Lu]:i.NEAREST_MIPMAP_NEAREST,[Hr]:i.NEAREST_MIPMAP_LINEAR,[Je]:i.LINEAR,[Sa]:i.LINEAR_MIPMAP_NEAREST,[ti]:i.LINEAR_MIPMAP_LINEAR},Tt={[Nu]:i.NEVER,[Hu]:i.ALWAYS,[Fu]:i.LESS,[oc]:i.LEQUAL,[Bu]:i.EQUAL,[ac]:i.GEQUAL,[Ou]:i.GREATER,[zu]:i.NOTEQUAL};function vt(C,v){if(v.type===In&&t.has("OES_texture_float_linear")===!1&&(v.magFilter===Je||v.magFilter===Sa||v.magFilter===Hr||v.magFilter===ti||v.minFilter===Je||v.minFilter===Sa||v.minFilter===Hr||v.minFilter===ti)&&$t("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(C,i.TEXTURE_WRAP_S,st[v.wrapS]),i.texParameteri(C,i.TEXTURE_WRAP_T,st[v.wrapT]),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,st[v.wrapR]),i.texParameteri(C,i.TEXTURE_MAG_FILTER,rt[v.magFilter]),i.texParameteri(C,i.TEXTURE_MIN_FILTER,rt[v.minFilter]),v.compareFunction&&(i.texParameteri(C,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(C,i.TEXTURE_COMPARE_FUNC,Tt[v.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===qe||v.minFilter!==Hr&&v.minFilter!==ti||v.type===In&&t.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||n.get(v).__currentAnisotropy){let G=t.get("EXT_texture_filter_anisotropic");i.texParameterf(C,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),n.get(v).__currentAnisotropy=v.anisotropy}}}function q(C,v){let G=!1;C.__webglInit===void 0&&(C.__webglInit=!0,v.addEventListener("dispose",w));let X=v.source,K=f.get(X);K===void 0&&(K={},f.set(X,K));let dt=F(v);if(dt!==C.__cacheKey){K[dt]===void 0&&(K[dt]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,G=!0),K[dt].usedTimes++;let mt=K[C.__cacheKey];mt!==void 0&&(K[C.__cacheKey].usedTimes--,mt.usedTimes===0&&R(v)),C.__cacheKey=dt,C.__webglTexture=K[dt].texture}return G}function ot(C,v,G){return Math.floor(Math.floor(C/G)/v)}function et(C,v,G,X){let dt=C.updateRanges;if(dt.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,v.width,v.height,G,X,v.data);else{dt.sort((Gt,St)=>Gt.start-St.start);let mt=0;for(let Gt=1;Gt<dt.length;Gt++){let St=dt[mt],_t=dt[Gt],Xt=St.start+St.count,Jt=ot(_t.start,v.width,4),ne=ot(St.start,v.width,4);_t.start<=Xt+1&&Jt===ne&&ot(_t.start+_t.count-1,v.width,4)===Jt?St.count=Math.max(St.count,_t.start+_t.count-St.start):(++mt,dt[mt]=_t)}dt.length=mt+1;let Q=e.getParameter(i.UNPACK_ROW_LENGTH),nt=e.getParameter(i.UNPACK_SKIP_PIXELS),xt=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,v.width);for(let Gt=0,St=dt.length;Gt<St;Gt++){let _t=dt[Gt],Xt=Math.floor(_t.start/4),Jt=Math.ceil(_t.count/4),ne=Xt%v.width,B=Math.floor(Xt/v.width),gt=Jt,tt=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,ne),e.pixelStorei(i.UNPACK_SKIP_ROWS,B),e.texSubImage2D(i.TEXTURE_2D,0,ne,B,gt,tt,G,X,v.data)}C.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,Q),e.pixelStorei(i.UNPACK_SKIP_PIXELS,nt),e.pixelStorei(i.UNPACK_SKIP_ROWS,xt)}}function ut(C,v,G){let X=i.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(X=i.TEXTURE_2D_ARRAY),v.isData3DTexture&&(X=i.TEXTURE_3D);let K=q(C,v),dt=v.source;e.bindTexture(X,C.__webglTexture,i.TEXTURE0+G);let mt=n.get(dt);if(dt.version!==mt.__version||K===!0){if(e.activeTexture(i.TEXTURE0+G),(typeof ImageBitmap<"u"&&v.image instanceof ImageBitmap)===!1){let tt=he.getPrimaries(he.workingColorSpace),yt=v.colorSpace===xi?null:he.getPrimaries(v.colorSpace),Ct=v.colorSpace===xi||tt===yt?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ct)}e.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment);let nt=p(v.image,!1,s.maxTextureSize);nt=pe(v,nt);let xt=r.convert(v.format,v.colorSpace),Gt=r.convert(v.type),St=_(v.internalFormat,xt,Gt,v.normalized,v.colorSpace,v.isVideoTexture);vt(X,v);let _t,Xt=v.mipmaps,Jt=v.isVideoTexture!==!0,ne=mt.__version===void 0||K===!0,B=dt.dataReady,gt=S(v,nt);if(v.isDepthTexture)St=A(v.format===Oi,v.type),ne&&(Jt?e.texStorage2D(i.TEXTURE_2D,1,St,nt.width,nt.height):e.texImage2D(i.TEXTURE_2D,0,St,nt.width,nt.height,0,xt,Gt,null));else if(v.isDataTexture)if(Xt.length>0){Jt&&ne&&e.texStorage2D(i.TEXTURE_2D,gt,St,Xt[0].width,Xt[0].height);for(let tt=0,yt=Xt.length;tt<yt;tt++)_t=Xt[tt],Jt?B&&e.texSubImage2D(i.TEXTURE_2D,tt,0,0,_t.width,_t.height,xt,Gt,_t.data):e.texImage2D(i.TEXTURE_2D,tt,St,_t.width,_t.height,0,xt,Gt,_t.data);v.generateMipmaps=!1}else Jt?(ne&&e.texStorage2D(i.TEXTURE_2D,gt,St,nt.width,nt.height),B&&et(v,nt,xt,Gt)):e.texImage2D(i.TEXTURE_2D,0,St,nt.width,nt.height,0,xt,Gt,nt.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){Jt&&ne&&e.texStorage3D(i.TEXTURE_2D_ARRAY,gt,St,Xt[0].width,Xt[0].height,nt.depth);for(let tt=0,yt=Xt.length;tt<yt;tt++)if(_t=Xt[tt],v.format!==Pn)if(xt!==null)if(Jt){if(B)if(v.layerUpdates.size>0){let Ct=Vl(_t.width,_t.height,v.format,v.type);for(let at of v.layerUpdates){let zt=_t.data.subarray(at*Ct/_t.data.BYTES_PER_ELEMENT,(at+1)*Ct/_t.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,tt,0,0,at,_t.width,_t.height,1,xt,zt)}v.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,tt,0,0,0,_t.width,_t.height,nt.depth,xt,_t.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,tt,St,_t.width,_t.height,nt.depth,0,_t.data,0,0);else $t("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Jt?B&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,tt,0,0,0,_t.width,_t.height,nt.depth,xt,Gt,_t.data):e.texImage3D(i.TEXTURE_2D_ARRAY,tt,St,_t.width,_t.height,nt.depth,0,xt,Gt,_t.data)}else{Jt&&ne&&e.texStorage2D(i.TEXTURE_2D,gt,St,Xt[0].width,Xt[0].height);for(let tt=0,yt=Xt.length;tt<yt;tt++)_t=Xt[tt],v.format!==Pn?xt!==null?Jt?B&&e.compressedTexSubImage2D(i.TEXTURE_2D,tt,0,0,_t.width,_t.height,xt,_t.data):e.compressedTexImage2D(i.TEXTURE_2D,tt,St,_t.width,_t.height,0,_t.data):$t("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Jt?B&&e.texSubImage2D(i.TEXTURE_2D,tt,0,0,_t.width,_t.height,xt,Gt,_t.data):e.texImage2D(i.TEXTURE_2D,tt,St,_t.width,_t.height,0,xt,Gt,_t.data)}else if(v.isDataArrayTexture)if(Jt){if(ne&&e.texStorage3D(i.TEXTURE_2D_ARRAY,gt,St,nt.width,nt.height,nt.depth),B)if(v.layerUpdates.size>0){let tt=Vl(nt.width,nt.height,v.format,v.type);for(let yt of v.layerUpdates){let Ct=nt.data.subarray(yt*tt/nt.data.BYTES_PER_ELEMENT,(yt+1)*tt/nt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,yt,nt.width,nt.height,1,xt,Gt,Ct)}v.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,nt.width,nt.height,nt.depth,xt,Gt,nt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,St,nt.width,nt.height,nt.depth,0,xt,Gt,nt.data);else if(v.isData3DTexture)Jt?(ne&&e.texStorage3D(i.TEXTURE_3D,gt,St,nt.width,nt.height,nt.depth),B&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,nt.width,nt.height,nt.depth,xt,Gt,nt.data)):e.texImage3D(i.TEXTURE_3D,0,St,nt.width,nt.height,nt.depth,0,xt,Gt,nt.data);else if(v.isFramebufferTexture){if(ne)if(Jt)e.texStorage2D(i.TEXTURE_2D,gt,St,nt.width,nt.height);else{let tt=nt.width,yt=nt.height;for(let Ct=0;Ct<gt;Ct++)e.texImage2D(i.TEXTURE_2D,Ct,St,tt,yt,0,xt,Gt,null),tt>>=1,yt>>=1}}else if(v.isHTMLTexture){if("texElementImage2D"in i){let tt=i.canvas;if(tt.hasAttribute("layoutsubtree")||tt.setAttribute("layoutsubtree","true"),nt.parentNode!==tt){tt.appendChild(nt),d.add(v),tt.onpaint=yt=>{let Ct=yt.changedElements;for(let at of d)Ct.includes(at.image)&&(at.needsUpdate=!0)},tt.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,nt);else{let Ct=i.RGBA,at=i.RGBA,zt=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Ct,at,zt,nt)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Xt.length>0){if(Jt&&ne){let tt=ce(Xt[0]);e.texStorage2D(i.TEXTURE_2D,gt,St,tt.width,tt.height)}for(let tt=0,yt=Xt.length;tt<yt;tt++)_t=Xt[tt],Jt?B&&e.texSubImage2D(i.TEXTURE_2D,tt,0,0,xt,Gt,_t):e.texImage2D(i.TEXTURE_2D,tt,St,xt,Gt,_t);v.generateMipmaps=!1}else if(Jt){if(ne){let tt=ce(nt);e.texStorage2D(i.TEXTURE_2D,gt,St,tt.width,tt.height)}B&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,xt,Gt,nt)}else e.texImage2D(i.TEXTURE_2D,0,St,xt,Gt,nt);m(v)&&M(X),mt.__version=dt.version,v.onUpdate&&v.onUpdate(v)}C.__version=v.version}function Ot(C,v,G){if(v.image.length!==6)return;let X=q(C,v),K=v.source;e.bindTexture(i.TEXTURE_CUBE_MAP,C.__webglTexture,i.TEXTURE0+G);let dt=n.get(K);if(K.version!==dt.__version||X===!0){e.activeTexture(i.TEXTURE0+G);let mt=he.getPrimaries(he.workingColorSpace),Q=v.colorSpace===xi?null:he.getPrimaries(v.colorSpace),nt=v.colorSpace===xi||mt===Q?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,nt);let xt=v.isCompressedTexture||v.image[0].isCompressedTexture,Gt=v.image[0]&&v.image[0].isDataTexture,St=[];for(let at=0;at<6;at++)!xt&&!Gt?St[at]=p(v.image[at],!0,s.maxCubemapSize):St[at]=Gt?v.image[at].image:v.image[at],St[at]=pe(v,St[at]);let _t=St[0],Xt=r.convert(v.format,v.colorSpace),Jt=r.convert(v.type),ne=_(v.internalFormat,Xt,Jt,v.normalized,v.colorSpace),B=v.isVideoTexture!==!0,gt=dt.__version===void 0||X===!0,tt=K.dataReady,yt=S(v,_t);vt(i.TEXTURE_CUBE_MAP,v);let Ct;if(xt){B&&gt&&e.texStorage2D(i.TEXTURE_CUBE_MAP,yt,ne,_t.width,_t.height);for(let at=0;at<6;at++){Ct=St[at].mipmaps;for(let zt=0;zt<Ct.length;zt++){let Ft=Ct[zt];v.format!==Pn?Xt!==null?B?tt&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,zt,0,0,Ft.width,Ft.height,Xt,Ft.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,zt,ne,Ft.width,Ft.height,0,Ft.data):$t("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):B?tt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,zt,0,0,Ft.width,Ft.height,Xt,Jt,Ft.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,zt,ne,Ft.width,Ft.height,0,Xt,Jt,Ft.data)}}}else{if(Ct=v.mipmaps,B&&gt){Ct.length>0&&yt++;let at=ce(St[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,yt,ne,at.width,at.height)}for(let at=0;at<6;at++)if(Gt){B?tt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,0,0,St[at].width,St[at].height,Xt,Jt,St[at].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,ne,St[at].width,St[at].height,0,Xt,Jt,St[at].data);for(let zt=0;zt<Ct.length;zt++){let Pe=Ct[zt].image[at].image;B?tt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,zt+1,0,0,Pe.width,Pe.height,Xt,Jt,Pe.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,zt+1,ne,Pe.width,Pe.height,0,Xt,Jt,Pe.data)}}else{B?tt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,0,0,Xt,Jt,St[at]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,ne,Xt,Jt,St[at]);for(let zt=0;zt<Ct.length;zt++){let Ft=Ct[zt];B?tt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,zt+1,0,0,Xt,Jt,Ft.image[at]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,zt+1,ne,Xt,Jt,Ft.image[at])}}}m(v)&&M(i.TEXTURE_CUBE_MAP),dt.__version=K.version,v.onUpdate&&v.onUpdate(v)}C.__version=v.version}function Nt(C,v,G,X,K,dt){let mt=r.convert(G.format,G.colorSpace),Q=r.convert(G.type),nt=_(G.internalFormat,mt,Q,G.normalized,G.colorSpace),xt=n.get(v),Gt=n.get(G);if(Gt.__renderTarget=v,!xt.__hasExternalTextures){let St=Math.max(1,v.width>>dt),_t=Math.max(1,v.height>>dt);K===i.TEXTURE_3D||K===i.TEXTURE_2D_ARRAY?e.texImage3D(K,dt,nt,St,_t,v.depth,0,mt,Q,null):e.texImage2D(K,dt,nt,St,_t,0,mt,Q,null)}e.bindFramebuffer(i.FRAMEBUFFER,C),te(v)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,X,K,Gt.__webglTexture,0,Kt(v)):(K===i.TEXTURE_2D||K>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,X,K,Gt.__webglTexture,dt),e.bindFramebuffer(i.FRAMEBUFFER,null)}function oe(C,v,G){if(i.bindRenderbuffer(i.RENDERBUFFER,C),v.depthBuffer){let X=v.depthTexture,K=X&&X.isDepthTexture?X.type:null,dt=A(v.stencilBuffer,K),mt=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;te(v)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Kt(v),dt,v.width,v.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,Kt(v),dt,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,dt,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,mt,i.RENDERBUFFER,C)}else{let X=v.textures;for(let K=0;K<X.length;K++){let dt=X[K],mt=r.convert(dt.format,dt.colorSpace),Q=r.convert(dt.type),nt=_(dt.internalFormat,mt,Q,dt.normalized,dt.colorSpace);te(v)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Kt(v),nt,v.width,v.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,Kt(v),nt,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,nt,v.width,v.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function It(C,v,G){let X=v.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,C),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let K=n.get(v.depthTexture);if(K.__renderTarget=v,(!K.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),X){if(K.__webglInit===void 0&&(K.__webglInit=!0,v.depthTexture.addEventListener("dispose",w)),K.__webglTexture===void 0){K.__webglTexture=i.createTexture(),e.bindTexture(i.TEXTURE_CUBE_MAP,K.__webglTexture),vt(i.TEXTURE_CUBE_MAP,v.depthTexture);let xt=r.convert(v.depthTexture.format),Gt=r.convert(v.depthTexture.type),St;v.depthTexture.format===Jn?St=i.DEPTH_COMPONENT24:v.depthTexture.format===Oi&&(St=i.DEPTH24_STENCIL8);for(let _t=0;_t<6;_t++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_t,0,St,v.width,v.height,0,xt,Gt,null)}}else H(v.depthTexture,0);let dt=K.__webglTexture,mt=Kt(v),Q=X?i.TEXTURE_CUBE_MAP_POSITIVE_X+G:i.TEXTURE_2D,nt=v.depthTexture.format===Oi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(v.depthTexture.format===Jn)te(v)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,nt,Q,dt,0,mt):i.framebufferTexture2D(i.FRAMEBUFFER,nt,Q,dt,0);else if(v.depthTexture.format===Oi)te(v)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,nt,Q,dt,0,mt):i.framebufferTexture2D(i.FRAMEBUFFER,nt,Q,dt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function j(C){let v=n.get(C),G=C.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==C.depthTexture){let X=C.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),X){let K=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,X.removeEventListener("dispose",K)};X.addEventListener("dispose",K),v.__depthDisposeCallback=K}v.__boundDepthTexture=X}if(C.depthTexture&&!v.__autoAllocateDepthBuffer)if(G)for(let X=0;X<6;X++)It(v.__webglFramebuffer[X],C,X);else{let X=C.texture.mipmaps;X&&X.length>0?It(v.__webglFramebuffer[0],C,0):It(v.__webglFramebuffer,C,0)}else if(G){v.__webglDepthbuffer=[];for(let X=0;X<6;X++)if(e.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[X]),v.__webglDepthbuffer[X]===void 0)v.__webglDepthbuffer[X]=i.createRenderbuffer(),oe(v.__webglDepthbuffer[X],C,!1);else{let K=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,dt=v.__webglDepthbuffer[X];i.bindRenderbuffer(i.RENDERBUFFER,dt),i.framebufferRenderbuffer(i.FRAMEBUFFER,K,i.RENDERBUFFER,dt)}}else{let X=C.texture.mipmaps;if(X&&X.length>0?e.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=i.createRenderbuffer(),oe(v.__webglDepthbuffer,C,!1);else{let K=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,dt=v.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,dt),i.framebufferRenderbuffer(i.FRAMEBUFFER,K,i.RENDERBUFFER,dt)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function lt(C,v,G){let X=n.get(C);v!==void 0&&Nt(X.__webglFramebuffer,C,C.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),G!==void 0&&j(C)}function ct(C){let v=C.texture,G=n.get(C),X=n.get(v);C.addEventListener("dispose",x);let K=C.textures,dt=C.isWebGLCubeRenderTarget===!0,mt=K.length>1;if(mt||(X.__webglTexture===void 0&&(X.__webglTexture=i.createTexture()),X.__version=v.version,o.memory.textures++),dt){G.__webglFramebuffer=[];for(let Q=0;Q<6;Q++)if(v.mipmaps&&v.mipmaps.length>0){G.__webglFramebuffer[Q]=[];for(let nt=0;nt<v.mipmaps.length;nt++)G.__webglFramebuffer[Q][nt]=i.createFramebuffer()}else G.__webglFramebuffer[Q]=i.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){G.__webglFramebuffer=[];for(let Q=0;Q<v.mipmaps.length;Q++)G.__webglFramebuffer[Q]=i.createFramebuffer()}else G.__webglFramebuffer=i.createFramebuffer();if(mt)for(let Q=0,nt=K.length;Q<nt;Q++){let xt=n.get(K[Q]);xt.__webglTexture===void 0&&(xt.__webglTexture=i.createTexture(),o.memory.textures++)}if(C.samples>0&&te(C)===!1){G.__webglMultisampledFramebuffer=i.createFramebuffer(),G.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let Q=0;Q<K.length;Q++){let nt=K[Q];G.__webglColorRenderbuffer[Q]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,G.__webglColorRenderbuffer[Q]);let xt=r.convert(nt.format,nt.colorSpace),Gt=r.convert(nt.type),St=_(nt.internalFormat,xt,Gt,nt.normalized,nt.colorSpace,C.isXRRenderTarget===!0),_t=Kt(C);i.renderbufferStorageMultisample(i.RENDERBUFFER,_t,St,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Q,i.RENDERBUFFER,G.__webglColorRenderbuffer[Q])}i.bindRenderbuffer(i.RENDERBUFFER,null),C.depthBuffer&&(G.__webglDepthRenderbuffer=i.createRenderbuffer(),oe(G.__webglDepthRenderbuffer,C,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(dt){e.bindTexture(i.TEXTURE_CUBE_MAP,X.__webglTexture),vt(i.TEXTURE_CUBE_MAP,v);for(let Q=0;Q<6;Q++)if(v.mipmaps&&v.mipmaps.length>0)for(let nt=0;nt<v.mipmaps.length;nt++)Nt(G.__webglFramebuffer[Q][nt],C,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,nt);else Nt(G.__webglFramebuffer[Q],C,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0);m(v)&&M(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(mt){for(let Q=0,nt=K.length;Q<nt;Q++){let xt=K[Q],Gt=n.get(xt),St=i.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(St=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(St,Gt.__webglTexture),vt(St,xt),Nt(G.__webglFramebuffer,C,xt,i.COLOR_ATTACHMENT0+Q,St,0),m(xt)&&M(St)}e.unbindTexture()}else{let Q=i.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(Q=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(Q,X.__webglTexture),vt(Q,v),v.mipmaps&&v.mipmaps.length>0)for(let nt=0;nt<v.mipmaps.length;nt++)Nt(G.__webglFramebuffer[nt],C,v,i.COLOR_ATTACHMENT0,Q,nt);else Nt(G.__webglFramebuffer,C,v,i.COLOR_ATTACHMENT0,Q,0);m(v)&&M(Q),e.unbindTexture()}C.depthBuffer&&j(C)}function Et(C){let v=C.textures;for(let G=0,X=v.length;G<X;G++){let K=v[G];if(m(K)){let dt=E(C),mt=n.get(K).__webglTexture;e.bindTexture(dt,mt),M(dt),e.unbindTexture()}}}let Mt=[],Yt=[];function Ht(C){if(C.samples>0){if(te(C)===!1){let v=C.textures,G=C.width,X=C.height,K=i.COLOR_BUFFER_BIT,dt=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,mt=n.get(C),Q=v.length>1;if(Q)for(let xt=0;xt<v.length;xt++)e.bindFramebuffer(i.FRAMEBUFFER,mt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+xt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,mt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+xt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,mt.__webglMultisampledFramebuffer);let nt=C.texture.mipmaps;nt&&nt.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,mt.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,mt.__webglFramebuffer);for(let xt=0;xt<v.length;xt++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(K|=i.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(K|=i.STENCIL_BUFFER_BIT)),Q){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,mt.__webglColorRenderbuffer[xt]);let Gt=n.get(v[xt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Gt,0)}i.blitFramebuffer(0,0,G,X,0,0,G,X,K,i.NEAREST),c===!0&&(Mt.length=0,Yt.length=0,Mt.push(i.COLOR_ATTACHMENT0+xt),C.depthBuffer&&C.resolveDepthBuffer===!1&&(Mt.push(dt),Yt.push(dt),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Yt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Mt))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Q)for(let xt=0;xt<v.length;xt++){e.bindFramebuffer(i.FRAMEBUFFER,mt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+xt,i.RENDERBUFFER,mt.__webglColorRenderbuffer[xt]);let Gt=n.get(v[xt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,mt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+xt,i.TEXTURE_2D,Gt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,mt.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&c){let v=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[v])}}}function Kt(C){return Math.min(s.maxSamples,C.samples)}function te(C){let v=n.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function N(C){let v=o.render.frame;h.get(C)!==v&&(h.set(C,v),C.update())}function pe(C,v){let G=C.colorSpace,X=C.format,K=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||G!==ar&&G!==xi&&(he.getTransfer(G)===de?(X!==Pn||K!==pn)&&$t("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Zt("WebGLTextures: Unsupported texture color space:",G)),v}function ce(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(l.width=C.naturalWidth||C.width,l.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(l.width=C.displayWidth,l.height=C.displayHeight):(l.width=C.width,l.height=C.height),l}this.allocateTextureUnit=k,this.resetTextureUnits=U,this.getTextureUnits=O,this.setTextureUnits=D,this.setTexture2D=H,this.setTexture2DArray=Y,this.setTexture3D=J,this.setTextureCube=$,this.rebindTextures=lt,this.setupRenderTarget=ct,this.updateRenderTargetMipmap=Et,this.updateMultisampleRenderTarget=Ht,this.setupDepthRenderbuffer=j,this.setupFrameBufferTexture=Nt,this.useMultisampledRTT=te,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function u_(i,t){function e(n,s=xi){let r,o=he.getTransfer(s);if(n===pn)return i.UNSIGNED_BYTE;if(n===Ea)return i.UNSIGNED_SHORT_4_4_4_4;if(n===wa)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Dl)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Ul)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Pl)return i.BYTE;if(n===Ll)return i.SHORT;if(n===Os)return i.UNSIGNED_SHORT;if(n===ba)return i.INT;if(n===Gn)return i.UNSIGNED_INT;if(n===In)return i.FLOAT;if(n===ei)return i.HALF_FLOAT;if(n===Nl)return i.ALPHA;if(n===Fl)return i.RGB;if(n===Pn)return i.RGBA;if(n===Jn)return i.DEPTH_COMPONENT;if(n===Oi)return i.DEPTH_STENCIL;if(n===Ta)return i.RED;if(n===Aa)return i.RED_INTEGER;if(n===zi)return i.RG;if(n===Ra)return i.RG_INTEGER;if(n===Ca)return i.RGBA_INTEGER;if(n===Gr||n===kr||n===Vr||n===Wr)if(o===de)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Gr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===kr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Vr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Wr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Gr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===kr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Vr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Wr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ia||n===Pa||n===La||n===Da)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ia)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Pa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===La)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Da)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ua||n===Na||n===Fa||n===Ba||n===Oa||n===Xr||n===za)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Ua||n===Na)return o===de?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Fa)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Ba)return r.COMPRESSED_R11_EAC;if(n===Oa)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Xr)return r.COMPRESSED_RG11_EAC;if(n===za)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Ha||n===Ga||n===ka||n===Va||n===Wa||n===Xa||n===qa||n===Ya||n===Za||n===$a||n===Ja||n===Ka||n===Qa||n===ja)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ha)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ga)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===ka)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Va)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Wa)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Xa)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===qa)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ya)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Za)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===$a)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ja)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ka)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Qa)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===ja)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===tc||n===ec||n===nc)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===tc)return o===de?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===ec)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===nc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===ic||n===sc||n===qr||n===rc)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===ic)return r.COMPRESSED_RED_RGTC1_EXT;if(n===sc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===qr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===rc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===zs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var d_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,f_=`
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

}`,ih=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new yr(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new ln({vertexShader:d_,fragmentShader:f_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new ft(new Ee(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},sh=class extends Kn{constructor(t,e){super();let n=this,s=null,r=1,o=null,a="local-floor",c=1,l=null,h=null,d=null,u=null,f=null,g=null,y=typeof XRWebGLBinding<"u",p=new ih,m={},M=e.getContextAttributes(),E=null,_=null,A=[],S=[],w=new pt,x=null,b=new sn;b.viewport=new we;let R=new sn;R.viewport=new we;let I=[b,R],P=new xa,U=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let ot=A[q];return ot===void 0&&(ot=new Is,A[q]=ot),ot.getTargetRaySpace()},this.getControllerGrip=function(q){let ot=A[q];return ot===void 0&&(ot=new Is,A[q]=ot),ot.getGripSpace()},this.getHand=function(q){let ot=A[q];return ot===void 0&&(ot=new Is,A[q]=ot),ot.getHandSpace()};function D(q){let ot=S.indexOf(q.inputSource);if(ot===-1)return;let et=A[ot];et!==void 0&&(et.update(q.inputSource,q.frame,l||o),et.dispatchEvent({type:q.type,data:q.inputSource}))}function k(){s.removeEventListener("select",D),s.removeEventListener("selectstart",D),s.removeEventListener("selectend",D),s.removeEventListener("squeeze",D),s.removeEventListener("squeezestart",D),s.removeEventListener("squeezeend",D),s.removeEventListener("end",k),s.removeEventListener("inputsourceschange",F);for(let q=0;q<A.length;q++){let ot=S[q];ot!==null&&(S[q]=null,A[q].disconnect(ot))}U=null,O=null,p.reset();for(let q in m)delete m[q];t.setRenderTarget(E),f=null,u=null,d=null,s=null,_=null,vt.stop(),n.isPresenting=!1,t.setPixelRatio(x),t.setSize(w.width,w.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){r=q,n.isPresenting===!0&&$t("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){a=q,n.isPresenting===!0&&$t("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(q){l=q},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return d===null&&y&&(d=new XRWebGLBinding(s,e)),d},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(q){if(s=q,s!==null){if(E=t.getRenderTarget(),s.addEventListener("select",D),s.addEventListener("selectstart",D),s.addEventListener("selectend",D),s.addEventListener("squeeze",D),s.addEventListener("squeezestart",D),s.addEventListener("squeezeend",D),s.addEventListener("end",k),s.addEventListener("inputsourceschange",F),M.xrCompatible!==!0&&await e.makeXRCompatible(),x=t.getPixelRatio(),t.getSize(w),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let et=null,ut=null,Ot=null;M.depth&&(Ot=M.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,et=M.stencil?Oi:Jn,ut=M.stencil?zs:Gn);let Nt={colorFormat:e.RGBA8,depthFormat:Ot,scaleFactor:r};d=this.getBinding(),u=d.createProjectionLayer(Nt),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),_=new yn(u.textureWidth,u.textureHeight,{format:Pn,type:pn,depthTexture:new mi(u.textureWidth,u.textureHeight,ut,void 0,void 0,void 0,void 0,void 0,void 0,et),stencilBuffer:M.stencil,colorSpace:t.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}else{let et={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,e,et),s.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),_=new yn(f.framebufferWidth,f.framebufferHeight,{format:Pn,type:pn,colorSpace:t.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await s.requestReferenceSpace(a),vt.setContext(s),vt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function F(q){for(let ot=0;ot<q.removed.length;ot++){let et=q.removed[ot],ut=S.indexOf(et);ut>=0&&(S[ut]=null,A[ut].disconnect(et))}for(let ot=0;ot<q.added.length;ot++){let et=q.added[ot],ut=S.indexOf(et);if(ut===-1){for(let Nt=0;Nt<A.length;Nt++)if(Nt>=S.length){S.push(et),ut=Nt;break}else if(S[Nt]===null){S[Nt]=et,ut=Nt;break}if(ut===-1)break}let Ot=A[ut];Ot&&Ot.connect(et)}}let H=new L,Y=new L;function J(q,ot,et){H.setFromMatrixPosition(ot.matrixWorld),Y.setFromMatrixPosition(et.matrixWorld);let ut=H.distanceTo(Y),Ot=ot.projectionMatrix.elements,Nt=et.projectionMatrix.elements,oe=Ot[14]/(Ot[10]-1),It=Ot[14]/(Ot[10]+1),j=(Ot[9]+1)/Ot[5],lt=(Ot[9]-1)/Ot[5],ct=(Ot[8]-1)/Ot[0],Et=(Nt[8]+1)/Nt[0],Mt=oe*ct,Yt=oe*Et,Ht=ut/(-ct+Et),Kt=Ht*-ct;if(ot.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(Kt),q.translateZ(Ht),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),Ot[10]===-1)q.projectionMatrix.copy(ot.projectionMatrix),q.projectionMatrixInverse.copy(ot.projectionMatrixInverse);else{let te=oe+Ht,N=It+Ht,pe=Mt-Kt,ce=Yt+(ut-Kt),C=j*It/N*te,v=lt*It/N*te;q.projectionMatrix.makePerspective(pe,ce,C,v,te,N),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function $(q,ot){ot===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(ot.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(s===null)return;let ot=q.near,et=q.far;p.texture!==null&&(p.depthNear>0&&(ot=p.depthNear),p.depthFar>0&&(et=p.depthFar)),P.near=R.near=b.near=ot,P.far=R.far=b.far=et,(U!==P.near||O!==P.far)&&(s.updateRenderState({depthNear:P.near,depthFar:P.far}),U=P.near,O=P.far),P.layers.mask=q.layers.mask|6,b.layers.mask=P.layers.mask&-5,R.layers.mask=P.layers.mask&-3;let ut=q.parent,Ot=P.cameras;$(P,ut);for(let Nt=0;Nt<Ot.length;Nt++)$(Ot[Nt],ut);Ot.length===2?J(P,b,R):P.projectionMatrix.copy(b.projectionMatrix),st(q,P,ut)};function st(q,ot,et){et===null?q.matrix.copy(ot.matrixWorld):(q.matrix.copy(et.matrixWorld),q.matrix.invert(),q.matrix.multiply(ot.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(ot.projectionMatrix),q.projectionMatrixInverse.copy(ot.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=qo*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return P},this.getFoveation=function(){if(!(u===null&&f===null))return c},this.setFoveation=function(q){c=q,u!==null&&(u.fixedFoveation=q),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=q)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(P)},this.getCameraTexture=function(q){return m[q]};let rt=null;function Tt(q,ot){if(h=ot.getViewerPose(l||o),g=ot,h!==null){let et=h.views;f!==null&&(t.setRenderTargetFramebuffer(_,f.framebuffer),t.setRenderTarget(_));let ut=!1;et.length!==P.cameras.length&&(P.cameras.length=0,ut=!0);for(let It=0;It<et.length;It++){let j=et[It],lt=null;if(f!==null)lt=f.getViewport(j);else{let Et=d.getViewSubImage(u,j);lt=Et.viewport,It===0&&(t.setRenderTargetTextures(_,Et.colorTexture,Et.depthStencilTexture),t.setRenderTarget(_))}let ct=I[It];ct===void 0&&(ct=new sn,ct.layers.enable(It),ct.viewport=new we,I[It]=ct),ct.matrix.fromArray(j.transform.matrix),ct.matrix.decompose(ct.position,ct.quaternion,ct.scale),ct.projectionMatrix.fromArray(j.projectionMatrix),ct.projectionMatrixInverse.copy(ct.projectionMatrix).invert(),ct.viewport.set(lt.x,lt.y,lt.width,lt.height),It===0&&(P.matrix.copy(ct.matrix),P.matrix.decompose(P.position,P.quaternion,P.scale)),ut===!0&&P.cameras.push(ct)}let Ot=s.enabledFeatures;if(Ot&&Ot.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&y){d=n.getBinding();let It=d.getDepthInformation(et[0]);It&&It.isValid&&It.texture&&p.init(It,s.renderState)}if(Ot&&Ot.includes("camera-access")&&y){t.state.unbindTexture(),d=n.getBinding();for(let It=0;It<et.length;It++){let j=et[It].camera;if(j){let lt=m[j];lt||(lt=new yr,m[j]=lt);let ct=d.getCameraImage(j);lt.sourceTexture=ct}}}}for(let et=0;et<A.length;et++){let ut=S[et],Ot=A[et];ut!==null&&Ot!==void 0&&Ot.update(ut,ot,l||o)}rt&&rt(q,ot),ot.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ot}),g=null}let vt=new vd;vt.setAnimationLoop(Tt),this.setAnimationLoop=function(q){rt=q},this.dispose=function(){}}},p_=new ee,Td=new Qt;Td.set(-1,0,0,0,1,0,0,0,1);function m_(i,t){function e(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,Hl(i)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function s(p,m,M,E,_){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?r(p,m):m.isMeshLambertMaterial?(r(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(r(p,m),d(p,m)):m.isMeshPhongMaterial?(r(p,m),h(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(r(p,m),u(p,m),m.isMeshPhysicalMaterial&&f(p,m,_)):m.isMeshMatcapMaterial?(r(p,m),g(p,m)):m.isMeshDepthMaterial?r(p,m):m.isMeshDistanceMaterial?(r(p,m),y(p,m)):m.isMeshNormalMaterial?r(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?c(p,m,M,E):m.isSpriteMaterial?l(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,e(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===Ke&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,e(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===Ke&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,e(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,e(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let M=t.get(m),E=M.envMap,_=M.envMapRotation;E&&(p.envMap.value=E,p.envMapRotation.value.setFromMatrix4(p_.makeRotationFromEuler(_)).transpose(),E.isCubeTexture&&E.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(Td),p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function c(p,m,M,E){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*M,p.scale.value=E*.5,m.map&&(p.map.value=m.map,e(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function l(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function h(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function d(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function u(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function f(p,m,M){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Ke&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=M.texture,p.transmissionSamplerSize.value.set(M.width,M.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function y(p,m){let M=t.get(m).light;p.referencePosition.value.setFromMatrixPosition(M.matrixWorld),p.nearDistance.value=M.shadow.camera.near,p.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function g_(i,t,e,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(_,A){let S=A.program;n.uniformBlockBinding(_,S)}function l(_,A){let S=s[_.id];S===void 0&&(p(_),S=h(_),s[_.id]=S,_.addEventListener("dispose",M));let w=A.program;n.updateUBOMapping(_,w);let x=t.render.frame;r[_.id]!==x&&(u(_),r[_.id]=x)}function h(_){let A=d();_.__bindingPointIndex=A;let S=i.createBuffer(),w=_.__size,x=_.usage;return i.bindBuffer(i.UNIFORM_BUFFER,S),i.bufferData(i.UNIFORM_BUFFER,w,x),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,A,S),S}function d(){for(let _=0;_<a;_++)if(o.indexOf(_)===-1)return o.push(_),_;return Zt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(_){let A=s[_.id],S=_.uniforms,w=_.__cache;i.bindBuffer(i.UNIFORM_BUFFER,A);for(let x=0,b=S.length;x<b;x++){let R=S[x];if(Array.isArray(R))for(let I=0,P=R.length;I<P;I++)f(R[I],x,I,w);else f(R,x,0,w)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(_,A,S,w){if(y(_,A,S,w)===!0){let x=_.__offset,b=_.value;if(Array.isArray(b)){let R=0;for(let I=0;I<b.length;I++){let P=b[I],U=m(P);g(P,_.__data,R),typeof P!="number"&&typeof P!="boolean"&&!P.isMatrix3&&!ArrayBuffer.isView(P)&&(R+=U.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(b,_.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,x,_.__data)}}function g(_,A,S){typeof _=="number"||typeof _=="boolean"?A[0]=_:_.isMatrix3?(A[0]=_.elements[0],A[1]=_.elements[1],A[2]=_.elements[2],A[3]=0,A[4]=_.elements[3],A[5]=_.elements[4],A[6]=_.elements[5],A[7]=0,A[8]=_.elements[6],A[9]=_.elements[7],A[10]=_.elements[8],A[11]=0):ArrayBuffer.isView(_)?A.set(new _.constructor(_.buffer,_.byteOffset,A.length)):_.toArray(A,S)}function y(_,A,S,w){let x=_.value,b=A+"_"+S;if(w[b]===void 0)return typeof x=="number"||typeof x=="boolean"?w[b]=x:ArrayBuffer.isView(x)?w[b]=x.slice():w[b]=x.clone(),!0;{let R=w[b];if(typeof x=="number"||typeof x=="boolean"){if(R!==x)return w[b]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(R.equals(x)===!1)return R.copy(x),!0}}return!1}function p(_){let A=_.uniforms,S=0,w=16;for(let b=0,R=A.length;b<R;b++){let I=Array.isArray(A[b])?A[b]:[A[b]];for(let P=0,U=I.length;P<U;P++){let O=I[P],D=Array.isArray(O.value)?O.value:[O.value];for(let k=0,F=D.length;k<F;k++){let H=D[k],Y=m(H),J=S%w,$=J%Y.boundary,st=J+$;S+=$,st!==0&&w-st<Y.storage&&(S+=w-st),O.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=S,S+=Y.storage}}}let x=S%w;return x>0&&(S+=w-x),_.__size=S,_.__cache={},this}function m(_){let A={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(A.boundary=4,A.storage=4):_.isVector2?(A.boundary=8,A.storage=8):_.isVector3||_.isColor?(A.boundary=16,A.storage=12):_.isVector4?(A.boundary=16,A.storage=16):_.isMatrix3?(A.boundary=48,A.storage=48):_.isMatrix4?(A.boundary=64,A.storage=64):_.isTexture?$t("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(_)?(A.boundary=16,A.storage=_.byteLength):$t("WebGLRenderer: Unsupported uniform value type.",_),A}function M(_){let A=_.target;A.removeEventListener("dispose",M);let S=o.indexOf(A.__bindingPointIndex);o.splice(S,1),i.deleteBuffer(s[A.id]),delete s[A.id],delete r[A.id]}function E(){for(let _ in s)i.deleteBuffer(s[_]);o=[],s={},r={}}return{bind:c,update:l,dispose:E}}var x_=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),ni=null;function __(){return ni===null&&(ni=new gr(x_,16,16,zi,ei),ni.name="DFG_LUT",ni.minFilter=Je,ni.magFilter=Je,ni.wrapS=$n,ni.wrapT=$n,ni.generateMipmaps=!1,ni.needsUpdate=!0),ni}var uc=class{constructor(t={}){let{canvas:e=Gu(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:f=pn}=t;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=o;let y=f,p=new Set([Ca,Ra,Aa]),m=new Set([pn,Gn,Os,zs,Ea,wa]),M=new Uint32Array(4),E=new Int32Array(4),_=new L,A=null,S=null,w=[],x=[],b=null;this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Hn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let R=this,I=!1,P=null,U=null,O=null,D=null;this._outputColorSpace=De;let k=0,F=0,H=null,Y=-1,J=null,$=new we,st=new we,rt=null,Tt=new Vt(0),vt=0,q=e.width,ot=e.height,et=1,ut=null,Ot=null,Nt=new we(0,0,q,ot),oe=new we(0,0,q,ot),It=!1,j=new Ps,lt=!1,ct=!1,Et=new ee,Mt=new L,Yt=new we,Ht={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Kt=!1;function te(){return H===null?et:1}let N=n;function pe(T,z){return e.getContext(T,z)}try{let T={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"185"}`),e.addEventListener("webglcontextlost",Pe,!1),e.addEventListener("webglcontextrestored",ve,!1),e.addEventListener("webglcontextcreationerror",Wn,!1),N===null){let z="webgl2";if(N=pe(z,T),N===null)throw pe(z)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(T){throw Zt("WebGLRenderer: "+T.message),T}let ce,C,v,G,X,K,dt,mt,Q,nt,xt,Gt,St,_t,Xt,Jt,ne,B,gt,tt,yt,Ct,at;function zt(){ce=new wg(N),ce.init(),yt=new u_(N,ce),C=new xg(N,ce,t,yt),v=new l_(N,ce),C.reversedDepthBuffer&&u&&v.buffers.depth.setReversed(!0),U=N.createFramebuffer(),O=N.createFramebuffer(),D=N.createFramebuffer(),G=new Rg(N),X=new $x,K=new h_(N,ce,v,X,C,yt,G),dt=new Eg(R),mt=new Lp(N),Ct=new mg(N,mt),Q=new Tg(N,mt,G,Ct),nt=new Ig(N,Q,mt,Ct,G),B=new Cg(N,C,K),Xt=new _g(X),xt=new Zx(R,dt,ce,C,Ct,Xt),Gt=new m_(R,X),St=new Kx,_t=new i_(ce),ne=new pg(R,dt,v,nt,g,c),Jt=new c_(R,nt,C),at=new g_(N,G,C,v),gt=new gg(N,ce,G),tt=new Ag(N,ce,G),G.programs=xt.programs,R.capabilities=C,R.extensions=ce,R.properties=X,R.renderLists=St,R.shadowMap=Jt,R.state=v,R.info=G}zt(),y!==pn&&(b=new Lg(y,e.width,e.height,a,s,r));let Ft=new sh(R,N);this.xr=Ft,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){let T=ce.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=ce.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return et},this.setPixelRatio=function(T){T!==void 0&&(et=T,this.setSize(q,ot,!1))},this.getSize=function(T){return T.set(q,ot)},this.setSize=function(T,z,Z=!0){if(Ft.isPresenting){$t("WebGLRenderer: Can't change size while VR device is presenting.");return}q=T,ot=z,e.width=Math.floor(T*et),e.height=Math.floor(z*et),Z===!0&&(e.style.width=T+"px",e.style.height=z+"px"),b!==null&&b.setSize(e.width,e.height),this.setViewport(0,0,T,z)},this.getDrawingBufferSize=function(T){return T.set(q*et,ot*et).floor()},this.setDrawingBufferSize=function(T,z,Z){q=T,ot=z,et=Z,e.width=Math.floor(T*Z),e.height=Math.floor(z*Z),this.setViewport(0,0,T,z)},this.setEffects=function(T){if(y===pn){Zt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(T){for(let z=0;z<T.length;z++)if(T[z].isOutputPass===!0){$t("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}b.setEffects(T||[])},this.getCurrentViewport=function(T){return T.copy($)},this.getViewport=function(T){return T.copy(Nt)},this.setViewport=function(T,z,Z,V){T.isVector4?Nt.set(T.x,T.y,T.z,T.w):Nt.set(T,z,Z,V),v.viewport($.copy(Nt).multiplyScalar(et).round())},this.getScissor=function(T){return T.copy(oe)},this.setScissor=function(T,z,Z,V){T.isVector4?oe.set(T.x,T.y,T.z,T.w):oe.set(T,z,Z,V),v.scissor(st.copy(oe).multiplyScalar(et).round())},this.getScissorTest=function(){return It},this.setScissorTest=function(T){v.setScissorTest(It=T)},this.setOpaqueSort=function(T){ut=T},this.setTransparentSort=function(T){Ot=T},this.getClearColor=function(T){return T.copy(ne.getClearColor())},this.setClearColor=function(){ne.setClearColor(...arguments)},this.getClearAlpha=function(){return ne.getClearAlpha()},this.setClearAlpha=function(){ne.setClearAlpha(...arguments)},this.clear=function(T=!0,z=!0,Z=!0){let V=0;if(T){let W=!1;if(H!==null){let At=H.texture.format;W=p.has(At)}if(W){let At=H.texture.type,Ut=m.has(At),wt=ne.getClearColor(),Bt=ne.getClearAlpha(),kt=wt.r,ie=wt.g,ae=wt.b;Ut?(M[0]=kt,M[1]=ie,M[2]=ae,M[3]=Bt,N.clearBufferuiv(N.COLOR,0,M)):(E[0]=kt,E[1]=ie,E[2]=ae,E[3]=Bt,N.clearBufferiv(N.COLOR,0,E))}else V|=N.COLOR_BUFFER_BIT}z&&(V|=N.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Z&&(V|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),V!==0&&N.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(T){T.setRenderer(this),P=T},this.dispose=function(){e.removeEventListener("webglcontextlost",Pe,!1),e.removeEventListener("webglcontextrestored",ve,!1),e.removeEventListener("webglcontextcreationerror",Wn,!1),ne.dispose(),St.dispose(),_t.dispose(),X.dispose(),dt.dispose(),nt.dispose(),Ct.dispose(),at.dispose(),xt.dispose(),Ft.dispose(),Ft.removeEventListener("sessionstart",Th),Ft.removeEventListener("sessionend",Ah),Vi.stop()};function Pe(T){T.preventDefault(),Ol("WebGLRenderer: Context Lost."),I=!0}function ve(){Ol("WebGLRenderer: Context Restored."),I=!1;let T=G.autoReset,z=Jt.enabled,Z=Jt.autoUpdate,V=Jt.needsUpdate,W=Jt.type;zt(),G.autoReset=T,Jt.enabled=z,Jt.autoUpdate=Z,Jt.needsUpdate=V,Jt.type=W}function Wn(T){Zt("WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function Xn(T){let z=T.target;z.removeEventListener("dispose",Xn),_f(z)}function _f(T){yf(T),X.remove(T)}function yf(T){let z=X.get(T).programs;z!==void 0&&(z.forEach(function(Z){xt.releaseProgram(Z)}),T.isShaderMaterial&&xt.releaseShaderCache(T))}this.renderBufferDirect=function(T,z,Z,V,W,At){z===null&&(z=Ht);let Ut=W.isMesh&&W.matrixWorld.determinantAffine()<0,wt=Sf(T,z,Z,V,W);v.setMaterial(V,Ut);let Bt=Z.index,kt=1;if(V.wireframe===!0){if(Bt=Q.getWireframeAttribute(Z),Bt===void 0)return;kt=2}let ie=Z.drawRange,ae=Z.attributes.position,Wt=ie.start*kt,me=(ie.start+ie.count)*kt;At!==null&&(Wt=Math.max(Wt,At.start*kt),me=Math.min(me,(At.start+At.count)*kt)),Bt!==null?(Wt=Math.max(Wt,0),me=Math.min(me,Bt.count)):ae!=null&&(Wt=Math.max(Wt,0),me=Math.min(me,ae.count));let Ne=me-Wt;if(Ne<0||Ne===1/0)return;Ct.setup(W,V,wt,Z,Bt);let Le,_e=gt;if(Bt!==null&&(Le=mt.get(Bt),_e=tt,_e.setIndex(Le)),W.isMesh)V.wireframe===!0?(v.setLineWidth(V.wireframeLinewidth*te()),_e.setMode(N.LINES)):_e.setMode(N.TRIANGLES);else if(W.isLine){let tn=V.linewidth;tn===void 0&&(tn=1),v.setLineWidth(tn*te()),W.isLineSegments?_e.setMode(N.LINES):W.isLineLoop?_e.setMode(N.LINE_LOOP):_e.setMode(N.LINE_STRIP)}else W.isPoints?_e.setMode(N.POINTS):W.isSprite&&_e.setMode(N.TRIANGLES);if(W.isBatchedMesh)if(ce.get("WEBGL_multi_draw"))_e.renderMultiDraw(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount);else{let tn=W._multiDrawStarts,Dt=W._multiDrawCounts,gn=W._multiDrawCount,ue=Bt?mt.get(Bt).bytesPerElement:1,Tn=X.get(V).currentProgram.getUniforms();for(let qn=0;qn<gn;qn++)Tn.setValue(N,"_gl_DrawID",qn),_e.render(tn[qn]/ue,Dt[qn])}else if(W.isInstancedMesh)_e.renderInstances(Wt,Ne,W.count);else if(Z.isInstancedBufferGeometry){let tn=Z._maxInstanceCount!==void 0?Z._maxInstanceCount:1/0,Dt=Math.min(Z.instanceCount,tn);_e.renderInstances(Wt,Ne,Dt)}else _e.render(Wt,Ne)};function wh(T,z,Z){T.transparent===!0&&T.side===Ce&&T.forceSinglePass===!1?(T.side=Ke,T.needsUpdate=!0,lo(T,z,Z),T.side=fi,T.needsUpdate=!0,lo(T,z,Z),T.side=Ce):lo(T,z,Z)}this.compile=function(T,z,Z=null){Z===null&&(Z=T),S=_t.get(Z),S.init(z),x.push(S),Z.traverseVisible(function(W){W.isLight&&W.layers.test(z.layers)&&(S.pushLight(W),W.castShadow&&S.pushShadow(W))}),T!==Z&&T.traverseVisible(function(W){W.isLight&&W.layers.test(z.layers)&&(S.pushLight(W),W.castShadow&&S.pushShadow(W))}),S.setupLights();let V=new Set;return T.traverse(function(W){if(!(W.isMesh||W.isPoints||W.isLine||W.isSprite))return;let At=W.material;if(At)if(Array.isArray(At))for(let Ut=0;Ut<At.length;Ut++){let wt=At[Ut];wh(wt,Z,W),V.add(wt)}else wh(At,Z,W),V.add(At)}),S=x.pop(),V},this.compileAsync=function(T,z,Z=null){let V=this.compile(T,z,Z);return new Promise(W=>{function At(){if(V.forEach(function(Ut){X.get(Ut).currentProgram.isReady()&&V.delete(Ut)}),V.size===0){W(T);return}setTimeout(At,10)}ce.get("KHR_parallel_shader_compile")!==null?At():setTimeout(At,10)})};let Pc=null;function vf(T){Pc&&Pc(T)}function Th(){Vi.stop()}function Ah(){Vi.start()}let Vi=new vd;Vi.setAnimationLoop(vf),typeof self<"u"&&Vi.setContext(self),this.setAnimationLoop=function(T){Pc=T,Ft.setAnimationLoop(T),T===null?Vi.stop():Vi.start()},Ft.addEventListener("sessionstart",Th),Ft.addEventListener("sessionend",Ah),this.render=function(T,z){if(z!==void 0&&z.isCamera!==!0){Zt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;P!==null&&P.renderStart(T,z);let Z=Ft.enabled===!0&&Ft.isPresenting===!0,V=b!==null&&(H===null||Z)&&b.begin(R,H);if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),z.parent===null&&z.matrixWorldAutoUpdate===!0&&z.updateMatrixWorld(),Ft.enabled===!0&&Ft.isPresenting===!0&&(b===null||b.isCompositing()===!1)&&(Ft.cameraAutoUpdate===!0&&Ft.updateCamera(z),z=Ft.getCamera()),T.isScene===!0&&T.onBeforeRender(R,T,z,H),S=_t.get(T,x.length),S.init(z),S.state.textureUnits=K.getTextureUnits(),x.push(S),Et.multiplyMatrices(z.projectionMatrix,z.matrixWorldInverse),j.setFromProjectionMatrix(Et,zn,z.reversedDepth),ct=this.localClippingEnabled,lt=Xt.init(this.clippingPlanes,ct),A=St.get(T,w.length),A.init(),w.push(A),Ft.enabled===!0&&Ft.isPresenting===!0){let Ut=R.xr.getDepthSensingMesh();Ut!==null&&Lc(Ut,z,-1/0,R.sortObjects)}Lc(T,z,0,R.sortObjects),A.finish(),R.sortObjects===!0&&A.sort(ut,Ot,z.reversedDepth),Kt=Ft.enabled===!1||Ft.isPresenting===!1||Ft.hasDepthSensing()===!1,Kt&&ne.addToRenderList(A,T),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),lt===!0&&Xt.beginShadows();let W=S.state.shadowsArray;if(Jt.render(W,T,z),lt===!0&&Xt.endShadows(),(V&&b.hasRenderPass())===!1){let Ut=A.opaque,wt=A.transmissive;if(S.setupLights(),z.isArrayCamera){let Bt=z.cameras;if(wt.length>0)for(let kt=0,ie=Bt.length;kt<ie;kt++){let ae=Bt[kt];Ch(Ut,wt,T,ae)}Kt&&ne.render(T);for(let kt=0,ie=Bt.length;kt<ie;kt++){let ae=Bt[kt];Rh(A,T,ae,ae.viewport)}}else wt.length>0&&Ch(Ut,wt,T,z),Kt&&ne.render(T),Rh(A,T,z)}H!==null&&F===0&&(K.updateMultisampleRenderTarget(H),K.updateRenderTargetMipmap(H)),V&&b.end(R),T.isScene===!0&&T.onAfterRender(R,T,z),Ct.resetDefaultState(),Y=-1,J=null,x.pop(),x.length>0?(S=x[x.length-1],K.setTextureUnits(S.state.textureUnits),lt===!0&&Xt.setGlobalState(R.clippingPlanes,S.state.camera)):S=null,w.pop(),w.length>0?A=w[w.length-1]:A=null,P!==null&&P.renderEnd()};function Lc(T,z,Z,V){if(T.visible===!1)return;if(T.layers.test(z.layers)){if(T.isGroup)Z=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(z);else if(T.isLightProbeGrid)S.pushLightProbeGrid(T);else if(T.isLight)S.pushLight(T),T.castShadow&&S.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||j.intersectsSprite(T)){V&&Yt.setFromMatrixPosition(T.matrixWorld).applyMatrix4(Et);let Ut=nt.update(T),wt=T.material;wt.visible&&A.push(T,Ut,wt,Z,Yt.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||j.intersectsObject(T))){let Ut=nt.update(T),wt=T.material;if(V&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Yt.copy(T.boundingSphere.center)):(Ut.boundingSphere===null&&Ut.computeBoundingSphere(),Yt.copy(Ut.boundingSphere.center)),Yt.applyMatrix4(T.matrixWorld).applyMatrix4(Et)),Array.isArray(wt)){let Bt=Ut.groups;for(let kt=0,ie=Bt.length;kt<ie;kt++){let ae=Bt[kt],Wt=wt[ae.materialIndex];Wt&&Wt.visible&&A.push(T,Ut,Wt,Z,Yt.z,ae)}}else wt.visible&&A.push(T,Ut,wt,Z,Yt.z,null)}}let At=T.children;for(let Ut=0,wt=At.length;Ut<wt;Ut++)Lc(At[Ut],z,Z,V)}function Rh(T,z,Z,V){let{opaque:W,transmissive:At,transparent:Ut}=T;S.setupLightsView(Z),lt===!0&&Xt.setGlobalState(R.clippingPlanes,Z),V&&v.viewport($.copy(V)),W.length>0&&co(W,z,Z),At.length>0&&co(At,z,Z),Ut.length>0&&co(Ut,z,Z),v.buffers.depth.setTest(!0),v.buffers.depth.setMask(!0),v.buffers.color.setMask(!0),v.setPolygonOffset(!1)}function Ch(T,z,Z,V){if((Z.isScene===!0?Z.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[V.id]===void 0){let Wt=ce.has("EXT_color_buffer_half_float")||ce.has("EXT_color_buffer_float");S.state.transmissionRenderTarget[V.id]=new yn(1,1,{generateMipmaps:!0,type:Wt?ei:pn,minFilter:ti,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:he.workingColorSpace})}let At=S.state.transmissionRenderTarget[V.id],Ut=V.viewport||$;At.setSize(Ut.z*R.transmissionResolutionScale,Ut.w*R.transmissionResolutionScale);let wt=R.getRenderTarget(),Bt=R.getActiveCubeFace(),kt=R.getActiveMipmapLevel();R.setRenderTarget(At),R.getClearColor(Tt),vt=R.getClearAlpha(),vt<1&&R.setClearColor(16777215,.5),R.clear(),Kt&&ne.render(Z);let ie=R.toneMapping;R.toneMapping=Hn;let ae=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),S.setupLightsView(V),lt===!0&&Xt.setGlobalState(R.clippingPlanes,V),co(T,Z,V),K.updateMultisampleRenderTarget(At),K.updateRenderTargetMipmap(At),ce.has("WEBGL_multisampled_render_to_texture")===!1){let Wt=!1;for(let me=0,Ne=z.length;me<Ne;me++){let Le=z[me],{object:_e,geometry:tn,material:Dt,group:gn}=Le;if(Dt.side===Ce&&_e.layers.test(V.layers)){let ue=Dt.side;Dt.side=Ke,Dt.needsUpdate=!0,Ih(_e,Z,V,tn,Dt,gn),Dt.side=ue,Dt.needsUpdate=!0,Wt=!0}}Wt===!0&&(K.updateMultisampleRenderTarget(At),K.updateRenderTargetMipmap(At))}R.setRenderTarget(wt,Bt,kt),R.setClearColor(Tt,vt),ae!==void 0&&(V.viewport=ae),R.toneMapping=ie}function co(T,z,Z){let V=z.isScene===!0?z.overrideMaterial:null;for(let W=0,At=T.length;W<At;W++){let Ut=T[W],{object:wt,geometry:Bt,group:kt}=Ut,ie=Ut.material;ie.allowOverride===!0&&V!==null&&(ie=V),wt.layers.test(Z.layers)&&Ih(wt,z,Z,Bt,ie,kt)}}function Ih(T,z,Z,V,W,At){T.onBeforeRender(R,z,Z,V,W,At),T.modelViewMatrix.multiplyMatrices(Z.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),W.onBeforeRender(R,z,Z,V,T,At),W.transparent===!0&&W.side===Ce&&W.forceSinglePass===!1?(W.side=Ke,W.needsUpdate=!0,R.renderBufferDirect(Z,z,V,W,T,At),W.side=fi,W.needsUpdate=!0,R.renderBufferDirect(Z,z,V,W,T,At),W.side=Ce):R.renderBufferDirect(Z,z,V,W,T,At),T.onAfterRender(R,z,Z,V,W,At)}function lo(T,z,Z){z.isScene!==!0&&(z=Ht);let V=X.get(T),W=S.state.lights,At=S.state.shadowsArray,Ut=W.state.version,wt=xt.getParameters(T,W.state,At,z,Z,S.state.lightProbeGridArray),Bt=xt.getProgramCacheKey(wt),kt=V.programs;V.environment=T.isMeshStandardMaterial||T.isMeshLambertMaterial||T.isMeshPhongMaterial?z.environment:null,V.fog=z.fog;let ie=T.isMeshStandardMaterial||T.isMeshLambertMaterial&&!T.envMap||T.isMeshPhongMaterial&&!T.envMap;V.envMap=dt.get(T.envMap||V.environment,ie),V.envMapRotation=V.environment!==null&&T.envMap===null?z.environmentRotation:T.envMapRotation,kt===void 0&&(T.addEventListener("dispose",Xn),kt=new Map,V.programs=kt);let ae=kt.get(Bt);if(ae!==void 0){if(V.currentProgram===ae&&V.lightsStateVersion===Ut)return Lh(T,wt),ae}else wt.uniforms=xt.getUniforms(T),P!==null&&T.isNodeMaterial&&P.build(T,Z,wt),T.onBeforeCompile(wt,R),ae=xt.acquireProgram(wt,Bt),kt.set(Bt,ae),V.uniforms=wt.uniforms;let Wt=V.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Wt.clippingPlanes=Xt.uniform),Lh(T,wt),V.needsLights=Ef(T),V.lightsStateVersion=Ut,V.needsLights&&(Wt.ambientLightColor.value=W.state.ambient,Wt.lightProbe.value=W.state.probe,Wt.directionalLights.value=W.state.directional,Wt.directionalLightShadows.value=W.state.directionalShadow,Wt.spotLights.value=W.state.spot,Wt.spotLightShadows.value=W.state.spotShadow,Wt.rectAreaLights.value=W.state.rectArea,Wt.ltc_1.value=W.state.rectAreaLTC1,Wt.ltc_2.value=W.state.rectAreaLTC2,Wt.pointLights.value=W.state.point,Wt.pointLightShadows.value=W.state.pointShadow,Wt.hemisphereLights.value=W.state.hemi,Wt.directionalShadowMatrix.value=W.state.directionalShadowMatrix,Wt.spotLightMatrix.value=W.state.spotLightMatrix,Wt.spotLightMap.value=W.state.spotLightMap,Wt.pointShadowMatrix.value=W.state.pointShadowMatrix),V.lightProbeGrid=S.state.lightProbeGridArray.length>0,V.currentProgram=ae,V.uniformsList=null,ae}function Ph(T){if(T.uniformsList===null){let z=T.currentProgram.getUniforms();T.uniformsList=ks.seqWithValue(z.seq,T.uniforms)}return T.uniformsList}function Lh(T,z){let Z=X.get(T);Z.outputColorSpace=z.outputColorSpace,Z.batching=z.batching,Z.batchingColor=z.batchingColor,Z.instancing=z.instancing,Z.instancingColor=z.instancingColor,Z.instancingMorph=z.instancingMorph,Z.skinning=z.skinning,Z.morphTargets=z.morphTargets,Z.morphNormals=z.morphNormals,Z.morphColors=z.morphColors,Z.morphTargetsCount=z.morphTargetsCount,Z.numClippingPlanes=z.numClippingPlanes,Z.numIntersection=z.numClipIntersection,Z.vertexAlphas=z.vertexAlphas,Z.vertexTangents=z.vertexTangents,Z.toneMapping=z.toneMapping}function Mf(T,z){if(T.length===0)return null;if(T.length===1)return T[0].texture!==null?T[0]:null;_.setFromMatrixPosition(z.matrixWorld);for(let Z=0,V=T.length;Z<V;Z++){let W=T[Z];if(W.texture!==null&&W.boundingBox.containsPoint(_))return W}return null}function Sf(T,z,Z,V,W){z.isScene!==!0&&(z=Ht),K.resetTextureUnits();let At=z.fog,Ut=V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial?z.environment:null,wt=H===null?R.outputColorSpace:H.isXRRenderTarget===!0?H.texture.colorSpace:he.workingColorSpace,Bt=V.isMeshStandardMaterial||V.isMeshLambertMaterial&&!V.envMap||V.isMeshPhongMaterial&&!V.envMap,kt=dt.get(V.envMap||Ut,Bt),ie=V.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,ae=!!Z.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Wt=!!Z.morphAttributes.position,me=!!Z.morphAttributes.normal,Ne=!!Z.morphAttributes.color,Le=Hn;V.toneMapped&&(H===null||H.isXRRenderTarget===!0)&&(Le=R.toneMapping);let _e=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,tn=_e!==void 0?_e.length:0,Dt=X.get(V),gn=S.state.lights;if(lt===!0&&(ct===!0||T!==J)){let Me=T===J&&V.id===Y;Xt.setState(V,T,Me)}let ue=!1;V.version===Dt.__version?(Dt.needsLights&&Dt.lightsStateVersion!==gn.state.version||Dt.outputColorSpace!==wt||W.isBatchedMesh&&Dt.batching===!1||!W.isBatchedMesh&&Dt.batching===!0||W.isBatchedMesh&&Dt.batchingColor===!0&&W.colorTexture===null||W.isBatchedMesh&&Dt.batchingColor===!1&&W.colorTexture!==null||W.isInstancedMesh&&Dt.instancing===!1||!W.isInstancedMesh&&Dt.instancing===!0||W.isSkinnedMesh&&Dt.skinning===!1||!W.isSkinnedMesh&&Dt.skinning===!0||W.isInstancedMesh&&Dt.instancingColor===!0&&W.instanceColor===null||W.isInstancedMesh&&Dt.instancingColor===!1&&W.instanceColor!==null||W.isInstancedMesh&&Dt.instancingMorph===!0&&W.morphTexture===null||W.isInstancedMesh&&Dt.instancingMorph===!1&&W.morphTexture!==null||Dt.envMap!==kt||V.fog===!0&&Dt.fog!==At||Dt.numClippingPlanes!==void 0&&(Dt.numClippingPlanes!==Xt.numPlanes||Dt.numIntersection!==Xt.numIntersection)||Dt.vertexAlphas!==ie||Dt.vertexTangents!==ae||Dt.morphTargets!==Wt||Dt.morphNormals!==me||Dt.morphColors!==Ne||Dt.toneMapping!==Le||Dt.morphTargetsCount!==tn||!!Dt.lightProbeGrid!=S.state.lightProbeGridArray.length>0)&&(ue=!0):(ue=!0,Dt.__version=V.version);let Tn=Dt.currentProgram;ue===!0&&(Tn=lo(V,z,W),P&&V.isNodeMaterial&&P.onUpdateProgram(V,Tn,Dt));let qn=!1,vi=!1,ls=!1,ye=Tn.getUniforms(),Fe=Dt.uniforms;if(v.useProgram(Tn.program)&&(qn=!0,vi=!0,ls=!0),V.id!==Y&&(Y=V.id,vi=!0),Dt.needsLights){let Me=Mf(S.state.lightProbeGridArray,W);Dt.lightProbeGrid!==Me&&(Dt.lightProbeGrid=Me,vi=!0)}if(qn||J!==T){v.buffers.depth.getReversed()&&T.reversedDepth!==!0&&(T._reversedDepth=!0,T.updateProjectionMatrix()),ye.setValue(N,"projectionMatrix",T.projectionMatrix),ye.setValue(N,"viewMatrix",T.matrixWorldInverse);let Si=ye.map.cameraPosition;Si!==void 0&&Si.setValue(N,Mt.setFromMatrixPosition(T.matrixWorld)),C.logarithmicDepthBuffer&&ye.setValue(N,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&ye.setValue(N,"isOrthographic",T.isOrthographicCamera===!0),J!==T&&(J=T,vi=!0,ls=!0)}if(Dt.needsLights&&(gn.state.directionalShadowMap.length>0&&ye.setValue(N,"directionalShadowMap",gn.state.directionalShadowMap,K),gn.state.spotShadowMap.length>0&&ye.setValue(N,"spotShadowMap",gn.state.spotShadowMap,K),gn.state.pointShadowMap.length>0&&ye.setValue(N,"pointShadowMap",gn.state.pointShadowMap,K)),W.isSkinnedMesh){ye.setOptional(N,W,"bindMatrix"),ye.setOptional(N,W,"bindMatrixInverse");let Me=W.skeleton;Me&&(Me.boneTexture===null&&Me.computeBoneTexture(),ye.setValue(N,"boneTexture",Me.boneTexture,K))}W.isBatchedMesh&&(ye.setOptional(N,W,"batchingTexture"),ye.setValue(N,"batchingTexture",W._matricesTexture,K),ye.setOptional(N,W,"batchingIdTexture"),ye.setValue(N,"batchingIdTexture",W._indirectTexture,K),ye.setOptional(N,W,"batchingColorTexture"),W._colorsTexture!==null&&ye.setValue(N,"batchingColorTexture",W._colorsTexture,K));let Mi=Z.morphAttributes;if((Mi.position!==void 0||Mi.normal!==void 0||Mi.color!==void 0)&&B.update(W,Z,Tn),(vi||Dt.receiveShadow!==W.receiveShadow)&&(Dt.receiveShadow=W.receiveShadow,ye.setValue(N,"receiveShadow",W.receiveShadow)),(V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial)&&V.envMap===null&&z.environment!==null&&(Fe.envMapIntensity.value=z.environmentIntensity),Fe.dfgLUT!==void 0&&(Fe.dfgLUT.value=__()),vi){if(ye.setValue(N,"toneMappingExposure",R.toneMappingExposure),Dt.needsLights&&bf(Fe,ls),At&&V.fog===!0&&Gt.refreshFogUniforms(Fe,At),Gt.refreshMaterialUniforms(Fe,V,et,ot,S.state.transmissionRenderTarget[T.id]),Dt.needsLights&&Dt.lightProbeGrid){let Me=Dt.lightProbeGrid;Fe.probesSH.value=Me.texture,Fe.probesMin.value.copy(Me.boundingBox.min),Fe.probesMax.value.copy(Me.boundingBox.max),Fe.probesResolution.value.copy(Me.resolution)}ks.upload(N,Ph(Dt),Fe,K)}if(V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(ks.upload(N,Ph(Dt),Fe,K),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&ye.setValue(N,"center",W.center),ye.setValue(N,"modelViewMatrix",W.modelViewMatrix),ye.setValue(N,"normalMatrix",W.normalMatrix),ye.setValue(N,"modelMatrix",W.matrixWorld),V.uniformsGroups!==void 0){let Me=V.uniformsGroups;for(let Si=0,hs=Me.length;Si<hs;Si++){let Dh=Me[Si];at.update(Dh,Tn),at.bind(Dh,Tn)}}return Tn}function bf(T,z){T.ambientLightColor.needsUpdate=z,T.lightProbe.needsUpdate=z,T.directionalLights.needsUpdate=z,T.directionalLightShadows.needsUpdate=z,T.pointLights.needsUpdate=z,T.pointLightShadows.needsUpdate=z,T.spotLights.needsUpdate=z,T.spotLightShadows.needsUpdate=z,T.rectAreaLights.needsUpdate=z,T.hemisphereLights.needsUpdate=z}function Ef(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return k},this.getActiveMipmapLevel=function(){return F},this.getRenderTarget=function(){return H},this.setRenderTargetTextures=function(T,z,Z){let V=X.get(T);V.__autoAllocateDepthBuffer=T.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),X.get(T.texture).__webglTexture=z,X.get(T.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:Z,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(T,z){let Z=X.get(T);Z.__webglFramebuffer=z,Z.__useDefaultFramebuffer=z===void 0},this.setRenderTarget=function(T,z=0,Z=0){H=T,k=z,F=Z;let V=null,W=!1,At=!1;if(T){let wt=X.get(T);if(wt.__useDefaultFramebuffer!==void 0){v.bindFramebuffer(N.FRAMEBUFFER,wt.__webglFramebuffer),$.copy(T.viewport),st.copy(T.scissor),rt=T.scissorTest,v.viewport($),v.scissor(st),v.setScissorTest(rt),Y=-1;return}else if(wt.__webglFramebuffer===void 0)K.setupRenderTarget(T);else if(wt.__hasExternalTextures)K.rebindTextures(T,X.get(T.texture).__webglTexture,X.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let ie=T.depthTexture;if(wt.__boundDepthTexture!==ie){if(ie!==null&&X.has(ie)&&(T.width!==ie.image.width||T.height!==ie.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");K.setupDepthRenderbuffer(T)}}let Bt=T.texture;(Bt.isData3DTexture||Bt.isDataArrayTexture||Bt.isCompressedArrayTexture)&&(At=!0);let kt=X.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(kt[z])?V=kt[z][Z]:V=kt[z],W=!0):T.samples>0&&K.useMultisampledRTT(T)===!1?V=X.get(T).__webglMultisampledFramebuffer:Array.isArray(kt)?V=kt[Z]:V=kt,$.copy(T.viewport),st.copy(T.scissor),rt=T.scissorTest}else $.copy(Nt).multiplyScalar(et).floor(),st.copy(oe).multiplyScalar(et).floor(),rt=It;if(Z!==0&&(V=U),v.bindFramebuffer(N.FRAMEBUFFER,V)&&v.drawBuffers(T,V),v.viewport($),v.scissor(st),v.setScissorTest(rt),W){let wt=X.get(T.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+z,wt.__webglTexture,Z)}else if(At){let wt=z;for(let Bt=0;Bt<T.textures.length;Bt++){let kt=X.get(T.textures[Bt]);N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+Bt,kt.__webglTexture,Z,wt)}}else if(T!==null&&Z!==0){let wt=X.get(T.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,wt.__webglTexture,Z)}Y=-1},this.readRenderTargetPixels=function(T,z,Z,V,W,At,Ut,wt=0){if(!(T&&T.isWebGLRenderTarget)){Zt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Bt=X.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Ut!==void 0&&(Bt=Bt[Ut]),Bt){v.bindFramebuffer(N.FRAMEBUFFER,Bt);try{let kt=T.textures[wt],ie=kt.format,ae=kt.type;if(T.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+wt),!C.textureFormatReadable(ie)){Zt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!C.textureTypeReadable(ae)){Zt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}z>=0&&z<=T.width-V&&Z>=0&&Z<=T.height-W&&N.readPixels(z,Z,V,W,yt.convert(ie),yt.convert(ae),At)}finally{let kt=H!==null?X.get(H).__webglFramebuffer:null;v.bindFramebuffer(N.FRAMEBUFFER,kt)}}},this.readRenderTargetPixelsAsync=async function(T,z,Z,V,W,At,Ut,wt=0){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Bt=X.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Ut!==void 0&&(Bt=Bt[Ut]),Bt)if(z>=0&&z<=T.width-V&&Z>=0&&Z<=T.height-W){v.bindFramebuffer(N.FRAMEBUFFER,Bt);let kt=T.textures[wt],ie=kt.format,ae=kt.type;if(T.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+wt),!C.textureFormatReadable(ie))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!C.textureTypeReadable(ae))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Wt=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,Wt),N.bufferData(N.PIXEL_PACK_BUFFER,At.byteLength,N.STREAM_READ),N.readPixels(z,Z,V,W,yt.convert(ie),yt.convert(ae),0);let me=H!==null?X.get(H).__webglFramebuffer:null;v.bindFramebuffer(N.FRAMEBUFFER,me);let Ne=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await Vu(N,Ne,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,Wt),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,At),N.deleteBuffer(Wt),N.deleteSync(Ne),At}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(T,z=null,Z=0){let V=Math.pow(2,-Z),W=Math.floor(T.image.width*V),At=Math.floor(T.image.height*V),Ut=z!==null?z.x:0,wt=z!==null?z.y:0;K.setTexture2D(T,0),N.copyTexSubImage2D(N.TEXTURE_2D,Z,0,0,Ut,wt,W,At),v.unbindTexture()},this.copyTextureToTexture=function(T,z,Z=null,V=null,W=0,At=0){let Ut,wt,Bt,kt,ie,ae,Wt,me,Ne,Le=T.isCompressedTexture?T.mipmaps[At]:T.image;if(Z!==null)Ut=Z.max.x-Z.min.x,wt=Z.max.y-Z.min.y,Bt=Z.isBox3?Z.max.z-Z.min.z:1,kt=Z.min.x,ie=Z.min.y,ae=Z.isBox3?Z.min.z:0;else{let Fe=Math.pow(2,-W);Ut=Math.floor(Le.width*Fe),wt=Math.floor(Le.height*Fe),T.isDataArrayTexture?Bt=Le.depth:T.isData3DTexture?Bt=Math.floor(Le.depth*Fe):Bt=1,kt=0,ie=0,ae=0}V!==null?(Wt=V.x,me=V.y,Ne=V.z):(Wt=0,me=0,Ne=0);let _e=yt.convert(z.format),tn=yt.convert(z.type),Dt;z.isData3DTexture?(K.setTexture3D(z,0),Dt=N.TEXTURE_3D):z.isDataArrayTexture||z.isCompressedArrayTexture?(K.setTexture2DArray(z,0),Dt=N.TEXTURE_2D_ARRAY):(K.setTexture2D(z,0),Dt=N.TEXTURE_2D),v.activeTexture(N.TEXTURE0),v.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,z.flipY),v.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,z.premultiplyAlpha),v.pixelStorei(N.UNPACK_ALIGNMENT,z.unpackAlignment);let gn=v.getParameter(N.UNPACK_ROW_LENGTH),ue=v.getParameter(N.UNPACK_IMAGE_HEIGHT),Tn=v.getParameter(N.UNPACK_SKIP_PIXELS),qn=v.getParameter(N.UNPACK_SKIP_ROWS),vi=v.getParameter(N.UNPACK_SKIP_IMAGES);v.pixelStorei(N.UNPACK_ROW_LENGTH,Le.width),v.pixelStorei(N.UNPACK_IMAGE_HEIGHT,Le.height),v.pixelStorei(N.UNPACK_SKIP_PIXELS,kt),v.pixelStorei(N.UNPACK_SKIP_ROWS,ie),v.pixelStorei(N.UNPACK_SKIP_IMAGES,ae);let ls=T.isDataArrayTexture||T.isData3DTexture,ye=z.isDataArrayTexture||z.isData3DTexture;if(T.isDepthTexture){let Fe=X.get(T),Mi=X.get(z),Me=X.get(Fe.__renderTarget),Si=X.get(Mi.__renderTarget);v.bindFramebuffer(N.READ_FRAMEBUFFER,Me.__webglFramebuffer),v.bindFramebuffer(N.DRAW_FRAMEBUFFER,Si.__webglFramebuffer);for(let hs=0;hs<Bt;hs++)ls&&(N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,X.get(T).__webglTexture,W,ae+hs),N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,X.get(z).__webglTexture,At,Ne+hs)),N.blitFramebuffer(kt,ie,Ut,wt,Wt,me,Ut,wt,N.DEPTH_BUFFER_BIT,N.NEAREST);v.bindFramebuffer(N.READ_FRAMEBUFFER,null),v.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else if(W!==0||T.isRenderTargetTexture||X.has(T)){let Fe=X.get(T),Mi=X.get(z);v.bindFramebuffer(N.READ_FRAMEBUFFER,O),v.bindFramebuffer(N.DRAW_FRAMEBUFFER,D);for(let Me=0;Me<Bt;Me++)ls?N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Fe.__webglTexture,W,ae+Me):N.framebufferTexture2D(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,Fe.__webglTexture,W),ye?N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Mi.__webglTexture,At,Ne+Me):N.framebufferTexture2D(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,Mi.__webglTexture,At),W!==0?N.blitFramebuffer(kt,ie,Ut,wt,Wt,me,Ut,wt,N.COLOR_BUFFER_BIT,N.NEAREST):ye?N.copyTexSubImage3D(Dt,At,Wt,me,Ne+Me,kt,ie,Ut,wt):N.copyTexSubImage2D(Dt,At,Wt,me,kt,ie,Ut,wt);v.bindFramebuffer(N.READ_FRAMEBUFFER,null),v.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else ye?T.isDataTexture||T.isData3DTexture?N.texSubImage3D(Dt,At,Wt,me,Ne,Ut,wt,Bt,_e,tn,Le.data):z.isCompressedArrayTexture?N.compressedTexSubImage3D(Dt,At,Wt,me,Ne,Ut,wt,Bt,_e,Le.data):N.texSubImage3D(Dt,At,Wt,me,Ne,Ut,wt,Bt,_e,tn,Le):T.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,At,Wt,me,Ut,wt,_e,tn,Le.data):T.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,At,Wt,me,Le.width,Le.height,_e,Le.data):N.texSubImage2D(N.TEXTURE_2D,At,Wt,me,Ut,wt,_e,tn,Le);v.pixelStorei(N.UNPACK_ROW_LENGTH,gn),v.pixelStorei(N.UNPACK_IMAGE_HEIGHT,ue),v.pixelStorei(N.UNPACK_SKIP_PIXELS,Tn),v.pixelStorei(N.UNPACK_SKIP_ROWS,qn),v.pixelStorei(N.UNPACK_SKIP_IMAGES,vi),At===0&&z.generateMipmaps&&N.generateMipmap(Dt),v.unbindTexture()},this.initRenderTarget=function(T){X.get(T).__webglFramebuffer===void 0&&K.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?K.setTextureCube(T,0):T.isData3DTexture?K.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?K.setTexture2DArray(T,0):K.setTexture2D(T,0),v.unbindTexture()},this.resetState=function(){k=0,F=0,H=null,v.reset(),Ct.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return zn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=he._getDrawingBufferColorSpace(t),e.unpackColorSpace=he._getUnpackColorSpace()}};function y_(i){let t=i>>>0;return()=>{t+=1831565813;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var hn=y_(19870219),it=(i,t)=>i+hn()*(t-i),ze=i=>i[hn()*i.length|0],Sn=i=>hn()<i,si=i=>"#"+i.toString(16).padStart(6,"0"),Ye={sun:16766116,skyTop:4159147,skyMid:9681362,skyHaze:14472125,cloud:16774112,asphalt:5066580,paver:11577496,kerb:11907236,conc:11052187,trim:14209731,glassBlue:6058371,glassGrey:6976122,leafDark:2833697,leafMid:4875312,leafLight:7768383,trunk:5457981,yellow:14201930};function Ln(i){let t=document.createElement("canvas");return t.width=t.height=i,[t,t.getContext("2d")]}function Dn(i,t,e=!0){let n=new Qn(i);return n.wrapS=n.wrapT=ws,t&&n.repeat.set(t[0],t[1]),e&&(n.colorSpace=De),n.anisotropy=4,n}function Xs(i,t,e,n){for(let s=0;s<t;s++){let r=(hn()*2-1)*e;i.fillStyle=`rgba(${r>0?255:0},${r>0?255:0},${r>0?255:0},${Math.abs(r)/255})`,i.fillRect(hn()*n|0,hn()*n|0,1+(hn()*2|0),1+(hn()*2|0))}}function Ad(){let[t,e]=Ln(256);e.fillStyle=si(Ye.asphalt),e.fillRect(0,0,256,256);for(let n=0;n<5200;n++){let s=it(-24,24);e.fillStyle=`rgba(${128+s},${128+s},${130+s},${it(.05,.24)})`,e.fillRect(it(0,256),it(0,256),it(1,2.6),it(1,2.6))}for(let n=0;n<8;n++){e.strokeStyle=`rgba(28,28,30,${it(.15,.4)})`,e.lineWidth=it(.8,2.4),e.beginPath();let s=it(0,256),r=it(0,256);e.moveTo(s,r);for(let o=0;o<6;o++)s+=it(-40,40),r+=it(-40,40),e.lineTo(s,r);e.stroke()}return Dn(t,[30,30])}function Rd(){let[t,e]=Ln(256);e.fillStyle=si(Ye.paver),e.fillRect(0,0,256,256);let n=3,s=256/n;for(let r=0;r<n;r++)for(let o=0;o<n;o++){let a=it(-13,11);e.fillStyle=`rgb(${178+a},${170+a},${154+a})`,e.fillRect(o*s+1.6,r*s+1.6,s-3.2,s-3.2);for(let c=0;c<260;c++){let l=it(-30,26);e.fillStyle=`rgba(${170+l},${163+l},${148+l},${it(.2,.6)})`,e.fillRect(o*s+it(2,s-3),r*s+it(2,s-3),it(1,2.4),it(1,2.4))}}return Xs(e,2600,18,256),Dn(t,[1,1])}function Gi(i,t=.55){let[n,s]=Ln(256);s.fillStyle=si(i),s.fillRect(0,0,256,256);for(let r=0;r<24;r++){let o=it(0,256),a=it(0,256),c=it(18,70),l=s.createRadialGradient(o,a,0,o,a,c);l.addColorStop(0,`rgba(0,0,0,${it(.02,.07)*t})`),l.addColorStop(1,"rgba(0,0,0,0)"),s.fillStyle=l,s.fillRect(0,0,256,256)}for(let r=0;r<34;r++){let o=it(.6,2.6),a=it(30,170),c=it(0,256),l=it(0,256*.5),h=s.createLinearGradient(0,l,0,l+a);h.addColorStop(0,`rgba(54,48,40,${it(.05,.15)*t})`),h.addColorStop(1,"rgba(54,48,40,0)"),s.fillStyle=h,s.fillRect(c,l,o,a)}return Xs(s,4800,24,256),Dn(n,[1,1])}function qs(i,t,e=8){let[s,r]=Ln(256),o=256/e;r.fillStyle=si(i),r.fillRect(0,0,256,256);for(let a=0;a<e;a++){for(let l=0;l<8;l++){let h=it(-26,30);r.fillStyle=`rgba(${118+h},${138+h},${156+h},${it(.25,.75)})`,r.fillRect(l*(256/8)+1,a*o+2,256/8-2,o*.62)}r.fillStyle=si(t),r.fillRect(0,a*o+o*.66,256,o*.3);let c=r.createLinearGradient(0,a*o,0,a*o+o*.62);c.addColorStop(0,"rgba(232,243,251,0.52)"),c.addColorStop(1,"rgba(232,243,251,0.06)"),r.fillStyle=c,r.fillRect(0,a*o+2,256,o*.6)}r.fillStyle=si(t);for(let a=0;a<=8;a++)r.fillRect(a*(256/8)-1.2,0,2.4,256);return Dn(s,[1,1])}function pc(){let[t,e]=Ln(256);e.fillStyle="#2f3438",e.fillRect(0,0,256,256);let n=6,s=256/n;for(let r=0;r<n;r++){let o=it(0,1),a=o>.72?[232,214,178]:o>.4?[206,200,190]:[176,182,186];e.fillStyle=`rgb(${a[0]},${a[1]},${a[2]})`,e.fillRect(r*s+3,16,s-6,194),e.fillStyle=`rgba(40,38,34,${it(.18,.4)})`,e.fillRect(r*s+3,16,s-6,it(20,60));let c=e.createLinearGradient(r*s,0,r*s+s,256);c.addColorStop(0,"rgba(255,255,255,0.22)"),c.addColorStop(.5,"rgba(255,255,255,0.02)"),c.addColorStop(1,"rgba(255,255,255,0.14)"),e.fillStyle=c,e.fillRect(r*s+3,16,s-6,194),e.fillStyle="#23272a",e.fillRect(r*s-2,0,4,256)}return e.fillStyle="#3a3f43",e.fillRect(0,0,256,16),e.fillStyle="#5b5554",e.fillRect(0,210,256,46),Xs(e,1800,16,256),Dn(t,[1,1])}function Cd(){let[t,e]=Ln(256);e.fillStyle="#7d4f42",e.fillRect(0,0,256,256);for(let r=0;r<4200;r++){let o=it(-20,22);e.fillStyle=`rgba(${142+o},${94+o},${78+o},${it(.15,.5)})`,e.fillRect(it(0,256),it(0,256),it(1,2.4),it(1,2.4))}let n=9,s=256/n;for(let r=0;r<n;r++){e.fillStyle="rgba(38,44,50,0.86)",e.fillRect(r*s+s*.3,0,s*.4,256);let o=e.createLinearGradient(r*s,0,r*s+s,0);o.addColorStop(0,"rgba(198,214,226,0.16)"),o.addColorStop(1,"rgba(198,214,226,0)"),e.fillStyle=o,e.fillRect(r*s+s*.3,0,s*.4,256)}for(let r=0;r<8;r++)e.fillStyle="rgba(104,68,58,0.9)",e.fillRect(0,r*(256/8)-2,256,4);return Dn(t,[1,1])}function rh(){let[t,e]=Ln(256);e.fillStyle="#8ea6b8",e.fillRect(0,0,256,256);let n=12,s=256/n;for(let r=0;r<n;r++){for(let a=0;a<10;a++){let c=it(-24,26);e.fillStyle=`rgba(${132+c},${154+c},${172+c},${it(.3,.8)})`,e.fillRect(a*(256/10)+1,r*s+1,256/10-2,s*.72)}e.fillStyle="#6b757e",e.fillRect(0,r*s+s*.76,256,s*.22);let o=e.createLinearGradient(0,r*s,0,r*s+s*.72);o.addColorStop(0,"rgba(236,245,252,0.42)"),o.addColorStop(1,"rgba(236,245,252,0.04)"),e.fillStyle=o,e.fillRect(0,r*s+1,256,s*.7)}for(let r=0;r<=10;r++)e.fillStyle="#767f88",e.fillRect(r*(256/10)-1,0,2,256);return Dn(t,[1,1])}function mc(i){let[e,n]=Ln(256);n.fillStyle=si(i),n.fillRect(0,0,256,256);for(let c=0;c<3600;c++){let l=it(-18,16);n.fillStyle=`rgba(${168+l},${160+l},${146+l},${it(.12,.4)})`,n.fillRect(it(0,256),it(0,256),it(1,2.2),it(1,2.2))}let s=7,r=8,o=256/s,a=256/r;for(let c=0;c<r;c++){for(let l=0;l<s;l++){let h=it(0,1);n.fillStyle=h>.8?"#8d9aa2":h>.45?"#4d565e":"#39424a",n.fillRect(l*o+o*.22,c*a+a*.22,o*.56,a*.46),n.fillStyle="rgba(24,26,28,0.42)",n.fillRect(l*o+o*.22,c*a+a*.22,o*.56,a*.09)}n.fillStyle="rgba(150,142,128,0.55)",n.fillRect(0,c*a+a*.74,256,a*.16)}return Xs(n,2400,18,256),Dn(e,[1,1])}function oh(i){let[e,n]=Ln(256);n.fillStyle=si(i),n.fillRect(0,0,256,256);let s=9,r=256/s,o=5,a=256/o;for(let c=0;c<s;c++){for(let l=0;l<o;l++)n.fillStyle="rgba(46,52,58,0.72)",n.fillRect(l*a+a*.14,c*r+r*.16,a*.72,r*.5),n.fillStyle="rgba(226,222,210,0.9)",n.fillRect(l*a+a*.14,c*r+r*.52,a*.72,r*.1);n.fillStyle="rgba(206,200,186,0.85)",n.fillRect(0,c*r+r*.66,256,r*.2)}return Xs(n,2e3,16,256),Dn(e,[1,1])}function Id(i){let[e,n]=Ln(256);n.fillStyle=si(i),n.fillRect(0,0,256,256);for(let c=0;c<2600;c++){let l=it(-14,12);n.fillStyle=`rgba(${210+l},${204+l},${190+l},${it(.08,.3)})`,n.fillRect(it(0,256),it(0,256),it(1,2.4),it(1,2.4))}let s=3,r=256/s,o=3,a=256/o;for(let c=0;c<s;c++){for(let l=0;l<o;l++)n.fillStyle="#3b4148",n.fillRect(l*a+a*.3,c*r+r*.18,a*.4,r*.5),n.fillStyle="rgba(86,104,74,0.92)",n.fillRect(l*a+a*.19,c*r+r*.18,a*.1,r*.5),n.fillRect(l*a+a*.71,c*r+r*.18,a*.1,r*.5),n.fillStyle="rgba(246,242,232,0.85)",n.fillRect(l*a+a*.16,c*r+r*.12,a*.68,r*.06);n.fillStyle="rgba(248,244,234,0.8)",n.fillRect(0,c*r+r*.78,256,r*.09),n.fillStyle="rgba(150,142,128,0.35)",n.fillRect(0,c*r+r*.87,256,r*.03)}return Xs(n,1500,14,256),Dn(e,[1,1])}function Pd(){let[t,e]=Ln(128);e.clearRect(0,0,128,128);let n=e.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);n.addColorStop(0,"rgba(34,50,25,0.85)"),n.addColorStop(.7,"rgba(34,50,25,0.34)"),n.addColorStop(1,"rgba(34,50,25,0)"),e.fillStyle=n,e.fillRect(0,0,128,128);let s=[Ye.leafDark,Ye.leafDark,Ye.leafMid,Ye.leafMid,Ye.leafLight];for(let r=0;r<460;r++){let o=it(0,128),a=it(0,128),c=Math.hypot(o-128/2,a-128/2)/(128/2);c>.99||hn()<c*c*.9||(e.save(),e.translate(o,a),e.rotate(it(0,Math.PI*2)),e.fillStyle=si(ze(s)),e.globalAlpha=it(.5,1),e.beginPath(),e.ellipse(0,0,it(2.6,7),it(1,2.1),0,0,Math.PI*2),e.fill(),e.restore())}return Dn(t,null)}function Ld(){let[t,e]=Ln(128),n=e.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);return n.addColorStop(0,"rgba(0,0,0,0.52)"),n.addColorStop(.55,"rgba(0,0,0,0.2)"),n.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=n,e.fillRect(0,0,128,128),Dn(t,null,!1)}function ri(i){let t=0,e=0;for(let[f,g]of i)t+=f,e+=g;t/=i.length,e/=i.length;let n=0,s=0,r=0;for(let[f,g]of i){let y=f-t,p=g-e;n+=y*y,s+=y*p,r+=p*p}let o=.5*Math.atan2(2*s,n-r),a=Math.cos(o),c=Math.sin(o),l=1e9,h=-1e9,d=1e9,u=-1e9;for(let[f,g]of i){let y=f-t,p=g-e,m=y*a+p*c,M=-y*c+p*a;l=Math.min(l,m),h=Math.max(h,m),d=Math.min(d,M),u=Math.max(u,M)}return{cx:t,cz:e,ux:a,uz:c,ang:o,halfLong:(h-l)/2,halfShort:(u-d)/2,midU:(h+l)/2,midV:(u+d)/2}}function mn(i,t,e,n,s,r,o,a,c,l=0){let h=new ft(new ht(s,a,r),c),d=t.cx+t.ux*e-t.uz*n,u=t.cz+t.uz*e+t.ux*n;return h.position.set(d,o+a/2,u),h.rotation.y=-t.ang+l,h.castShadow=!0,h.receiveShadow=!0,i.world.add(h),h}function Ys(i,t,e,n,s,r,o,a){mn(i,t,e,n,s*1.06,r*1.06,o,1.2,a),mn(i,t,e,n,s*.55,r*.55,o+1.2,3,a)}function is(i,t){if(!i.axis)return{nx:0,nz:1,dist:30};let e=0,n=0,s=1/0;for(let[c,l]of i.axis.p){let h=(c-t.cx)**2+(l-t.cz)**2;h<s&&(s=h,e=c,n=l)}let r=e-t.cx,o=n-t.cz,a=Math.hypot(r,o)||1;return{nx:r/a,nz:o/a,dist:a}}function v_(i,t){let e=ri(t.p),n=i.mat.granite,s=i.mat.towerGlass,r=i.mat.paleStone;i.world.add(i.extrude(t.p,30,n)),i.world.add(i.extrude(i.grow(t.p,1.004),1.6,r,30));let o=Math.min(38,e.halfShort*1.05);for(let y of[-1,1]){let p=e.midU+y*e.halfLong*.4;mn(i,e,p,e.midV,o,o,31.6,107,n);for(let m of[-1,1])mn(i,e,p,e.midV+m*(o/2+.15),o*.82,.4,34,100,s);Ys(i,e,p,e.midV,o,o,138.6,r)}let a=is(i,e),c=Math.atan2(a.nx,a.nz),l=e.cx+a.nx*e.halfShort,h=e.cz+a.nz*e.halfShort,d=62,u=0;if(i.clearance)for(let y of[62,52,44,36,28]){let p=i.clearance.outward(l,h,a.nx,a.nz,22,y/2);if(p>=6){d=y,u=Math.min(30,p);break}}else u=17;let f=l+a.nx*(u/2),g=h+a.nz*(u/2);if(u>=6){let y=new ft(new ht(d,.5,u),i.mat.paving);y.position.set(f,.25,g),y.rotation.y=c,y.receiveShadow=!0,i.world.add(y);for(let p=0;p<3;p++){let m=new ft(new ht(d,.18,1.1),i.mat.paleStone);m.position.set(f+a.nx*(u/2+p*1.1),.42-p*.16,g+a.nz*(u/2+p*1.1)),m.rotation.y=c,m.receiveShadow=!0,m.castShadow=!0,i.world.add(m)}for(let p of[-1,1]){let m=new ft(new ht(2.2,.85,u*.88),n);m.position.set(f-a.nz*p*(d/2-2),.68,g+a.nx*p*(d/2-2)),m.rotation.y=c,m.castShadow=!0,m.receiveShadow=!0,i.world.add(m)}}}function M_(i,t){let e=ri(t.p),n=i.mat.towerGlass,s=i.mat.paleStone;i.world.add(i.extrude(t.p,34,n)),i.world.add(i.extrude(i.grow(t.p,1.05),1.1,s,20.5)),i.world.add(i.extrude(i.grow(t.p,1.02),1.4,s,34));let r=Math.min(30,e.halfShort*.75);mn(i,e,e.midU-e.halfLong*.12,e.midV,r,r*.78,35.4,176,n),Ys(i,e,e.midU-e.halfLong*.12,e.midV,r,r*.78,211,s);let o=is(i,e),a=Math.atan2(o.nx,o.nz),c=e.cx+o.nx*e.halfShort,l=e.cz+o.nz*e.halfShort,h=i.clearance?Math.min(5,i.clearance.outward(c,l,o.nx,o.nz,5,22)):4,d=e.cx+o.nx*(e.halfShort+h),u=e.cz+o.nz*(e.halfShort+h),f=new Rt({color:12174537,roughness:.28,metalness:.45,side:Ce}),g=new ft(new qt(17,17,Math.min(74,e.halfLong*1.9),22,1,!0,Math.PI*.06,Math.PI*.62),f);g.rotation.z=Math.PI/2,g.rotation.y=a,g.position.set(d,20.5,u),g.castShadow=!0,i.world.add(g);for(let p of[-1,1]){let m=new ft(new qt(.75,1.9,20,10),f);m.position.set(d-o.nz*p*17,10,u+o.nx*p*17),m.castShadow=!0,i.world.add(m)}let y=new ft(new Ee(Math.min(58,e.halfLong*1.5),13),new Rt({color:1119772,roughness:.25,emissive:3108776,emissiveIntensity:.85}));y.position.set(e.cx+o.nx*(e.halfShort+.4),12.5,e.cz+o.nz*(e.halfShort+.4)),y.rotation.y=a,i.world.add(y)}function S_(i,t){let e=ri(t.p),n=i.mat.jadeRoof,s=i.mat.warmStone,r=i.mat.towerGlass;i.world.add(i.extrude(t.p,19,s));let o=e.halfShort*2*.98,a=e.halfLong*2*.98,c=new ft(new gi(Math.max(o,a)*.62,9.5,4),n);c.position.set(e.cx,23.6,e.cz),c.rotation.y=-e.ang+Math.PI/4,c.castShadow=!0,i.world.add(c);let l=Math.min(26,e.halfShort*.9),h=e.midU+e.halfLong*.42;mn(i,e,h,e.midV,l,l*.72,19,121,s);for(let y=0;y<30;y++)mn(i,e,h,e.midV-l*.36,l*.9,.25,22+y*3.9,2.3,r);let d=new ft(new fe(1.05,10,8),n);d.position.set(e.cx,28.9,e.cz),d.castShadow=!0,i.world.add(d);let u=new ft(new gi(.42,3.4,8),n);u.position.set(e.cx,31,e.cz),u.castShadow=!0,i.world.add(u);let f=new ft(new gi(Math.max(o,a)*.4,6,4),n);f.position.set(e.cx,27.2,e.cz),f.rotation.y=-e.ang+Math.PI/4,f.castShadow=!0,i.world.add(f);let g=new ft(new gi(l*.75,7,4),n);g.position.set(e.cx+e.ux*h-e.uz*e.midV,143.5,e.cz+e.uz*h+e.ux*e.midV),g.rotation.y=-e.ang+Math.PI/4,g.castShadow=!0,i.world.add(g)}function b_(i,t){let e=ri(t.p),n=i.mat.paleStone,s=i.mat.towerGlass;i.world.add(i.extrude(t.p,26,s));for(let o=0;o<7;o++)i.world.add(i.extrude(i.grow(t.p,1.008),.32,i.mat.trim,4+o*3.4));let r=Math.min(30,e.halfShort*.95);mn(i,e,e.midU+e.halfLong*.25,e.midV,r,r*.8,26,44,s),Ys(i,e,e.midU+e.halfLong*.25,e.midV,r,r*.8,70,n)}function E_(i,t){let e=ri(t.p),n=i.mat.towerGlass,s=i.mat.paleStone;/wisma atria/i.test(t.n||"")&&(n=i.mat.blueGlass);let r=Math.min(30,t.h*.42);if(i.world.add(i.extrude(t.p,r,n)),i.world.add(i.extrude(i.grow(t.p,1.03),1,s,r-1)),t.h>r+12){let o=Math.min(28,e.halfShort*.85);mn(i,e,e.midU,e.midV,o,o*.8,r,t.h-r,n),Ys(i,e,e.midU,e.midV,o,o*.8,t.h,s)}}function w_(i,t){let e=ri(t.p);i.world.add(i.extrude(t.p,t.h,i.mat.warmStone));let n=is(i,e),s=n.nx*-Math.sin(e.ang)+n.nz*Math.cos(e.ang)>=0?1:-1,r=Math.max(5,Math.round(e.halfLong*2/6));for(let o=0;o<=r;o++){let a=e.midU-e.halfLong+o/r*e.halfLong*2;mn(i,e,a,e.midV+s*(e.halfShort+.2),.5,.9,5,t.h-6,i.mat.paleStone)}i.world.add(i.extrude(i.grow(t.p,1.02),1.1,i.mat.trim,t.h))}function T_(i,t){let e=ri(t.p),n=i.mat.towerGlass,s=i.mat.paleStone;i.world.add(i.extrude(t.p,22,n));let r=Math.min(26,e.halfShort*.9);mn(i,e,e.midU,e.midV,r,r*.82,22,66,n),Ys(i,e,e.midU,e.midV,r,r*.82,88,s);let o=is(i,e),a=e.cx+o.nx*(e.halfShort*.62),c=e.cz+o.nz*(e.halfShort*.62),l=new Rt({color:10467014,roughness:.12,metalness:.25,transparent:!0,opacity:.72,side:Ce}),h=new ft(new gi(11.5,27,18,6,!0),l);h.position.set(a,13.5,c),h.castShadow=!0,i.world.add(h);for(let d=0;d<12;d++){let u=d/12*Math.PI*2,f=new ft(new ht(.22,27.4,.22),i.mat.metal);f.position.set(a+Math.cos(u)*5.6,13.6,c+Math.sin(u)*5.6),f.rotation.z=Math.cos(u)*.2,f.rotation.x=-Math.sin(u)*.2,f.castShadow=!0,i.world.add(f)}}function A_(i,t){let e=ri(t.p),n=i.mat.towerGlass,s=i.mat.paleStone;i.world.add(i.extrude(t.p,t.h,n));let r=is(i,e);for(let o=0;o<5;o++){let a=12+o*9.5;if(a>t.h-8)break;let c=new ft(new ht(Math.min(20,e.halfLong*.9),4.2,3.4),new Rt({color:2896697,roughness:.6}));c.position.set(e.cx+r.nx*(e.halfShort-.6),a,e.cz+r.nz*(e.halfShort-.6)),c.rotation.y=Math.atan2(r.nx,r.nz),i.world.add(c);let l=new ft(new ht(Math.min(20,e.halfLong*.9),.35,4.6),s);l.position.set(e.cx+r.nx*(e.halfShort+.9),a-2,e.cz+r.nz*(e.halfShort+.9)),l.rotation.y=Math.atan2(r.nx,r.nz),l.castShadow=!0,i.world.add(l)}i.world.add(i.extrude(i.grow(t.p,1.02),1,s,t.h));for(let o=0;o<7;o++){let a=new ft(new fe(1.5,8,6),new Ue({color:4152371}));a.position.set(e.cx+it(-e.halfLong*.6,e.halfLong*.6),t.h+2,e.cz+it(-e.halfShort*.6,e.halfShort*.6)),a.scale.y=.7,a.castShadow=!0,i.world.add(a)}}function R_(i,t){let e=ri(t.p),n=i.mat.paleStone,s=i.mat.warmStone,r=i.mat.towerGlass,o=Math.min(14,t.h*.24);i.world.add(i.extrude(t.p,o,s)),i.world.add(i.extrude(i.grow(t.p,1.03),.9,n,o-.9));let a=Math.min(20,e.halfShort*.78),c=Math.min(e.halfLong*1.5,54),l=Math.max(12,t.h-o);mn(i,e,e.midU,e.midV,c,a,o,l,s);let h=Math.max(4,Math.round(l/3.3));for(let p=1;p<h;p+=2){let m=o+p*(l/h);if(m>o+l-2)break;for(let M of[-1,1])mn(i,e,e.midU,e.midV+M*(a/2+.18),c*.96,.42,m-.2,.28,n)}for(let p of[-1,1])mn(i,e,e.midU,e.midV+p*(a/2+.06),c*.94,.1,o+1.2,l-2.4,r);Ys(i,e,e.midU,e.midV,c,a,o+l,n);let d=is(i,e),u=Math.atan2(d.nx,d.nz),f=e.cx+d.nx*e.halfShort,g=e.cz+d.nz*e.halfShort,y=i.clearance?i.clearance.outward(f,g,d.nx,d.nz,11,13):7;if(y>6.5){let p=Math.min(13,y*1.05),m=f+d.nx*(p/2),M=g+d.nz*(p/2),E=new ft(new ht(22,.6,p),n);E.position.set(m,6,M),E.rotation.y=u,E.castShadow=!0,i.world.add(E);for(let A of[-9,9])for(let S of[-p/2.6,p/2.6]){let w=new ft(new qt(.45,.55,6,10),n);w.position.set(m-d.nz*A+d.nx*S,3,M+d.nx*A+d.nz*S),w.castShadow=!0,i.world.add(w)}let _=new ft(new ht(24,.12,p*1.12),i.mat.paving);_.position.set(m,.2,M),_.rotation.y=u,_.receiveShadow=!0,i.world.add(_)}}function Dd(i,t){let e=ri(t.p),n=i.mat.shophouse(t),s=i.mat.trim,r=i.mat.clayTile,o=0;for(let[m,M]of t.p)o=o*33+(m*3|0)+(M*17|0)|0;o=Math.abs(o);let a=o%4,c=o%5<3,l=4.2,h=Math.max(3.4,t.h-l),d=e.cx,u=e.cz,f=is(i,e);i.merge(i.extrudeGeo(i.grow(t.p,.86),l),i.mat.warmStone,d,u),i.merge(i.scaleUV(i.extrudeGeo(t.p,h,l),Math.max(1,e.halfLong/4),Math.max(1,h/11)),n,d,u),i.merge(i.extrudeGeo(i.grow(t.p,1.03),.34,l-.34),s,d,u),i.merge(i.extrudeGeo(i.grow(t.p,1.04),.5,t.h),s,d,u);let g=Math.atan2(f.nx,f.nz),y=e.halfLong*2,p=Math.max(2,Math.round(y/3.6));for(let m=0;m<=p;m++){let M=e.midU-e.halfLong+m/p*y,E=e.cx+e.ux*M-e.uz*(e.midV+f.dist*0),_=e.cz+e.uz*M+e.ux*e.midV,A=new ht(.34,l,.34);A.translate(E+f.nx*(e.halfShort*.94),l/2,_+f.nz*(e.halfShort*.94)),i.merge(A,s,d,u)}if(a<3){let m=Math.min(3.4,e.halfShort*(.5+a*.09)),M=new qt(m,m,y*1.02,3,1,!1);M.rotateZ(Math.PI/2),M.rotateY(-e.ang),M.translate(e.cx,t.h+m*.3,e.cz),i.merge(M,r,d,u);for(let E of[-1,1]){let _=new qt(m*1.03,m*1.03,.3,3,1,!1);_.rotateZ(Math.PI/2),_.rotateY(-e.ang),_.translate(e.cx+e.ux*E*(y/2),t.h+m*.3,e.cz+e.uz*E*(y/2)),i.merge(_,s,d,u)}}else i.merge(i.extrudeGeo(i.grow(t.p,1.05),.8,t.h+.5),s,d,u);if(c){let m=new ht(y*.92,.16,2);m.rotateY(-e.ang),m.translate(e.cx+f.nx*(e.halfShort+.9),l-.55,e.cz+f.nz*(e.halfShort+.9)),i.merge(m,i.mat.awning(t),d,u)}}var C_=[[/ngee ann city|takashimaya/i,v_],[/ion orchard|orchard residences/i,M_],[/tang plaza|singapore marriott|^tangs/i,S_],[/paragon/i,b_],[/wheelock/i,T_],[/orchard central/i,A_],[/wisma atria|313|orchard gateway|shaw (house|centre)|mandarin gallery|the heeren/i,E_],[/hotel|hyatt|hilton|marriott|four seasons|pullman|voco|royal plaza|pan pacific|regent|shangri|holiday inn|ibis|orchard rendezvous|concorde|mandarin orchard/i,R_],[/lucky plaza|far east plaza|orchard towers|midpoint|palais|delfi|orchard plaza|cairnhill|tripleone|far east shopping|international building|liat|pacific plaza|scotts square|orchard building|forum the shopping|268 orchard|scape|design orchard|cathay cineleisure/i,w_]];function Ud(i){if(!i)return null;for(let[t,e]of C_)if(t.test(i))return e;return null}var gc={asphalt:Ad(),paving:Rd(),leaf:Pd(),ao:Ld()},Nd=[qs(8230054,5989742,8),qs(9148578,7041656,7),qs(7311242,5070684,9),qs(10130308,7170658,6),qs(8688543,4147024,10)],I_=[pc(),pc(),pc()],Gd=[Gi(11774618,.5),Gi(10261642,.6),Gi(12760480,.45),Gi(9276038,.7)],P_=[mc(11051153),mc(12432288),mc(9669762)],L_=[oh(13024681),oh(11380118)];function D_(i){let t=0;for(let[n,s]of i.p)t=t*31+(n*7|0)+(s*13|0)|0;if(t=Math.abs(t),i.a>1400||i.k)return{pool:Nd,rough:.34,metal:.08};let e=t%100;return e<34?{pool:P_,rough:.86,metal:0}:e<52?{pool:L_,rough:.8,metal:0}:e<74?{pool:Gd,rough:.88,metal:0}:{pool:Nd,rough:.36,metal:.06}}var Pt={asphalt:new Rt({map:gc.asphalt,roughness:.95}),paving:new Rt({map:gc.paving,roughness:.9}),kerb:new Rt({color:Ye.kerb,roughness:.86}),conc:new Rt({map:Gi(Ye.conc,.7),roughness:.92}),trim:new Rt({color:Ye.trim,roughness:.8}),white:new Rt({color:14605008,roughness:.85}),yellow:new Rt({color:Ye.yellow,roughness:.85}),metal:new Rt({color:9146259,roughness:.5,metalness:.4}),darkMetal:new Rt({color:3882820,roughness:.6,metalness:.3}),glass:new Rt({color:5464429,roughness:.14,metalness:.18}),leaf:new Ue({map:gc.leaf,transparent:!1,alphaTest:.42,side:Ce}),canopy:new Ue({color:2371866}),trunk:new Rt({color:Ye.trunk,roughness:.95}),ao:new Cn({map:gc.ao,transparent:!0,blending:Br,premultipliedAlpha:!0,depthWrite:!1})},Fd=[14207924,12571332,14271386,13226973,14071464,14735037,12175805],Bd=[9194047,3104594,9073715,4150640,7228003,10116918],ah=new Map,ch=new Map,U_={granite:new Rt({map:Cd(),roughness:.3,metalness:.12}),towerGlass:new Rt({map:rh(),roughness:.22,metalness:.16}),blueGlass:new Rt({map:rh(),color:10470621,roughness:.18,metalness:.2}),paleStone:new Rt({map:Gi(12893614,.35),roughness:.78}),warmStone:new Rt({map:Gi(11707535,.5),roughness:.85}),jadeRoof:new Rt({color:3104586,roughness:.45,metalness:.2}),clayTile:new Rt({color:10246724,roughness:.82}),awning(i){let t=0;for(let[n,s]of i.p)t=t*29+(n*9|0)+(s*7|0)|0;let e=Bd[Math.abs(t)%Bd.length];return ch.has(e)||ch.set(e,new Rt({color:e,roughness:.9})),ch.get(e)},shophouse(i){let t=0;for(let[n,s]of i.p)t=t*31+(n*5|0)+(s*11|0)|0;let e=Fd[Math.abs(t)%Fd.length];return ah.has(e)||ah.set(e,new Rt({map:Id(e),roughness:.88})),ah.get(e)}},RS=new L(0,1,0),Od=110,hh=class{constructor(){this.groups=new Map,this.mats=new Map}add(t,e,n=0,s=0){let r=`${Math.floor(n/Od)},${Math.floor(s/Od)}|${this.matKey(e)}`;this.groups.has(r)||(this.groups.set(r,[]),this.mats.set(r,e)),this.groups.get(r).push(t.index?t.toNonIndexed():t)}matKey(t){return this._ids||(this._ids=new Map,this._next=0),this._ids.has(t)||this._ids.set(t,this._next++),this._ids.get(t)}flush(t){let e=0;for(let[n,s]of this.groups){let r=this.mats.get(n),o=0;for(let g of s)o+=g.attributes.position.count;let a=new Float32Array(o*3),c=new Float32Array(o*3),l=new Float32Array(o*2),h=0,d=0;for(let g of s)a.set(g.attributes.position.array,h),g.attributes.normal&&c.set(g.attributes.normal.array,h),g.attributes.uv&&l.set(g.attributes.uv.array,d),h+=g.attributes.position.count*3,d+=g.attributes.position.count*2,g.dispose();let u=new Be;u.setAttribute("position",new se(a,3)),u.setAttribute("normal",new se(c,3)),u.setAttribute("uv",new se(l,2)),u.computeBoundingSphere();let f=new ft(u,r);f.castShadow=!0,f.receiveShadow=!0,t.add(f),e++}return this.groups.clear(),this.mats.clear(),e}},uh=class{constructor(t,e){this.CELL=44,this.grid=new Map;let n=(s,r,o)=>{let a=Math.min(s[0],r[0])-o,c=Math.max(s[0],r[0])+o,l=Math.min(s[1],r[1])-o,h=Math.max(s[1],r[1])+o;for(let d=Math.floor(a/this.CELL);d<=Math.floor(c/this.CELL);d++)for(let u=Math.floor(l/this.CELL);u<=Math.floor(h/this.CELL);u++){let f=d+","+u;this.grid.has(f)||this.grid.set(f,[]),this.grid.get(f).push([s,r,o])}};for(let s of t||[])if(!(s.k==="footway"||s.k==="pedestrian"||s.k==="service"))for(let r=0;r<s.p.length-1;r++)n(s.p[r],s.p[r+1],s.w/2+.7);if(e)for(let s=0;s<e.p.length-1;s++)n(e.p[s],e.p[s+1],e.w/2+.7)}inRoad(t,e){let n=this.grid.get(Math.floor(t/this.CELL)+","+Math.floor(e/this.CELL));if(!n)return!1;for(let[s,r,o]of n){let a=r[0]-s[0],c=r[1]-s[1],l=a*a+c*c,h=l<1e-9?0:((t-s[0])*a+(e-s[1])*c)/l;h=Math.max(0,Math.min(1,h));let d=t-(s[0]+a*h),u=e-(s[1]+c*h);if(d*d+u*u<o*o)return!0}return!1}outward(t,e,n,s,r,o=0){for(let a=r;a>.4;a-=.5)if(this.rectClear(t,e,n,s,o*2,a))return a;return 0}rectClear(t,e,n,s,r,o){let a=-s,c=n,l=r/2,h=Math.max(3,Math.ceil(r/6)),d=Math.max(2,Math.ceil(o/4));for(let u=0;u<=h;u++){let f=-l+u/h*r;for(let g=0;g<=d;g++){let y=g/d*o;if(this.inRoad(t+n*y+a*f,e+s*y+c*f))return!1}}return!0}};function dh(i,t,e){let n=i.attributes.uv;if(!n)return i;for(let s=0;s<n.count;s++)n.setXY(s,n.getX(s)*t,n.getY(s)*e);return n.needsUpdate=!0,i}var lh=new Map;function kd(i,t,e){return lh.has(i)||lh.set(i,new Rt({map:i,roughness:t,metalness:e})),lh.get(i)}function Qr(i,t,e=0){let n=new Ns(Vd(i),{depth:t,bevelEnabled:!1,curveSegments:1});return n.rotateX(Math.PI/2),n.translate(0,e+t,0),n}function N_(i){let t=0;for(let e=0;e<i.length;e++){let[n,s]=i[e],[r,o]=i[(e+1)%i.length];t+=n*o-r*s}return t/2}function Vd(i){let t=N_(i)<0?[...i].reverse():i,e=new Ds;e.moveTo(t[0][0],t[0][1]);for(let n=1;n<t.length;n++)e.lineTo(t[n][0],t[n][1]);return e.closePath(),e}function ss(i){let t=0,e=0;for(let n of i)t+=n[0],e+=n[1];return[t/i.length,e/i.length]}function zd(i){let t=0;for(let e=0;e<i.length;e++){let n=i[e],s=i[(e+1)%i.length];t+=Math.hypot(s[0]-n[0],s[1]-n[1])}return t}function jr(i,t,e,n=0){let s=new Ns(Vd(i),{depth:t,bevelEnabled:!1,curveSegments:1});s.rotateX(Math.PI/2),s.translate(0,n+t,0);let r=new ft(s,e);return r.castShadow=!0,r.receiveShadow=!0,r}function Kr(i,t){let e=ss(i);return i.map(([n,s])=>[e[0]+(n-e[0])*t,e[1]+(s-e[1])*t])}function Wd(i,t){let e={count:0,tall:0,bespoke:0},n=new hh,s=new uh(t.roads,t.axis),r={clearance:s,world:i,extrude:jr,grow:Kr,axis:t.axis||null,extrudeGeo:Qr,scaleUV:dh,merge:(o,a,c,l)=>n.add(o,a,c,l),mat:{...U_,trim:Pt.trim,conc:Pt.conc,paving:Pt.paving,metal:Pt.metal}};for(let o of t.buildings){let a=o.p;if(a.length<3)continue;if(!o.k&&o.a<520&&o.h<=20&&o.p.length<=64){Dd(r,o),e.count++,e.shophouses=(e.shophouses||0)+1;continue}let c=Ud(o.n);if(c){c(r,o),Hd(i,o,zd(a),n,s),e.count++,e.bespoke++;continue}let l=D_(o),h=ze(l.pool),d=kd(h,l.rough,l.metal),u=zd(a),f=o.h;if(o.k&&f>70){let g=Math.min(34,f*.28);i.add(jr(a,g,new Rt({map:ze(Gd),roughness:.8})));let y=ss(a),p=a.map(([m,M])=>[y[0]+(m-y[0])*.62,y[1]+(M-y[1])*.62]);i.add(jr(p,f-g,d,g)),e.tall++}else{let g=ss(a);if(n.add(dh(Qr(a,f),Math.max(1,u/26),Math.max(1,f/28)),d,g[0],g[1]),f>8){let y=ss(a),p=a.map(([m,M])=>[y[0]+(m-y[0])*1.008,y[1]+(M-y[1])*1.008]);n.add(Qr(p,.7,f),Pt.trim,y[0],y[1])}}if(Hd(i,o,u,n,s),o.a>900&&f>12){let g=ss(a);for(let p=0;p<3;p++){let m=new ht(it(3,7),it(1.6,3.4),it(3,6));m.translate(g[0]+it(-8,8),f+it(1,1.8),g[1]+it(-8,8)),n.add(m,Pt.conc,g[0],g[1])}let y=new ht(it(4,7),it(3.2,4.6),it(4,6));if(y.translate(g[0]+it(-6,6),f+2.2,g[1]+it(-6,6)),n.add(y,Pt.trim,g[0],g[1]),Sn(.6))for(let p=0;p<2;p++){let m=new qt(it(.9,1.4),it(.9,1.4),1.7,10);m.translate(g[0]+it(-9,9),f+.9,g[1]+it(-9,9)),n.add(m,Pt.trim,g[0],g[1])}if(Sn(.5)){let p=new ht(it(9,16),.7,.7);p.translate(g[0]+it(-4,4),f+.9,g[1]+it(-7,7)),n.add(p,Pt.metal,g[0],g[1])}}e.count++}return e.mergedMeshes=n.flush(i),e}function Hd(i,t,e,n,s){if(t.a<=600||t.h<=7)return;let r=t.p,o=ze(I_),a=kd(o,.32,.05);if(n){let h=ss(r);n.add(dh(Qr(Kr(r,1.012),5.4),Math.max(2,e/15),1),a,h[0],h[1]),n.add(Qr(Kr(r,1.055),.42,5.3),Pt.trim,h[0],h[1])}else i.add(jr(Kr(r,1.012),5.4,a)),i.add(jr(Kr(r,1.055),.42,Pt.trim,5.3));let c=0,l=0;for(let h=0;h<r.length;h++){let d=r[h],u=r[(h+1)%r.length],f=Math.hypot(u[0]-d[0],u[1]-d[1]);f>l&&(l=f,c=h)}if(l>16){let h=r[c],d=r[(c+1)%r.length],u=(h[0]+d[0])/2,f=(h[1]+d[1])/2,g=Math.atan2(d[0]-h[0],d[1]-h[1]),y=ss(r),p=u-y[0],m=f-y[1],M=Math.hypot(p,m)||1,E=p/M,_=m/M;if(t.a>1200){let w=Math.min(14,l*.3),x=new ft(new Ee(w,4.4),new Rt({color:2827808,roughness:.7,emissive:14267511,emissiveIntensity:.55}));x.position.set(u-E*5.2,2.5,f-_*5.2),x.rotation.y=g+Math.PI/2,i.add(x);for(let I of[-1,1]){let P=new ft(new Ee(5.6,4.4),new Rt({color:3814187,roughness:.8,side:Ce}));P.position.set(u-E*2.5+Math.sin(g)*I*w/2,2.5,f-_*2.5+Math.cos(g)*I*w/2),P.rotation.y=g,i.add(P)}let b=new ft(new Ee(w,5.6),new Rt({color:4866618,roughness:.8,side:Ce}));b.rotation.x=Math.PI/2,b.rotation.z=-g,b.position.set(u-E*2.5,4.7,f-_*2.5),i.add(b);let R=new ft(new Ee(w,4.2),new Rt({color:12374234,roughness:.08,metalness:.2,transparent:!0,opacity:.34,side:Ce}));R.position.set(u+E*.35,2.4,f+_*.35),R.rotation.y=g+Math.PI/2,i.add(R)}let A=Math.min(18,l*.34),S=s?s.outward(u,f,E,_,3.6,A*.5):3.6;if(S>1){let w=new ft(new ht(A,.5,S*1.15),Pt.trim);w.position.set(u+E*S*.5,6.1,f+_*S*.5),w.rotation.y=g+Math.PI/2,w.castShadow=!0,i.add(w);for(let x of[-1,1]){let b=new ft(new qt(.12,.12,6,8),Pt.metal);b.position.set(u+E*S*.9+Math.sin(g)*x*A*.42,3,f+_*S*.9+Math.cos(g)*x*A*.42),b.castShadow=!0,i.add(b)}}}}function F_(i,t,e){let n=new Be,s=[],r=[],o=0;for(let a=0;a<i.length-1;a++){let[c,l]=i[a],[h,d]=i[a+1],u=h-c,f=d-l,g=Math.hypot(u,f);if(g<.01)continue;let y=-f/g*t/2,p=u/g*t/2,m=[c-y,e,l-p],M=[c+y,e,l+p],E=[h+y,e,d+p],_=[h-y,e,d-p];s.push(...m,...M,...E,...m,...E,..._);let A=o/t,S=(o+g)/t;r.push(0,A,1,A,1,S,0,A,1,S,0,S),o+=g}return n.setAttribute("position",new se(s,3)),n.setAttribute("uv",new se(r,2)),n.computeVertexNormals(),n}function B_(i){let t=0;for(let e=0;e<i.length-1;e++)t+=Math.hypot(i[e+1][0]-i[e][0],i[e+1][1]-i[e][1]);return t}function Xd(i,t){let e=[],n=[],s=null,r=1/0;for(let a of t.roads){let c=a.k==="footway"||a.k==="pedestrian",l=c?.02:.055,h=F_(a.p,a.w,l);if(!(!h.attributes.position||h.attributes.position.count===0)&&((c?n:e).push(h),/orchard road/i.test(a.n||"")&&B_(a.p)>120)){let d=1/0;for(let[u,f]of a.p)d=Math.min(d,u*u+f*f);d<r&&(r=d,s=a)}}let o=(a,c)=>{if(!a.length)return;let l=0;for(let p of a)l+=p.attributes.position.count;let h=new Float32Array(l*3),d=new Float32Array(l*2),u=0,f=0;for(let p of a)h.set(p.attributes.position.array,u),u+=p.attributes.position.array.length,d.set(p.attributes.uv.array,f),f+=p.attributes.uv.array.length;let g=new Be;g.setAttribute("position",new se(h,3)),g.setAttribute("uv",new se(d,2)),g.computeVertexNormals();let y=new ft(g,c);y.receiveShadow=!0,i.add(y)};return o(e,Pt.asphalt),o(n,Pt.paving),s}var to=class{constructor(){this.items=[]}add(t,e,n=1){this.items.push([t,e,n])}build(t){let e=this.items.length;if(!e)return 0;let n=30,s=3,r=4,o=new Oe(new qt(.24,.52,1,8),Pt.trunk,e),a=new Oe(new qt(.07,.2,1,5),Pt.trunk,e*r),c=new Oe(new Rr(1,0),Pt.canopy,e*s),l=new Oe(new Ee(1,.55),Pt.leaf,e*n);o.castShadow=a.castShadow=c.castShadow=l.castShadow=!0;let h=new ee,d=new Te,u=new Se,f=new L,g=new L,y=0,p=0,m=0;return this.items.forEach(([M,E,_],A)=>{let S=it(8.5,12.5)*_,w=it(5.2,7.2)*_;f.set(M,S/2,E),u.identity(),g.set(_,S,_),h.compose(f,u,g),o.setMatrixAt(A,h);for(let x=0;x<r;x++){let b=x/r*Math.PI*2+it(-.3,.3),R=it(1.8,3)*_;f.set(M+Math.cos(b)*R*.22,S*it(.8,.96),E+Math.sin(b)*R*.22),d.set(Math.cos(b)*.55,0,-Math.sin(b)*.55),u.setFromEuler(d),g.set(_,R,_),h.compose(f,u,g),a.setMatrixAt(y++,h)}for(let x=0;x<s;x++){let b=w*it(.16,.24);f.set(M+it(-.45,.45)*w,S*it(.94,1.06),E+it(-.45,.45)*w),u.identity(),g.set(b,b*.5,b),h.compose(f,u,g),c.setMatrixAt(p++,h)}for(let x=0;x<n;x++){let b=hn()*Math.PI*2,R=w*Math.sqrt(hn())*1.12;f.set(M+Math.cos(b)*R,S*it(.92,1.06)-R*.13+it(-.4,.4),E+Math.sin(b)*R),d.set(it(-1.5,-.7),b+it(-.7,.7),it(-.4,.4)),u.setFromEuler(d);let I=w*it(.45,.8);g.set(I,I,I),h.compose(f,u,g),l.setMatrixAt(m++,h)}}),a.count=y,c.count=p,l.count=m,t.add(o,a,c,l),e}};var an={vMax:11.6,vReverse:2.4,accel:5,reverseAccel:2.6,brake:11,coast:1.35,drag:.016,wheelbase:1.32,steerMax:.62,steerFalloff:.045,leanMax:.62,leanRate:5};function xc(i=0,t=0,e=0){return{x:i,z:t,heading:e,speed:0,lean:0,yaw:0,wheel:0,revHold:0,reversing:!1}}function fh(i,t,e,n,s){e>0?(i.revHold=0,i.reversing=!1):n>0&&i.speed<=.03?i.revHold+=t:n===0&&(i.revHold=0,i.speed>=-.02&&(i.reversing=!1)),i.revHold>.35&&(i.reversing=!0);let r;if(i.reversing?r=-n*an.reverseAccel:r=e*an.accel-n*an.brake*(i.speed>0?1:0),Math.abs(i.speed)>.05){let h=Math.sign(i.speed);r-=h*(an.coast+an.drag*i.speed*i.speed)}i.speed=Math.max(-an.vReverse,Math.min(an.vMax,i.speed+r*t)),!i.reversing&&e===0&&Math.abs(i.speed)<.12&&(i.speed=0),i.reversing&&n===0&&Math.abs(i.speed)<.12&&(i.speed=0,i.reversing=!1);let o=1/(1+an.steerFalloff*i.speed*i.speed),a=s*an.steerMax*o,c=i.speed/an.wheelbase*Math.tan(a);i.yaw=c,i.heading-=c*t;let l=Math.max(-an.leanMax,Math.min(an.leanMax,c*i.speed*.11));return i.lean+=(l-i.lean)*Math.min(1,an.leanRate*t),i.x+=Math.sin(i.heading)*i.speed*t,i.z+=Math.cos(i.heading)*i.speed*t,i.wheel+=i.speed/.21*t,i}var O_=10470584,z_=15262418,H_=13028046;function xe(i,t,e,n,s,r=0,o=0,a=0){let c=new ft(i,t);return c.position.set(e,n,s),c.rotation.set(r,o,a),c.castShadow=!0,c}function qd(){let i=new ge,t=new Rt({color:O_,roughness:.35,metalness:.25}),e=new Rt({color:z_,roughness:.5}),n=new Rt({color:H_,roughness:.22,metalness:.85}),s=new Rt({color:2435116,roughness:.85}),r=new Rt({color:5522223,roughness:.62}),o=new Rt({color:14214378,roughness:.1,metalness:.1,transparent:!0,opacity:.55}),a=new fe(.3,14,12);i.add(xe(a,t,.26,.52,-.3)),i.add(xe(a,t,-.26,.52,-.3));let c=i.children[i.children.length-1],l=i.children[i.children.length-2];c.scale.set(.72,.95,1.55),l.scale.set(.72,.95,1.55),i.add(xe(new ht(.42,.3,.86),t,0,.56,-.26)),i.add(xe(new ht(.46,.055,.62),e,0,.3,.28)),i.add(xe(new ht(.5,.62,.1),t,0,.62,.6,-.3)),i.add(xe(new ht(.44,.3,.09),e,0,.4,.66,-.3));let h=xe(new Re(.13,.42,4,8),r,0,.79,-.16,0,0,Math.PI/2);h.scale.set(1,1,1.15),i.add(h),i.add(xe(new qt(.055,.055,.62,8),n,0,.86,.66,-.28)),i.add(xe(new qt(.028,.028,.66,6),n,0,1.09,.6,0,0,Math.PI/2));for(let y of[-.3,.3])i.add(xe(new qt(.035,.035,.14,6),s,y,1.09,.6,0,0,Math.PI/2)),i.add(xe(new qt(.012,.012,.2,5),n,y*.9,1.2,.6)),i.add(xe(new Li(.055,10),n,y*.9,1.3,.6,0,y>0?.5:-.5,0));let d=xe(new fe(.115,12,10),n,0,.99,.74);d.scale.set(1,1,.62),i.add(d),i.add(xe(new Li(.095,12),new Rt({color:16774360,roughness:.2,emissive:16771504,emissiveIntensity:.35}),0,.99,.8)),i.add(xe(new ht(.44,.34,.02),o,0,1.32,.66,-.24));let u=new qt(.205,.205,.115,16),f=new qt(.115,.115,.12,12),g=[];for(let[y,p]of[[.62,!0],[-.52,!1]]){let m=new ge;m.add(xe(u,s,0,0,0,0,0,Math.PI/2)),m.add(xe(f,e,0,0,0,0,0,Math.PI/2)),m.position.set(0,.205,y),i.add(m),g.push(m),p&&(i.add(xe(new ht(.07,.44,.07),n,.1,.42,y,-.16)),i.add(xe(new ht(.28,.05,.34),t,0,.45,y+.02)))}return i.add(xe(new qt(.045,.055,.42,8),n,.24,.3,-.44,0,0,Math.PI/2.4)),{group:i,wheels:g}}function Yd(){let i=new ge,t=new Ue({color:13194559}),e=new Ue({color:3686735}),n=new Ue({color:9071186}),s=new Rt({color:15131352,roughness:.3,metalness:.1}),r=new Rt({color:2765112,roughness:.1,metalness:.3}),o=xe(new Re(.17,.4,4,10),t,0,1.16,-.1,-.22);i.add(o);let a=xe(new fe(.135,14,12),s,0,1.55,-.02);i.add(a),i.add(xe(new fe(.118,12,10),r,0,1.545,.055));for(let c of[-.13,.13])i.add(xe(new Re(.085,.3,4,8),e,c,.9,.1,Math.PI/2.3)),i.add(xe(new Re(.072,.28,4,8),e,c,.58,.3,.22)),i.add(xe(new fe(.062,8,7),e,c,.36,.34)),i.add(xe(new Re(.055,.4,4,8),t,c*1.7,1.2,.26,Math.PI/2.6)),i.add(xe(new fe(.05,8,7),n,c*2.3,1.09,.56));return i}var G_=new URLSearchParams(location.search),gh=G_.has("touch")||matchMedia("(pointer: coarse)").matches||navigator.maxTouchPoints>0,Ie={steer:0,throttle:0,brake:0,moveX:0,moveY:0,run:!1,toggleMode:!1,stickActive:!1,stickDX:0,stickDY:0},eo={x:92,yFromBottom:92,radius:54};function k_(){return{cx:eo.x,cy:innerHeight-eo.yFromBottom}}var ph=0,mh=0,He=new Set;addEventListener("keydown",i=>{He.add(i.code),(i.code==="KeyE"||i.code==="KeyF")&&(Ie.toggleMode=!0),["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(i.code)&&i.preventDefault()});addEventListener("keyup",i=>He.delete(i.code));var no=new Map;function V_(i){return i<innerWidth*.5?"power":"steer"}function Zd(i){let t=s=>{window.__touchFired=(window.__touchFired||0)+1;for(let r of s.changedTouches)no.set(r.identifier,{startX:r.clientX,startY:r.clientY,x:r.clientX,y:r.clientY,px:r.clientX,py:r.clientY,side:V_(r.clientX)});s.preventDefault()},e=s=>{for(let r of s.changedTouches){let o=no.get(r.identifier);o&&(o.x=r.clientX,o.y=r.clientY)}s.preventDefault()},n=s=>{for(let r of s.changedTouches)no.delete(r.identifier)};i.addEventListener("touchstart",t,{passive:!1}),i.addEventListener("touchmove",e,{passive:!1}),i.addEventListener("touchend",n,{passive:!0}),i.addEventListener("touchcancel",n,{passive:!0})}function $d(i){let t=!1,e=0,n=0;i.addEventListener("mousedown",s=>{t=!0,e=s.clientX,n=s.clientY}),addEventListener("mouseup",()=>{t=!1}),addEventListener("mousemove",s=>{t&&(ph+=s.clientX-e,mh+=s.clientY-n,e=s.clientX,n=s.clientY)})}function Jd(i){let t=0,e=0,n=0;Ie.stickActive=!1;let s=0,r=0,o=ph,a=mh;ph=0,mh=0;for(let c of no.values()){if(c.side==="power")if(i==="walk"){let{cx:l,cy:h}=k_(),d=c.x-l,u=c.y-h,f=Math.hypot(d,u)||1,g=Math.min(f,eo.radius);d=d/f*g,u=u/f*g,s=d/eo.radius,r=u/eo.radius,Ie.stickActive=!0,Ie.stickDX=d,Ie.stickDY=u}else c.y<innerHeight*.62?e=1:n=1;else i==="walk"?(o+=c.x-c.px,a+=c.y-c.py):t=Math.max(-1,Math.min(1,(c.x-c.startX)/(innerWidth*.14)));c.px=c.x,c.py=c.y}return Ie.stickActive||(Ie.stickDX=0,Ie.stickDY=0),i==="walk"?((He.has("KeyA")||He.has("ArrowLeft"))&&(s=-1),(He.has("KeyD")||He.has("ArrowRight"))&&(s=1),(He.has("KeyW")||He.has("ArrowUp"))&&(r=-1),(He.has("KeyS")||He.has("ArrowDown"))&&(r=1)):((He.has("KeyA")||He.has("ArrowLeft"))&&(t=-1),(He.has("KeyD")||He.has("ArrowRight"))&&(t=1),(He.has("KeyW")||He.has("ArrowUp"))&&(e=1),(He.has("KeyS")||He.has("ArrowDown")||He.has("Space"))&&(n=1)),Ie.steer=t,Ie.throttle=e,Ie.brake=n,Ie.moveX=s,Ie.moveY=r,Ie.run=He.has("ShiftLeft")||He.has("ShiftRight"),{steer:t,throttle:e,brake:n,moveX:s,moveY:r,lookDX:o,lookDY:a,run:Ie.run}}function Kd(){return[...no.values()].map(i=>`${i.side}@${i.x|0},${i.y|0}`).join(" ")}var _c={speed:1.85,runSpeed:4.1,accel:9,turnRate:9};function Qd(i=0,t=0,e=0){return{x:i,z:t,heading:e,speed:0,phase:0}}function jd(i,t,e,n,s){let r=Math.min(1,Math.hypot(e,n)),o=r*(s?_c.runSpeed:_c.speed);if(i.speed+=(o-i.speed)*Math.min(1,_c.accel*t),r>.05){let c=Math.atan2(e,n)-i.heading;for(;c>Math.PI;)c-=Math.PI*2;for(;c<-Math.PI;)c+=Math.PI*2;i.heading+=c*Math.min(1,_c.turnRate*t)}return i.phase+=i.speed*t*2.4,i.x+=Math.sin(i.heading)*i.speed*t,i.z+=Math.cos(i.heading)*i.speed*t,i}function tf(){let i=new ge,t=new Ue({color:13194559}),e=new Ue({color:3686735}),n=new Ue({color:9071186}),s=new Ue({color:2366486}),r=new Ue({color:2828067}),o=(M,E,_,A,S)=>{let w=new ft(M,E);return w.position.set(_,A,S),w.castShadow=!0,i.add(w),w},a=o(new Re(.135,.36,4,10),t,0,1.24,0),c=o(new Re(.125,.1,3,8),e,0,.95,0),l=o(new fe(.112,14,12),n,0,1.62,0);o(new fe(.119,14,10,0,Math.PI*2,0,Math.PI*.6),s,0,1.64,0),o(new qt(.055,.062,.1,8),n,0,1.47,0);let h=o(new Re(.048,.42,3,8),t,-.2,1.22,0),d=o(new Re(.048,.42,3,8),t,.2,1.22,0),u=o(new fe(.055,8,7),n,-.205,.99,0),f=o(new fe(.055,8,7),n,.205,.99,0),g=o(new Re(.062,.46,3,8),e,-.09,.53,0),y=o(new Re(.062,.46,3,8),e,.09,.53,0),p=o(new ht(.115,.075,.26),r,-.09,.06,.03),m=o(new ht(.115,.075,.26),r,.09,.06,.03);return{group:i,pose(M,E){let _=E>.1?Math.sin(M*2.4):0;h.rotation.x=_*.7,d.rotation.x=-_*.7,g.rotation.x=-_*.8,y.rotation.x=_*.8,u.position.z=_*.28,f.position.z=-_*.28,p.position.z=.03-_*.32,m.position.z=.03+_*.32;let A=E>.1?Math.abs(Math.cos(M*2.4))*.03:0;a.position.y=1.24+A,l.position.y=1.62+A,c.position.y=.95+A}}}var io=new Rt({color:14605008,roughness:.86}),W_=new Rt({color:14069316,roughness:.86});function Zs(i,t,e,n,s){if(!t.length)return 0;let r=new Ee(e,n),o=new Oe(r,s,t.length),a=new ee,c=new Se,l=new Te,h=new L,d=new L(1,1,1);return t.forEach((u,f)=>{h.set(u[0],u[1],u[2]),l.set(-Math.PI/2,u[3],0,"YXZ"),c.setFromEuler(l),a.compose(h,c,d),o.setMatrixAt(f,a)}),o.receiveShadow=!0,i.add(o),t.length}function ef(i,t){let e=t.p,n=t.w/2,s=[],r=[],o=[],a=[],c=[],l=[],h=0;for(let u=0;u<e.length-1;u++){let[f,g]=e[u],[y,p]=e[u+1],m=y-f,M=p-g,E=Math.hypot(m,M);if(E<.5)continue;let _=m/E,A=M/E,S=-A,w=_,x=Math.atan2(_,A);for(let b=0;b<E;b+=1,h++){let R=f+_*b,I=g+A*b;if(h%9<3)for(let P of[-3.6,3.6])s.push([R+S*P,.075,I+w*P,x]);if(h%2===0)for(let P of[-1,1])r.push([R+S*(n-.55)*P,.075,I+w*(n-.55)*P,x]);if(h%2===0)for(let P of[-1,1])o.push([R+S*(n-.12)*P,.078,I+w*(n-.12)*P,x]),o.push([R+S*(n-.34)*P,.078,I+w*(n-.34)*P,x]);if(h%190===24)for(let P of[-1,1])a.push([R+S*(n*.5)*P,.08,I+w*(n*.5)*P,x+Math.PI/2]);if(h%190===60||h%190===140)for(let P of[-5.4,-1.9,1.9,5.4])c.push([R+S*P,.08,I+w*P,x]),l.push([R+S*P+_*1.9,.08,I+w*P+A*1.9,x])}}let d=0;return d+=Zs(i,s,.14,1,io),d+=Zs(i,r,.12,2,io),d+=Zs(i,o,.1,2,W_),d+=Zs(i,a,.42,n*.92,io),d+=Zs(i,c,.28,3.2,io),d+=Zs(i,l,.92,.9,io),d}function nf(i,t,e,n,s){let r=new s,o=[],a=[],c=[],l=0;for(let M of t.roads){if(!M.n||/orchard road/i.test(M.n)||M.k==="footway"||M.k==="pedestrian"||M.k==="service")continue;let E=M.p,_=M.w/2,A=0;for(let w=0;w<E.length-1;w++)A+=Math.hypot(E[w+1][0]-E[w][0],E[w+1][1]-E[w][1]);if(A<45)continue;l++;let S=0;for(let w=0;w<E.length-1;w++){let[x,b]=E[w],[R,I]=E[w+1],P=R-x,U=I-b,O=Math.hypot(P,U);if(O<.5)continue;let D=P/O,k=U/O,F=-k,H=D,Y=Math.atan2(D,k);for(let J=0;J<O;J+=4,S+=4){let $=x+D*J,st=b+k*J;for(let rt of[-1,1]){let Tt=$+F*(_+.4)*rt,vt=st+H*(_+.4)*rt;if(n(Tt,vt)||o.push([Tt,.15,vt,Y]),S%44===0){let q=$+F*(_+2.8)*rt,ot=st+H*(_+2.8)*rt;n(q,ot)||r.add(q,ot,it(.6,.9))}S%96===0&&!n(Tt,vt)&&(a.push([Tt,3.6,vt,Y]),c.push([Tt-F*.9*rt,7,vt-H*.9*rt,Y,rt]))}}}}let h=new ee,d=new Se,u=new Te,f=new L,g=new L(1,1,1),y=(M,E,_,A)=>{if(!_.length)return;let S=new Oe(M,E,_.length);_.forEach((w,x)=>{A(w),h.compose(f,d,g),S.setMatrixAt(x,h)}),S.castShadow=!1,S.receiveShadow=!0,i.add(S)},p=M=>{f.set(M[0],M[1],M[2]),u.set(0,M[3],0),d.setFromEuler(u)};y(new ht(.38,.3,4),Pt.kerb,o,p),y(new qt(.09,.13,7.2,8),Pt.metal,a,p),y(new ht(.9,.16,.4),Pt.trim,c,M=>{f.set(M[0],M[1],M[2]),u.set(0,M[3],0),d.setFromEuler(u)});let m=r.build(i);return{sideRoads:l,sideTrees:m,sideKerbs:o.length}}var xh=[11876142,2051962,14067004,3107663,8011629,13593402,2830131,11022927,4026255],X_=[11680302,3107727,13672506,3504725,9060208],_h=new Map;function q_(i,t,e){let n=i+t+e;if(_h.has(n))return _h.get(n);let s=512,r=128,o=document.createElement("canvas");o.width=s,o.height=r;let a=o.getContext("2d");a.fillStyle=t,a.fillRect(0,0,s,r),a.fillStyle="rgba(255,255,255,0.10)",a.fillRect(0,0,s,5),a.fillStyle=e,a.textAlign="center",a.textBaseline="middle";let c=62,l=i.toUpperCase();do a.font=`600 ${c}px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial`,c-=3;while(a.measureText(l).width>s-44&&c>16);a.fillText(l,s/2,r/2+3);let h=new Qn(o);return h.colorSpace=De,h.anisotropy=4,_h.set(n,h),h}function Ze(i,t,e,n,s,r){let o=new ft(i,t);return o.position.set(e,n,s),o.rotation.y=r,o.castShadow=!0,o.receiveShadow=!0,o}function sf(i,t,e,n,s){let r=new ge,o=Pt.metal,a=Pt.darkMetal,c=s/2+1.2;for(let d of[-1,1])r.add(Ze(new qt(.22,.28,7.4,10),o,d*c,3.7,0,0)),r.add(Ze(new ht(1.2,.35,1.2),Pt.conc,d*c,.18,0,0));r.add(Ze(new ht(s+2.8,.85,.55),o,0,7.2,0,0)),r.add(Ze(new ht(s+2.8,.28,.32),o,0,6.4,0,0));let l=Math.max(3,Math.round(s/3.4));for(let d=0;d<l;d++){let u=-s/2+(d+.5)*(s/l),f=Ze(new ht(.62,.3,.85),a,u,6.75,.5,0);f.rotation.x=.42,r.add(f)}for(let d of[-1,1])r.add(Ze(new ht(.4,.4,.75),a,d*(c-1.4),6.9,-.5,0));let h=Ze(new ht(2.4,.9,.12),new Rt({color:1842978,emissive:13208094,emissiveIntensity:.55}),0,8.1,.1,0);r.add(h),r.position.set(t,0,e),r.rotation.y=n,i.add(r)}function Y_(i,t,e,n,s){let r=new ge,o=Pt.metal,a=Pt.conc,c=s+14;r.add(Ze(new ht(c,.42,2.6),a,0,6,0,0)),r.add(Ze(new ht(c,.16,3),Pt.trim,0,8.6,0,0));for(let l of[-1,1]){r.add(Ze(new ht(c,1.05,.1),o,0,6.75,l*1.3,0));for(let h=0;h<=10;h++){let d=-c/2+h/10*c;r.add(Ze(new qt(.055,.055,2.4,6),o,d,7.4,l*1.3,0))}}for(let l of[-1,1]){let h=l*(c/2-1);r.add(Ze(new ht(2.6,6,2.8),a,h,3,l*3.2,0));for(let d=0;d<12;d++)r.add(Ze(new ht(2.2,.16,.34),a,h,.5+d*.46,l*(1.9+d*.2),0))}r.position.set(t,0,e),r.rotation.y=n,i.add(r)}function rf(i,t,e,n,s){let r=new ge,o=Pt.metal,a=Pt.conc,c=new Rt({color:11059407,roughness:.12,metalness:.25,transparent:!0,opacity:.62,side:Ce});r.add(Ze(new ht(7.4,.4,5.2),a,0,-.2,0,0));for(let u=0;u<9;u++){let f=new ft(new ht(4.6,.17,.42),a);f.position.set(0,-.28-u*.17,-1.6+u*.42),f.receiveShadow=!0,r.add(f)}r.add(Ze(new ht(4.8,.1,3.2),new Cn({color:856340}),0,-1.9,1.4,0));for(let u of[-1,1]){r.add(Ze(new ht(.07,.05,5),o,u*2.6,1.05,0,0)),r.add(Ze(new ht(.06,.04,5),o,u*2.6,.66,0,0));for(let f=0;f<4;f++)r.add(Ze(new qt(.03,.03,1.05,6),o,u*2.6,.52,-2.2+f*1.5,0))}let l=new ft(new qt(3.5,3.5,6.6,16,1,!0,Math.PI*.08,Math.PI*.84),c);l.rotation.z=Math.PI/2,l.position.set(0,2.5,0),l.castShadow=!0,r.add(l);for(let u=0;u<=5;u++){let f=new ft(new Cr(3.5,.05,5,12,Math.PI*.84),o);f.rotation.y=Math.PI/2,f.rotation.z=Math.PI*.08,f.position.set(-3.3+u*1.32,2.5,0),r.add(f)}let h=new ft(new ht(.34,3.3,1.05),Pt.darkMetal);h.position.set(4.3,1.65,0),h.castShadow=!0,r.add(h);let d=(()=>{let u=document.createElement("canvas");u.width=128,u.height=400;let f=u.getContext("2d");f.fillStyle="#c8102e",f.fillRect(0,0,128,130),f.fillStyle="#00358e",f.fillRect(0,130,128,270),f.fillStyle="#ffffff",f.font="700 30px ui-sans-serif, system-ui, Helvetica, Arial",f.textAlign="center",f.fillText("MRT",64,82),f.save(),f.translate(64,265),f.rotate(-Math.PI/2);let g=30;do f.font=`600 ${g}px ui-sans-serif, system-ui, Helvetica, Arial`,g-=2;while(f.measureText(s.toUpperCase()).width>230&&g>12);f.fillText(s.toUpperCase(),0,8),f.restore();let y=new Qn(u);return y.colorSpace=De,y})();for(let u of[-1,1]){let f=new ft(new Ee(1,3.15),new Rt({map:d,roughness:.5}));f.position.set(4.3+u*.18,1.65,0),f.rotation.y=u>0?Math.PI/2:-Math.PI/2,r.add(f)}r.position.set(t,0,e),r.rotation.y=n,i.add(r)}function of(i,t,e,n){let s=t.p,r=t.w/2,o={erp:0,bridges:0,banners:0,medianPlants:0,roofSigns:0,banners2:0},a=[],c=[],l=[],h=[],d=0;for(let w=0;w<s.length-1;w++){let[x,b]=s[w],[R,I]=s[w+1],P=R-x,U=I-b,O=Math.hypot(P,U);if(O<.5)continue;let D=P/O,k=U/O,F=-k,H=D,Y=Math.atan2(D,k);for(let J=0;J<O;J+=1,d++){let $=x+D*J,st=b+k*J;if(d%3===0&&c.push([$,.14,st,Y]),d%7===0&&l.push([$+F*it(-.45,.45),.72,st+H*it(-.45,.45),Y]),d%46===0&&h.push([$,0,st,Y]),d%34===8)for(let rt of[-1,1]){let Tt=$+F*(r+.4)*rt,vt=st+H*(r+.4)*rt;n(Tt,vt)||a.push([Tt+F*.28*rt,5.4,vt+H*.28*rt,Y])}if(d===520||d===560)for(let rt of[-1,1]){let Tt=$+F*(r+7.5)*rt,vt=st+H*(r+7.5)*rt;(!n(Tt,vt)&&d===520?rt>0:rt<0)&&(rf(i,Tt,vt,Y+(rt>0?0:Math.PI),d===520?"Orchard":"Somerset"),o.mrt=(o.mrt||0)+1)}if(d===1e3){let rt=$+F*(r+7.5),Tt=st+H*(r+7.5);n(rt,Tt)||(rf(i,rt,Tt,Y,"Somerset"),o.mrt=(o.mrt||0)+1)}d===300&&(sf(i,$,st,Y,t.w),o.erp++),d===700&&(sf(i,$,st,Y,t.w),o.erp++),(d===470||d===940)&&(Y_(i,$,st,Y,t.w),o.bridges++)}}let u=new ee,f=new Se,g=new Te,y=new L,p=new L(1,1,1),m=new Vt,M=(w,x,b,R,I)=>{if(!b.length)return;let P=new Oe(w,x,b.length);b.forEach((U,O)=>{R(U),u.compose(y,f,p),P.setMatrixAt(O,u),I&&P.setColorAt(O,I())}),P.instanceColor&&(P.instanceColor.needsUpdate=!0),P.castShadow=!1,P.receiveShadow=!0,i.add(P)},E=w=>{y.set(w[0],w[1],w[2]),g.set(0,w[3],0),f.setFromEuler(g)};M(new ht(2.1,.34,3),Pt.kerb,c,E),M(new fe(.66,7,5),new Ue({color:4152371}),l,w=>{y.set(w[0],.72,w[2]),f.identity(),p.set(1,.78,1)}),p.set(1,1,1),o.medianPlants=l.length,M(new qt(.14,.2,6.4,7),Pt.trunk,h,w=>{y.set(w[0],3.2,w[2]),f.identity()});let _=[];for(let[w,,x]of h)for(let b=0;b<7;b++)_.push([w,6.3,x,b/7*Math.PI*2]);M(new Ee(3.2,.8),Pt.leaf,_,w=>{y.set(w[0]+Math.sin(w[3])*1.4,w[1]-.35,w[2]+Math.cos(w[3])*1.4),g.set(-.95,w[3]+Math.PI/2,0,"YXZ"),f.setFromEuler(g)}),M(new ht(.06,1.6,.62),new Rt({roughness:.8,side:Ce}),a,E,()=>m.setHex(ze(X_))),o.banners=a.length;let A=[],S=[];for(let w of e.buildings){if(w.a<700)continue;let x=0,b=0;for(let J of w.p)x+=J[0],b+=J[1];x/=w.p.length,b/=w.p.length;let R=0,I=0;for(let J=0;J<w.p.length;J++){let $=w.p[J],st=w.p[(J+1)%w.p.length],rt=Math.hypot(st[0]-$[0],st[1]-$[1]);rt>I&&(I=rt,R=J)}let P=w.p[R],U=w.p[(R+1)%w.p.length],O=(P[0]+U[0])/2,D=(P[1]+U[1])/2,k=Math.atan2(U[0]-P[0],U[1]-P[1]),F=O-x,H=D-b,Y=Math.hypot(F,H)||1;if(w.n&&I>14){let J=ze(xh),$=Math.min(26,I*.55),st=new ft(new Ee($,$*.25),new Rt({map:q_(w.n,"#"+J.toString(16).padStart(6,"0"),"#f4f1ea"),roughness:.5,emissive:1381653,emissiveIntensity:.35})),rt=Math.min(w.h-2.2,7.4);st.position.set(O+F/Y*1.05,rt,D+H/Y*1.05),st.rotation.y=k+Math.PI/2,i.add(st);let Tt=new ft(new ht($+.5,$*.25+.5,.3),Pt.darkMetal);Tt.position.set(O+F/Y*.85,rt,D+H/Y*.85),Tt.rotation.y=k+Math.PI/2,Tt.castShadow=!0,i.add(Tt),o.nameSigns=(o.nameSigns||0)+1}w.h>34&&Sn(.55)&&A.push([O+F/Y*.6,w.h+2.2,D+H/Y*.6,k+Math.PI/2,Math.min(16,I*.4)]),w.h>14&&I>12&&Sn(.7)&&S.push([O+F/Y*1.1,9.5,D+H/Y*1.1,k+Math.PI/2])}if(A.length){let w=new Oe(new ht(1,3.2,.5),new Rt({roughness:.6}),A.length);A.forEach((x,b)=>{y.set(x[0],x[1],x[2]),g.set(0,x[3],0),f.setFromEuler(g),p.set(x[4],1,1),u.compose(y,f,p),w.setMatrixAt(b,u),w.setColorAt(b,m.setHex(ze(xh)))}),w.instanceColor&&(w.instanceColor.needsUpdate=!0),w.castShadow=!0,i.add(w),p.set(1,1,1)}return M(new ht(.9,7.5,.35),new Rt({roughness:.55}),S,E,()=>m.setHex(ze(xh))),o.roofSigns=A.length,o.banners2=S.length,o}var Z_=[14172207,14723634,4637802],$_=[0,0,0],yc=class{constructor(t){this.list=t||[]}stateAt(t,e){let n=(e+t.phase)%26;return n<15?0:n<15+2.5?1:2}update(t){for(let e of this.list){let n=this.stateAt(e,t);for(let s of e.lenses)for(let r=0;r<3;r++){let o=r===0&&n===2||r===1&&n===1||r===2&&n===0;s[r].material.emissive.setHex(o?Z_[r]:$_[r]),s[r].material.emissiveIntensity=o?1.1:0}}}nextStop(t,e,n,s=30){let r=null;for(let o of this.list){let a=e>0?o.s-t:t-o.s;a<-2||a>s||this.stateAt(o,n)!==0&&(r===null||a<r)&&(r=a)}return r}};var vc=class{constructor(){this.ready=!1,this.muted=!1,this._lastStep=0}start(){if(this.ready)return;let t=window.AudioContext||window.webkitAudioContext;if(!t)return;let e=new t;this.ctx=e,e.state==="suspended"&&e.resume();try{let l=e.createBuffer(1,1,e.sampleRate),h=e.createBufferSource();h.buffer=l,h.connect(e.destination),h.start(0)}catch{}this.master=e.createGain(),this.master.gain.value=0,this.master.connect(e.destination),this.engineGain=e.createGain(),this.engineGain.gain.value=0,this.engineFilter=e.createBiquadFilter(),this.engineFilter.type="lowpass",this.engineFilter.frequency.value=420,this.engineFilter.Q.value=3.2,this.engineFilter.connect(this.engineGain),this.engineGain.connect(this.master),this.osc1=e.createOscillator(),this.osc1.type="sawtooth",this.osc1.frequency.value=46,this.osc2=e.createOscillator(),this.osc2.type="sawtooth",this.osc2.frequency.value=46*2.01,this.osc3=e.createOscillator(),this.osc3.type="square",this.osc3.frequency.value=46*.5;let n=e.createGain();n.gain.value=.45;let s=e.createGain();s.gain.value=.3,this.osc1.connect(this.engineFilter),this.osc2.connect(n),n.connect(this.engineFilter),this.osc3.connect(s),s.connect(this.engineFilter),this.lfo=e.createOscillator(),this.lfo.frequency.value=5.5,this.lfoGain=e.createGain(),this.lfoGain.gain.value=1.6,this.lfo.connect(this.lfoGain),this.lfoGain.connect(this.osc1.frequency);let r=e.sampleRate*2,o=e.createBuffer(1,r,e.sampleRate),a=o.getChannelData(0),c=0;for(let l=0;l<r;l++){let h=Math.random()*2-1;c=(c+.02*h)/1.02,a[l]=c*3.2}this.noiseBuf=o,this.wind=e.createBufferSource(),this.wind.buffer=o,this.wind.loop=!0,this.windFilter=e.createBiquadFilter(),this.windFilter.type="bandpass",this.windFilter.frequency.value=700,this.windFilter.Q.value=.7,this.windGain=e.createGain(),this.windGain.gain.value=0,this.wind.connect(this.windFilter),this.windFilter.connect(this.windGain),this.windGain.connect(this.master),this.amb=e.createBufferSource(),this.amb.buffer=o,this.amb.loop=!0,this.ambFilter=e.createBiquadFilter(),this.ambFilter.type="lowpass",this.ambFilter.frequency.value=320,this.ambGain=e.createGain(),this.ambGain.gain.value=.16,this.amb.connect(this.ambFilter),this.ambFilter.connect(this.ambGain),this.ambGain.connect(this.master),this.traffic=e.createBufferSource(),this.traffic.buffer=o,this.traffic.loop=!0,this.trafficFilter=e.createBiquadFilter(),this.trafficFilter.type="bandpass",this.trafficFilter.frequency.value=240,this.trafficFilter.Q.value=.9,this.trafficGain=e.createGain(),this.trafficGain.gain.value=0,this.traffic.connect(this.trafficFilter),this.trafficFilter.connect(this.trafficGain),this.trafficGain.connect(this.master),this.traffic.start(),this.osc1.start(),this.osc2.start(),this.osc3.start(),this.lfo.start(),this.wind.start(),this.amb.start(),this.master.gain.setTargetAtTime(this.muted?0:.55,e.currentTime,.4),this.ready=!0,document.addEventListener("visibilitychange",()=>{!document.hidden&&this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume()})}poke(){this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume()}setMuted(t){this.muted=t,this.ready&&this.master.gain.setTargetAtTime(t?0:.55,this.ctx.currentTime,.15)}update(t,e,n,s,r=999){if(!this.ready||this.muted)return;let o=this.ctx.currentTime,a=Math.abs(t),c=Math.max(0,1-r/42);if(this.trafficGain.gain.setTargetAtTime(.02+c*c*.16,o,.35),this.trafficFilter.frequency.setTargetAtTime(210+c*220,o,.4),e==="ride"){let l=44+Math.pow(a,.86)*9.4;this.osc1.frequency.setTargetAtTime(l,o,.06),this.osc2.frequency.setTargetAtTime(l*2.01,o,.06),this.osc3.frequency.setTargetAtTime(l*.5,o,.06),this.engineFilter.frequency.setTargetAtTime(380+a*165,o,.1),this.engineGain.gain.setTargetAtTime(.1+Math.min(.3,a*.028),o,.12),this.windGain.gain.setTargetAtTime(Math.min(.3,a*a*.0022),o,.2),this.windFilter.frequency.setTargetAtTime(520+a*60,o,.2)}else if(this.engineGain.gain.setTargetAtTime(0,o,.25),this.windGain.gain.setTargetAtTime(0,o,.3),n>.3){let l=Math.floor(s*2.4/Math.PI);l!==this._lastStep&&(this._lastStep=l,this._footstep(n))}}_footstep(t){let e=this.ctx,n=e.currentTime,s=e.createBufferSource();s.buffer=this.noiseBuf,s.playbackRate.value=1.6;let r=e.createBiquadFilter();r.type="bandpass",r.frequency.value=1150,r.Q.value=1.1;let o=e.createGain();o.gain.setValueAtTime(0,n),o.gain.linearRampToValueAtTime(.055*Math.min(1,t/2),n+.008),o.gain.exponentialRampToValueAtTime(1e-4,n+.13),s.connect(r),r.connect(o),o.connect(this.master),s.start(n,Math.random()*1.5),s.stop(n+.16)}};var Mc=class{constructor(t){this.pts=t,this.cum=[0];for(let e=0;e<t.length-1;e++)this.cum.push(this.cum[e]+Math.hypot(t[e+1][0]-t[e][0],t[e+1][1]-t[e][1]));this.len=this.cum[this.cum.length-1]}nearestS(t,e){let n=0,s=1/0;for(let r=0;r<this.pts.length;r++){let o=(this.pts[r][0]-t)**2+(this.pts[r][1]-e)**2;o<s&&(s=o,n=this.cum[r])}return n}at(t,e){let n=(t%this.len+this.len)%this.len,s=0,r=this.cum.length-1;for(;s<r-1;){let u=s+r>>1;this.cum[u]<=n?s=u:r=u}let o=this.pts[s],a=this.pts[Math.min(s+1,this.pts.length-1)],c=Math.max(1e-4,this.cum[s+1]-this.cum[s]),l=(n-this.cum[s])/c,h=(a[0]-o[0])/c,d=(a[1]-o[1])/c;return e[0]=o[0]+(a[0]-o[0])*l,e[1]=o[1]+(a[1]-o[1])*l,e[2]=h,e[3]=d,e}},J_=[9268046,11043422,7295288,12819058,8215616],K_=[1840914,2760986,1183500,4009762,5588024],Q_=[13194559,15262420,3100014,14271625,9080726,7176026,11903172,3885650,13994602,4878196,14734008,9194069],j_=[3356735,2831168,4867904,5854044,7498334,2040875],Sc=class{constructor(t,e,n=150){this.path=new Mc(t.p),this.half=t.w/2,this.isBlocked=e,this.count=n,this.people=[],this.crossings=[]}setCrossings(t){this.crossings=t||[]}_nearCrossing(t){for(let e of this.crossings){let n=e-(t%this.path.len+this.path.len)%this.path.len;if(Math.abs(n)<2)return e}return null}_pedGreen(t,e,n){if(!n)return!0;for(let s of n.list)if(Math.abs(s.s-t)<70)return n.stateAt(s,e)===2;return!0}build(t){let e=this.count,n=(l,h)=>{let d=new Oe(l,h,e);return d.castShadow=!0,d.frustumCulled=!1,t.add(d),d},s=l=>new Ue(l?{color:l}:{});this.head=n(new fe(.105,12,10),s()),this.hair=n(new fe(.112,12,8,0,Math.PI*2,0,Math.PI*.62),s()),this.torso=n(new Re(.125,.34,4,10),s()),this.hips=n(new Re(.115,.1,3,8),s()),this.armL=n(new Re(.045,.4,3,7),s()),this.armR=n(new Re(.045,.4,3,7),s()),this.legL=n(new Re(.058,.44,3,7),s()),this.legR=n(new Re(.058,.44,3,7),s()),this.bag=n(new ht(.22,.26,.1),s()),this.shoeL=n(new ht(.11,.07,.25),s(2828067)),this.shoeR=n(new ht(.11,.07,.25),s(2828067)),this.handL=n(new fe(.052,7,6),s()),this.handR=n(new fe(.052,7,6),s()),this.neck=n(new qt(.052,.06,.1,7),s());let r=new Vt,o=new Vt,a=new Vt,c=new Vt;for(let l=0;l<e;l++){let h=Sn(.5)?1:-1,d=Sn(.5)?1:-1,u={s:hn()*this.path.len,off:h*(this.half+it(3.2,10.5)),dir:d,speed:it(.95,1.65)*(Sn(.12)?0:1),phase:hn()*Math.PI*2,scale:it(.92,1.08),hasBag:Sn(.38),bagSide:Sn(.5)?1:-1,crosser:Sn(.34),crossing:!1,crossT:0,crossFrom:0,crossTo:0};u.cTop=ze(Q_),u.cBot=ze(j_),u.cSkin=ze(J_),u.cHair=ze(K_),this.people.push(u),r.setHex(u.cTop),o.setHex(u.cBot),a.setHex(u.cSkin),c.setHex(u.cHair),this.torso.setColorAt(l,r),this.armL.setColorAt(l,r),this.armR.setColorAt(l,r),this.hips.setColorAt(l,o),this.legL.setColorAt(l,o),this.legR.setColorAt(l,o),this.head.setColorAt(l,a),this.hair.setColorAt(l,c),this.bag.setColorAt(l,o),this.handL.setColorAt(l,a),this.handR.setColorAt(l,a),this.neck.setColorAt(l,a)}for(let l of[this.torso,this.armL,this.armR,this.hips,this.legL,this.legR,this.head,this.hair,this.bag,this.handL,this.handR,this.neck])l.instanceColor&&(l.instanceColor.needsUpdate=!0);return this._m=new ee,this._q=new Se,this._e=new Te,this._p=new L,this._s=new L(1,1,1),this._tmp=[0,0,0,0],this.update(0,0),e}update(t,e,n=1e9,s=1e9,r=null){let{_m:o,_q:a,_e:c,_p:l,_s:h,_tmp:d}=this,u=this._hidden||(this._hidden=new ee().makeTranslation(0,-9999,0)),f=0,g=this._parts||(this._parts=[this.head,this.hair,this.torso,this.hips,this.armL,this.armR,this.legL,this.legR,this.bag,this.shoeL,this.shoeR,this.handL,this.handR,this.neck]);for(let y=0;y<this.people.length;y++){let p=this.people[y];if(p.crossing){p.crossT+=e/5.2;let q=p.crossT<.5?2*p.crossT*p.crossT:1-2*(1-p.crossT)*(1-p.crossT);p.off=p.crossFrom+(p.crossTo-p.crossFrom)*Math.min(1,q),p.crossT>=1&&(p.crossing=!1,p.off=p.crossTo,p.waited=0)}else if(p.crosser&&p.speed>.1){let q=this._nearCrossing(p.s);q!==null&&this._pedGreen(q,t,r)?(p.crossing=!0,p.crossT=0,p.crossFrom=p.off,p.crossTo=-p.off):p.s+=p.dir*p.speed*e}else p.s+=p.dir*p.speed*e;this.path.at(p.s,d);let[m,M,E,_]=d,A=-_,S=E,w=m+A*p.off,x=M+S*p.off,b=w-n,R=x-s,I=Math.hypot(b,R);if(I<2.6){let q=(2.6-I)/2.6;p.dodge=(p.dodge||0)+(q*1.5-(p.dodge||0))*Math.min(1,e*5)}else p.dodge&&(p.dodge+=(0-p.dodge)*Math.min(1,e*2.2),Math.abs(p.dodge)<.01&&(p.dodge=0));let P=p.off>=0?1:-1,U=w+A*(p.dodge||0)*P,O=x+S*(p.dodge||0)*P;if(this.isBlocked(U,O))continue;let D=U-n,k=O-s;if(D*D+k*k>11025)continue;let F=f++,H=Math.atan2(E*p.dir,_*p.dir),Y=p.scale,J=p.crossing||p.speed>.1,$=J?Math.sin(t*5.2*(p.speed/1.3)+p.phase):0,st=J?Math.abs(Math.cos(t*5.2+p.phase))*.022:0,rt=(q,ot,et,ut,Ot,Nt)=>{let oe=U+(A*ot+E*ut),It=O+(S*ot+_*ut);l.set(oe,et*Y+st,It),c.set(Ot||0,H,Nt||0,"YXZ"),a.setFromEuler(c),h.set(Y,Y,Y),o.compose(l,a,h),q.setMatrixAt(F,o)};rt(this.neck,0,1.47,.005),rt(this.head,0,1.615,.01),rt(this.hair,0,1.635,.005),rt(this.torso,0,1.22,0),rt(this.hips,0,.94,0),rt(this.armL,-.19,1.2,0,$*.62),rt(this.armR,.19,1.2,0,-$*.62),rt(this.legL,-.085,.52,0,-$*.72),rt(this.legR,.085,.52,0,$*.72),rt(this.shoeL,-.085,.06,.02-$*.3),rt(this.shoeR,.085,.06,.02+$*.3),rt(this.handL,-.205,.99,$*.27),rt(this.handR,.205,.99,-$*.27),p.hasBag?rt(this.bag,p.bagSide*.26,1.02,-.06):this.bag.setMatrixAt(F,u);let Tt=this._cc||(this._cc=new Vt),vt=(q,ot)=>{q.instanceColor&&(Tt.setHex(ot),q.setColorAt(F,Tt))};vt(this.torso,p.cTop),vt(this.armL,p.cTop),vt(this.armR,p.cTop),vt(this.hips,p.cBot),vt(this.legL,p.cBot),vt(this.legR,p.cBot),vt(this.bag,p.cBot),vt(this.head,p.cSkin),vt(this.handL,p.cSkin),vt(this.handR,p.cSkin),vt(this.neck,p.cSkin),vt(this.hair,p.cHair)}for(let y of g)y.count=f,y.instanceMatrix.needsUpdate=!0,y.instanceColor&&(y.instanceColor.needsUpdate=!0)}},ty=[14211806,2830392,9409948,8007466,2572382,12172480,4016703],bc=class{constructor(t,e=16,n=3){this.path=new Mc(t.p),this.half=t.w/2,this.nCars=e,this.nBuses=n,this.items=[]}build(t,e=0){let n=this.nCars,s=this.nBuses,r=(u,f,g)=>{let y=new Oe(u,f,g);return y.castShadow=!0,y.receiveShadow=!0,y.frustumCulled=!1,t.add(y),y},o=new Rt({roughness:.38,metalness:.3}),a=new Rt({color:2765370,roughness:.12,metalness:.2}),c=new Rt({color:2369323,roughness:.85});this.body=r(new ht(1.78,.62,4.32),o,n),this.roof=r(new ht(1.64,.5,2.1),o,n),this.glaze=r(new ht(1.69,.38,2),a,n),this.wheel=r(new qt(.31,.31,.2,10),c,n*4),this.busBody=r(new ht(2.5,2.5,11.8),new Rt({roughness:.5}),s),this.busSkirt=r(new ht(2.54,.62,11.7),new Rt({color:15790057,roughness:.6}),s),this.busGlaze=r(new ht(2.54,.95,10.4),a,s),this.busBlind=r(new ht(1.65,.42,.08),new Rt({color:1711392,emissive:14197308,emissiveIntensity:.5}),s),this.busWheel=r(new qt(.48,.48,.28,10),c,s*4);let l=new Vt;for(let u=0;u<n;u++){let f=u%2===0?1:-1,g=it(7,12);this.items.push({kind:"car",i:u,s:e+55+(this.path.len-110)/n*u+it(-6,6),lane:f*(1.9+(u%4<2?0:3.4)),dir:f,speed:g,base:g}),l.setHex(ze(ty)),this.body.setColorAt(u,l),this.roof.setColorAt(u,l)}this.body.instanceColor&&(this.body.instanceColor.needsUpdate=!0),this.roof.instanceColor&&(this.roof.instanceColor.needsUpdate=!0);let h=[4160838,4160838,12858415],d=new Vt;for(let u=0;u<s;u++){let f=u%2===0?1:-1;d.setHex(h[u%h.length]),this.busBody.setColorAt(u,d);let g=it(6,9);this.items.push({kind:"bus",i:u,s:e+140+(this.path.len-200)/s*u+it(-15,15),lane:f*5.4,dir:f,speed:g,base:g})}return this.busBody.instanceColor&&(this.busBody.instanceColor.needsUpdate=!0),this._m=new ee,this._q=new Se,this._e=new Te,this._p=new L,this._s=new L(1,1,1),this._tmp=[0,0,0,0],this.update(0,0),n+s}nearest(t,e){let n=1e9;for(let s of this.items){if(!s.wx)continue;let r=(t-s.wx)**2+(e-s.wz)**2;r<n&&(n=r)}return Math.sqrt(n)}hits(t,e,n=.85){for(let s of this.items){if(!s.wx)continue;let r=t-s.wx,o=e-s.wz;if(r*r+o*o>60)continue;let a=Math.cos(-s.heading),c=Math.sin(-s.heading),l=r*a-o*c,h=r*c+o*a,d=(s.kind==="bus"?1.35:.95)+n,u=(s.kind==="bus"?6:2.25)+n;if(Math.abs(l)<d&&Math.abs(h)<u)return s}return null}update(t,e,n){let{_m:s,_q:r,_e:o,_p:a,_s:c,_tmp:l}=this;for(let h of this.items){let d=h.base;if(n){let S=n.nextStop(h.s,h.dir,t,34);S!==null&&(d=S<=3?0:h.base*Math.min(1,(S-3)/22))}for(let S of this.items){if(S===h||S.dir!==h.dir||Math.abs(S.lane-h.lane)>1.6)continue;let w=(S.s-h.s)*h.dir,x=h.kind==="bus"||S.kind==="bus"?15:9;w>0&&w<x&&(d=Math.min(d,h.base*Math.max(0,(w-4.5)/(x-4.5))))}let u=d<h.speed?7:2.2;h.speed+=(d-h.speed)*Math.min(1,u*e),h.s+=h.dir*h.speed*e,this.path.at(h.s,l);let[f,g,y,p]=l,m=-p,M=y,E=f+m*h.lane,_=g+M*h.lane,A=Math.atan2(y*h.dir,p*h.dir);if(h.wx=E,h.wz=_,h.heading=A,o.set(0,A,0),r.setFromEuler(o),h.kind==="car"){a.set(E,.62,_),s.compose(a,r,c),this.body.setMatrixAt(h.i,s),a.set(E-y*.35*h.dir,1.14,_-p*.35*h.dir),s.compose(a,r,c),this.roof.setMatrixAt(h.i,s),s.compose(a,r,c),this.glaze.setMatrixAt(h.i,s);for(let S=0;S<4;S++){let w=(S<2?1.4:-1.4)*h.dir,x=S%2?.86:-.86;a.set(E+y*w+m*x,.31,_+p*w+M*x),o.set(0,A,Math.PI/2,"YXZ"),this._q2=this._q2||new Se,this._q2.setFromEuler(o),s.compose(a,this._q2,c),this.wheel.setMatrixAt(h.i*4+S,s)}}else{a.set(E,1.55,_),s.compose(a,r,c),this.busBody.setMatrixAt(h.i,s),a.set(E,.62,_),s.compose(a,r,c),this.busSkirt.setMatrixAt(h.i,s),a.set(E,2.05,_),s.compose(a,r,c),this.busGlaze.setMatrixAt(h.i,s),a.set(E+y*5.95*h.dir,2.42,_+p*5.95*h.dir),s.compose(a,r,c),this.busBlind.setMatrixAt(h.i,s);for(let S=0;S<4;S++){let w=(S<2?3.6:-3.6)*h.dir,x=S%2?1.2:-1.2;a.set(E+y*w+m*x,.48,_+p*w+M*x),o.set(0,A,Math.PI/2,"YXZ"),this._q2=this._q2||new Se,this._q2.setFromEuler(o),s.compose(a,this._q2,c),this.busWheel.setMatrixAt(h.i*4+S,s)}}}for(let h of[this.body,this.roof,this.glaze,this.wheel,this.busBody,this.busSkirt,this.busGlaze,this.busBlind,this.busWheel])h.instanceMatrix.needsUpdate=!0}};var ey=[11876142,2051962,14067004,3107663,8011629,13593402,2830131];function af(i,t,e){let n=t.p,s=t.w/2,r=[],o=[],a=[],c=[],l=[],h=[],d=[],u=[],f=[],g=0;for(let U=0;U<n.length-1;U++){let[O,D]=n[U],[k,F]=n[U+1],H=k-O,Y=F-D,J=Math.hypot(H,Y);if(J<.5)continue;let $=H/J,st=Y/J,rt=-st,Tt=$,vt=Math.atan2($,st);for(let q=0;q<J;q+=1,g++){let ot=O+$*q,et=D+st*q;for(let ut of[-1,1]){let Ot=(s+1.1)*ut,Nt=ot+rt*Ot,oe=et+Tt*Ot;if(g%2===0&&!e(Nt,oe)&&(r.push([Nt,1,oe,vt]),g%4===0&&o.push([Nt,.55,oe,vt])),g%260===8){let It=ot+rt*(s+3)*ut,j=et+Tt*(s+3)*ut;e(It,j)||f.push([It,j,vt,ut])}if(g%260===120){let It=ot+rt*(s+5.6)*ut,j=et+Tt*(s+5.6)*ut;e(It,j)||a.push([It,j,vt,ut])}if(g%190===30){let It=ot+rt*(s+1.6)*ut,j=et+Tt*(s+1.6)*ut;e(It,j)||c.push([It,j,vt,ut,g])}if(g%46===12){let It=ot+rt*(s+6.4)*ut,j=et+Tt*(s+6.4)*ut;e(It,j)||h.push([It,.32,j,vt])}if(g%120===60){let It=ot+rt*(s+4.2)*ut,j=et+Tt*(s+4.2)*ut;e(It,j)||d.push([It,.46,j,vt])}if(g%26===8){let It=ot+rt*(s+12.5)*ut,j=et+Tt*(s+12.5)*ut;e(It,j)&&l.push([ot+rt*(s+11.4)*ut,it(6.2,7.6),et+Tt*(s+11.4)*ut,vt,ut])}}}}let y=new ee,p=new Se,m=new Te,M=new L,E=new L(1,1,1),_=(U,O,D,k,F)=>{if(!D.length)return null;let H=new Oe(U,O,D.length);return D.forEach((Y,J)=>{k(Y),y.compose(M,p,E),H.setMatrixAt(J,y),F&&H.setColorAt(J,F(Y,J))}),H.instanceColor&&(H.instanceColor.needsUpdate=!0),H.castShadow=!1,H.receiveShadow=!0,i.add(H),H},A=U=>{M.set(U[0],U[1],U[2]),m.set(0,U[3],0),p.setFromEuler(m)};_(new ht(.06,.05,2),Pt.metal,r,A),_(new ht(.05,.04,2),Pt.metal,r,U=>{M.set(U[0],.62,U[2]),m.set(0,U[3],0),p.setFromEuler(m)}),_(new qt(.035,.035,1,6),Pt.metal,o,A),_(new qt(.55,.46,.64,10),Pt.conc,h,A),_(new fe(.52,8,6),Pt.canopy,h,U=>{M.set(U[0],.86,U[2]),p.identity()}),_(new qt(.24,.2,.9,8),Pt.darkMetal,d,A);let S=new Vt;_(new ht(.28,1.05,2.6),new Rt({roughness:.55}),l,U=>{M.set(U[0],U[1],U[2]),m.set(0,U[3],0),p.setFromEuler(m)},()=>S.setHex(ze(ey)));for(let[U,O,D,k]of a){let F=new ge,H=new ft(new ht(9.2,.16,3.1),Pt.trim);H.position.y=3,H.castShadow=!0,F.add(H);for(let st=0;st<4;st++){let rt=new ft(new qt(.07,.07,3,8),Pt.metal);rt.position.set(-4.1+st*2.7,1.5,1.35),rt.castShadow=!0,F.add(rt)}let Y=new ft(new ht(8.8,1.7,.08),Pt.glass);Y.position.set(0,1.95,-1.4),F.add(Y);let J=new ft(new ht(7.4,.09,.46),Pt.metal);J.position.set(0,.62,-1.1),J.castShadow=!0,F.add(J);let $=new ft(new ht(.9,1.5,.1),new Rt({color:2568506,roughness:.3}));$.position.set(4.4,1.7,-1),F.add($),F.position.set(U,0,O),F.rotation.y=D,i.add(F)}let w=new Map;for(let[U,O,D,k,F]of c){let H=new ge,Y=new ft(new qt(.09,.11,5.4,8),Pt.darkMetal);Y.position.y=2.7,Y.castShadow=!0,H.add(Y);let J=new ft(new qt(.06,.06,3,6),Pt.darkMetal);J.position.set(-1.5*k,5.2,0),J.rotation.z=Math.PI/2,J.castShadow=!0,H.add(J);let $=new ft(new ht(.32,.86,.3),Pt.darkMetal);$.position.set(-2.9*k,4.9,0),$.castShadow=!0,H.add($);let st=[];for(let rt=0;rt<3;rt++){let Tt=new ft(new Li(.1,10),new Rt({color:[5906200,5915674,1785639][rt],emissive:0,emissiveIntensity:1}));Tt.position.set(-2.9*k,5.18-rt*.27,.16),H.add(Tt),st.push(Tt)}H.position.set(U,0,O),H.rotation.y=D,i.add(H),w.has(F)||w.set(F,{s:F,lenses:[],phase:w.size*5.5}),w.get(F).lenses.push(st)}for(let[U,O,D,k]of f){let F=new ge,H=new ft(new qt(.06,.06,3,8),Pt.metal);H.position.y=1.5,H.castShadow=!0,F.add(H);let Y=new ft(new ht(1,.5,.08),new Rt({color:14201916,roughness:.55}));Y.position.set(0,2.9,0),Y.castShadow=!0,F.add(Y);for(let q=0;q<5;q++){let ot=new ft(new ht(.05,.04,1.4),Pt.metal);ot.position.set(-.9,1,1+q*1.4),F.add(ot);let et=new ft(new qt(.03,.03,1,6),Pt.metal);et.position.set(-.9,.5,.4+q*1.4),F.add(et)}let J=Math.random()<.5?3104670:2040357,$=new ge,st=new Rt({color:J,roughness:.4,metalness:.3}),rt=new Rt({color:2765370,roughness:.12,metalness:.2}),Tt=(q,ot,et,ut,Ot,Nt,oe)=>{let It=new ft(new ht(q,ot,et),ut);It.position.set(Ot,Nt,oe),It.castShadow=!0,$.add(It)};Tt(1.78,.62,4.4,st,0,.6,0),Tt(1.64,.52,2.1,st,0,1.12,-.25),Tt(1.69,.4,2,rt,0,1.1,-.25),Tt(.62,.2,.5,new Rt({color:15786672,emissive:14198844,emissiveIntensity:.5}),0,1.48,-.25);let vt=new qt(.31,.31,.22,10);for(let[q,ot]of[[.86,1.45],[-.86,1.45],[.86,-1.45],[-.86,-1.45]]){let et=new ft(vt,Pt.darkMetal);et.rotation.x=Math.PI/2,et.position.set(q,.31,ot),et.castShadow=!0,$.add(et)}$.position.set(-2.6*k,0,2),F.add($),F.position.set(U,0,O),F.rotation.y=D,i.add(F)}let x=[],b=[],R=[],I=0;for(let U=0;U<n.length-1;U++){let[O,D]=n[U],[k,F]=n[U+1],H=k-O,Y=F-D,J=Math.hypot(H,Y);if(J<.5)continue;let $=H/J,st=Y/J,rt=-st,Tt=$,vt=Math.atan2($,st);for(let q=0;q<J;q+=1,I++){if(I%4!==0)continue;let ot=O+$*q,et=D+st*q;for(let ut of[-1,1]){let Ot=ot+rt*(s+9)*ut,Nt=et+Tt*(s+9)*ut;e(ot+rt*(s+13.5)*ut,et+Tt*(s+13.5)*ut)&&(b.push([Ot,3.35,Nt,vt]),R.push([Ot,3.12,Nt,vt]),x.push([Ot+rt*1.5*ut,1.6,Nt+Tt*1.5*ut,vt]),x.push([Ot-rt*1.5*ut,1.6,Nt-Tt*1.5*ut,vt]))}}}return _(new ht(3.4,.13,4.1),Pt.trim,b,A),_(new ht(.18,.22,4.1),Pt.metal,R,A),_(new qt(.075,.075,3.2,8),Pt.metal,x,A),{signals:[...w.values()],taxiStands:f.length,linkway:b.length,rails:r.length,shelters:a.length,lights:c.length,signs:l.length,planters:h.length}}function cf(i,t,e){let n=document.createElement("canvas");n.width=i,n.height=t,e(n.getContext("2d"),i,t);let s=new Qn(n);return s.colorSpace=De,s.anisotropy=4,s}function ny(i){return cf(512,192,(t,e,n)=>{t.fillStyle="#0f6b3f",t.fillRect(0,0,e,n),t.strokeStyle="#f2f4f0",t.lineWidth=5,t.strokeRect(9,9,e-18,n-18),t.fillStyle="#f2f4f0",t.font="600 44px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial",t.textBaseline="middle",i.forEach((s,r)=>{let o=i.length===1?n/2:58+r*62;t.fillText(s.text,34,o),t.save(),t.translate(e-66,o),s.dir==="left"&&t.rotate(Math.PI),t.beginPath(),t.moveTo(-20,0),t.lineTo(14,0),t.moveTo(2,-12),t.lineTo(14,0),t.lineTo(2,12),t.lineWidth=7,t.strokeStyle="#f2f4f0",t.lineJoin="round",t.stroke(),t.restore()})})}function iy(i){return cf(512,128,(t,e,n)=>{t.fillStyle="#f4f4f1",t.fillRect(0,0,e,n),t.fillStyle="#20477e",t.fillRect(0,0,e,22),t.fillStyle="#1b1d1f",t.font="700 52px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial",t.textBaseline="middle",t.textAlign="center";let s=52;for(;t.measureText(i.toUpperCase()).width>e-46&&s>22;)s-=2,t.font=`700 ${s}px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial`;t.fillText(i.toUpperCase(),e/2,n/2+10)})}function lf(i,t,e,n){let s=t.p,r=t.w/2,o={gantries:0,plates:0},a=[...new Set(e.roads.map(l=>l.n).filter(l=>l&&!/orchard road/i.test(l)))],c=0;for(let l=0;l<s.length-1;l++){let[h,d]=s[l],[u,f]=s[l+1],g=u-h,y=f-d,p=Math.hypot(g,y);if(p<.5)continue;let m=g/p,M=y/p,E=-M,_=m,A=Math.atan2(m,M);for(let S=0;S<p;S+=1,c++){let w=h+m*S,x=d+M*S;if(c%230===90){let b=new ge,R=new ft(new qt(.13,.16,7.2,8),Pt.darkMetal);R.position.set(E*(r+1),3.6,_*(r+1)),R.castShadow=!0,b.add(R);let I=new ft(new ht(r*1.1,.16,.16),Pt.darkMetal);I.position.set(E*(r*.45),7,_*(r*.45)),I.rotation.y=A,I.castShadow=!0,b.add(I);let P=ze(a)||"Scotts Road",U=ze(a)||"Paterson Road",O=new ft(new Ee(4.6,1.72),new Cn({map:ny([{text:P.slice(0,16),dir:"left"},{text:U.slice(0,16),dir:"right"}])}));O.position.set(E*(r*.42),5.9,_*(r*.42)),O.rotation.y=A+Math.PI,b.add(O);let D=new ft(new ht(4.6,1.72,.09),Pt.darkMetal);D.position.copy(O.position),D.position.y-=0,D.rotation.y=A,D.castShadow=!0,b.add(D),b.position.set(w,0,x),i.add(b),o.gantries++}if(c%150===40)for(let b of[-1,1]){let R=w+E*(r+2.4)*b,I=x+_*(r+2.4)*b;if(n(R,I))continue;let P=new ge,U=new ft(new qt(.05,.05,2.6,6),Pt.metal);U.position.y=1.3,U.castShadow=!0,P.add(U);let O=new ft(new Ee(1.5,.38),new Cn({map:iy("Orchard Road"),side:Ce}));O.position.y=2.5,P.add(O),P.position.set(R,0,I),P.rotation.y=A+Math.PI/2,i.add(P),o.plates++}}}return o}var Ec=class{constructor(t,e){this.places=[];for(let n of t.buildings){if(!n.n)continue;let s=0,r=0;for(let o of n.p)s+=o[0],r+=o[1];this.places.push({n:n.n,x:s/n.p.length,z:r/n.p.length,a:n.a})}this.axis=e,this.current="",this.el=document.getElementById("place"),this.map=document.getElementById("map"),this.mapCtx=this.map?this.map.getContext("2d"):null,this.bounds=this._bounds(t),this.base=this._renderBase(t),this._t=0}_bounds(t){let e=1e9,n=-1e9,s=1e9,r=-1e9;for(let o of t.buildings)for(let[a,c]of o.p)a<e&&(e=a),a>n&&(n=a),c<s&&(s=c),c>r&&(r=c);return{mnx:e,mxx:n,mnz:s,mxz:r}}_renderBase(t){if(!this.map)return null;let e=this.map.width,n=document.createElement("canvas");n.width=n.height=e;let s=n.getContext("2d"),{mnx:r,mxx:o,mnz:a,mxz:c}=this.bounds,l=Math.max(o-r,c-a)||1,h=u=>(u-r)/l*e*.94+e*.03,d=u=>(u-a)/l*e*.94+e*.03;this.px=h,this.pz=d,s.fillStyle="rgba(12,16,20,0.72)",s.fillRect(0,0,e,e),s.fillStyle="rgba(198,205,212,0.30)";for(let u of t.buildings)s.beginPath(),u.p.forEach(([f,g],y)=>y?s.lineTo(h(f),d(g)):s.moveTo(h(f),d(g))),s.closePath(),s.fill();return s.strokeStyle="rgba(255,214,150,0.95)",s.lineWidth=2.2,s.beginPath(),this.axis.p.forEach(([u,f],g)=>g?s.lineTo(h(u),d(f)):s.moveTo(h(u),d(f))),s.stroke(),n}update(t,e){if(this._t+=e,this._t<.25)return;this._t=0;let n=null,s=1/0;for(let r of this.places){let o=Math.hypot(r.x-t.x,r.z-t.z)-Math.min(60,Math.sqrt(r.a)*.5);o<s&&(s=o,n=r)}if(this.el){let r=n&&s<90?n.n:"Orchard Road";r!==this.current&&(this.current=r,this.el.textContent=r)}if(this.mapCtx&&this.base){let r=this.map.width,o=this.mapCtx;o.clearRect(0,0,r,r),o.drawImage(this.base,0,0);let a=this.px(t.x),c=this.pz(t.z);o.save(),o.translate(a,c),o.rotate(-t.heading),o.fillStyle="rgba(255,214,150,0.28)",o.beginPath(),o.moveTo(0,0),o.arc(0,0,16,-Math.PI/2-.5,-Math.PI/2+.5),o.closePath(),o.fill(),o.restore(),o.fillStyle="#ffd696",o.beginPath(),o.arc(a,c,3.4,0,Math.PI*2),o.fill()}}};var bn=new URLSearchParams(location.search),pf=document.getElementById("hud"),cs=document.getElementById("c"),un=new uc({canvas:cs,antialias:!0,powerPreference:"high-performance"});un.outputColorSpace=De;un.toneMapping=Or;un.toneMappingExposure=1;un.shadowMap.enabled=!bn.has("noshadow");un.shadowMap.type=_a;var wn=new dr;wn.fog=new ur(13222834,.0021);var je=new sn(58,1,.3,1400),rs=new L(-.52,.8,-.3).normalize();wn.add(new ft(new fe(900,40,24),new ln({side:Ke,depthWrite:!1,fog:!1,uniforms:{top:{value:new Vt(Ye.skyTop)},mid:{value:new Vt(Ye.skyMid)},haze:{value:new Vt(Ye.skyHaze)},cloud:{value:new Vt(Ye.cloud)},sun:{value:rs.clone()}},vertexShader:`varying vec3 vW;
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
      }`})));var $e=new Ur(16773334,2.6);$e.castShadow=!0;$e.shadow.mapSize.set(2048,2048);$e.shadow.camera.left=-95;$e.shadow.camera.right=95;$e.shadow.camera.top=95;$e.shadow.camera.bottom=-95;$e.shadow.camera.near=1;$e.shadow.camera.far=460;$e.shadow.bias=-5e-4;$e.shadow.normalBias=.05;wn.add($e,$e.target);wn.add(new Lr(10930402,9733487,1.35));var Qe=new ge;wn.add(Qe);var $s=12,wc=new Map;function sy(i){for(let t of i.buildings){let e=1e9,n=-1e9,s=1e9,r=-1e9;for(let[o,a]of t.p)e=Math.min(e,o),n=Math.max(n,o),s=Math.min(s,a),r=Math.max(r,a);for(let o=Math.floor(e/$s);o<=Math.floor(n/$s);o++)for(let a=Math.floor(s/$s);a<=Math.floor(r/$s);a++){let c=o+","+a;wc.has(c)||wc.set(c,[]),wc.get(c).push(t.p)}}}function ry(i,t,e){let n=!1;for(let s=0,r=i.length-1;s<i.length;r=s++){let o=i[s][0],a=i[s][1],c=i[r][0],l=i[r][1];a>e!=l>e&&t<(c-o)*(e-a)/(l-a)+o&&(n=!n)}return n}function En(i,t){let e=wc.get(Math.floor(i/$s)+","+Math.floor(t/$s));if(!e)return!1;for(let n of e)if(ry(n,i,t))return!0;return!1}function oy(i,t){if(!t)return 0;let e=t.p,n=t.w/2,s=new to,r=[],o=[],a=[],c=[],l=[],h=[],d=0;for(let M=0;M<e.length-1;M++){let[E,_]=e[M],[A,S]=e[M+1],w=A-E,x=S-_,b=Math.hypot(w,x);if(b<.5)continue;let R=w/b,I=x/b,P=-I,U=R,O=Math.atan2(R,I);for(let D=0;D<b;D+=1,d++){let k=E+R*D,F=_+I*D;for(let H of[-1,1]){let Y=k+P*(n+.4)*H,J=F+U*(n+.4)*H;if(d%13===(H>0?0:6))for(let $ of[3.2,2.2,4.4]){let st=k+P*(n+$)*H,rt=F+U*(n+$)*H;if(!En(st,rt)){s.add(st,rt,it(.85,1.15));break}}d%34===0&&(o.push([Y,4.5,J,0]),a.push([Y-P*1.1*H,8.9,J-U*1.1*H,O,H]),c.push([Y-P*2.3*H,8.75,J-U*2.3*H,O])),d%2===0&&r.push([Y,.15,J,O])}if(d%190===0&&d>40){h.push(d);for(let H=-3;H<=3;H++)l.push([k+P*H*1.3,.035,F+U*H*1.3,O])}}}let u=new ee,f=new Se,g=new Te,y=new L,p=new L(1,1,1),m=(M,E,_,A)=>{if(!_.length)return;let S=new Oe(M,E,_.length);_.forEach((w,x)=>{A(w),u.compose(y,f,p),S.setMatrixAt(x,u)}),S.castShadow=!1,S.receiveShadow=!0,Qe.add(S)};return m(new ht(.42,.3,2),Pt.kerb,r,M=>{y.set(M[0],M[1],M[2]),g.set(0,M[3],0),f.setFromEuler(g)}),m(new qt(.11,.16,9,8),Pt.metal,o,M=>{y.set(M[0],M[1],M[2]),f.identity()}),m(new qt(.07,.07,2.4,6),Pt.metal,a,M=>{y.set(M[0],M[1],M[2]),g.set(0,M[3],Math.PI/2-.2*M[4]),f.setFromEuler(g)}),m(new ht(1,.2,.44),Pt.trim,c,M=>{y.set(M[0],M[1],M[2]),g.set(0,M[3],0),f.setFromEuler(g)}),m(new Ee(.62,t.w),Pt.white,l,M=>{y.set(M[0],M[1],M[2]),g.set(-Math.PI/2,M[3]+Math.PI/2,0,"YXZ"),f.setFromEuler(g)}),window.__crossings=h,s.build(Qe)}var ro=qd(),Sh=Yd();ro.group.add(Sh);var Ac=new ge;Ac.add(ro.group);wn.add(Ac);var Lt=xc(0,0,0),mf=!1,oo={},Vn=null,We=null,so=null,Un=null,Nn="ride",yi=new vc;for(let i of["touchstart","touchend","pointerdown","mousedown","keydown","click"])addEventListener(i,()=>{yi.start(),yi.poke()},{passive:!0});var os=0,ao=.16,jt=Qd(),as=tf();as.group.visible=!1;wn.add(as.group);var _i=0;fetch("./data/orchard.json").then(i=>i.json()).then(i=>{sy(i);let t=bn.has("nobuild")?{count:0,tall:0}:Wd(Qe,i),e=Xd(Qe,i),n=i.axis||e,s=new ft(new Ee(2600,2600),new Rt({color:10130308,roughness:.95}));s.rotation.x=-Math.PI/2,s.position.y=-.05,s.receiveShadow=!0,Qe.add(s);let r=bn.has("nofoliage")?0:oy(i,n);!bn.has("nopeople")&&n&&(Vn=new Sc(n,En,260),Vn.build(Qe),window.__crossings&&Vn.setCrossings(window.__crossings)),!bn.has("notraffic")&&n&&(We=new bc(n,18,3),We.build(Qe,We.path.nearestS(Lt.x,Lt.z)));let o=!bn.has("nofurniture")&&n?af(Qe,n,En):{};Un=new yc(o.signals||[]);let a=!bn.has("nosigns")&&n?lf(Qe,n,i,En):{},c=!bn.has("nomarks")&&n?ef(Qe,n):0,l=!bn.has("noside")&&n?nf(Qe,i,n,En,to):{},h=!bn.has("nosg")&&n?of(Qe,n,i,En):{};n&&(so=new Ec(i,n)),window.__axis=n,window.__roadList=i.roads.filter(u=>u.k!=="footway"&&u.k!=="pedestrian");let d=Vn?Vn.people.length:0;if(n){let u=0,f=1/0;for(let A=0;A<n.p.length-1;A++){let S=n.p[A][0]*n.p[A][0]+n.p[A][1]*n.p[A][1];S<f&&(f=S,u=A)}let g=n.p[u],y=n.p[Math.min(u+1,n.p.length-1)],p=y[0]-g[0],m=y[1]-g[1],M=Math.hypot(p,m)||1,E=-m/M,_=p/M;Lt=xc(g[0]+E*-3.4,g[1]+_*-3.4,Math.atan2(p,m))}ay(),oo={marks:c,...l,...h,merged:t.mergedMeshes,shophouses:t.shophouses,junctions:(o.signals||[]).length,buildings:t.count,bespoke:t.bespoke,towers:t.tall,roads:i.roads.length,people:d,trees:r,...o,...a},mf=!0,window.__ready=!0,window.__stats=oo}).catch(i=>{window.__bootError=i&&i.stack||String(i),pf.textContent="boot failed: "+i.message,console.error("BOOT",i)});gh&&Zd(cs);$d(cs);{let i=document.getElementById("soundbtn");if(i){let t=e=>{e.preventDefault(),e.stopPropagation(),yi.start(),yi.setMuted(!yi.muted),i.textContent=yi.muted?"Sound off":"Sound on"};i.addEventListener("click",t),i.addEventListener("touchstart",t,{passive:!1})}}{let i=document.getElementById("modebtn");if(i){let t=e=>{e.preventDefault(),e.stopPropagation(),Eh()};i.addEventListener("click",t),i.addEventListener("touchstart",t,{passive:!1})}}function ay(){let i=new Vs(256,{generateMipmaps:!0,minFilter:ti}),t=new Fs(1,900,i);t.position.set(0,34,0),wn.add(t),t.update(un,wn),wn.remove(t);let e=0;wn.traverse(n=>{let s=n.material;if(s)for(let r of Array.isArray(s)?s:[s])r.isMeshStandardMaterial&&(r.roughness>.45||(r.envMap=i.texture,r.envMapIntensity=r.roughness<.25?.95:.5,r.needsUpdate=!0,e++))}),window.__envMats=e}var gf=bn.get("cam")||"ride",oi=new Fi(-260,260,260,-260,1,2e3);oi.up.set(0,0,-1);oi.position.set(0,900,0);oi.lookAt(0,0,0);function Eh(){if(Nn==="ride"){let i=Math.cos(Lt.heading),t=-Math.sin(Lt.heading),e=Lt.x+i*1.2,n=Lt.z+t*1.2;En(e,n)&&(e=Lt.x-i*1.2,n=Lt.z-t*1.2),jt.x=e,jt.z=n,jt.heading=Lt.heading,jt.speed=0,Lt.speed=0,Lt.reversing=!1,os=Lt.heading,ao=.16,as.group.visible=!0,Sh.visible=!1,Nn="walk"}else{if(Math.hypot(jt.x-Lt.x,jt.z-Lt.z)>6)return;as.group.visible=!1,Sh.visible=!0,Rc=!1,Nn="ride"}cy()}var hf=document.getElementById("stick"),uf=document.getElementById("knob"),df=document.getElementById("lookhint");function cy(){hf&&hf.classList.toggle("on",Nn==="walk"),df&&df.classList.toggle("on",Nn==="walk");let i=document.getElementById("help");if(!i)return;i.innerHTML=Nn==="ride"?'<b>hold left side</b> throttle<br><b>hold lower left</b> brake<br><b>hold brake stopped</b> reverse<br><b>drag right side</b> steer<br><span style="opacity:.65">keys: A/D \xB7 W \xB7 S \xB7 E to get off</span>':'<b>drag left side</b> walk<br><b>drag right side</b> look around<br><span style="opacity:.65">keys: WASD \xB7 shift to run \xB7 E to ride</span>';let t=document.getElementById("modebtn");t&&(t.textContent=Nn==="ride"?"Get off":"Ride")}function ly(i){let s=Math.sin(os),r=Math.cos(os),o=-r,a=s,c=Math.sin(ao),l=Math.cos(ao);je.position.set(jt.x-s*2.15*l+o*.66,1.78+2.15*c*.75,jt.z-r*2.15*l+a*.66);let h=12;je.lookAt(jt.x+s*h*l+o*.66,1.78-c*h,jt.z+r*h*l+a*.66),je.fov=65,je.updateProjectionMatrix()}var yh=new L,vh=new L,Rc=!1,ki=(bn.get("spec")||"").split(",").map(Number),hy=ki.length===6&&ki.every(i=>Number.isFinite(i));function uy(i){if(hy){je.position.set(ki[0],ki[1],ki[2]),je.lookAt(ki[3],ki[4],ki[5]),je.fov=46,je.updateProjectionMatrix();return}let t=new L(Math.sin(Lt.heading),0,Math.cos(Lt.heading)),e=new L(Lt.x,0,Lt.z).addScaledVector(t,-5.8).add(new L(0,3.05,0)),n=new L(Lt.x,1.35,Lt.z).addScaledVector(t,7.5);Rc||(yh.copy(e),vh.copy(n),Rc=!0),yh.lerp(e,Math.min(1,i*4.2)),vh.lerp(n,Math.min(1,i*6)),je.position.copy(yh),je.lookAt(vh),je.fov=58+Lt.speed/an.vMax*12,je.updateProjectionMatrix()}var dy=parseFloat(bn.get("dpr")||"0");function xf(){let i=cs.clientWidth,t=cs.clientHeight;un.setPixelRatio(dy||Math.min(devicePixelRatio||1,2)),un.setSize(i,t,!1),je.aspect=i/t,je.updateProjectionMatrix();let e=i/t,n=440;oi.left=-n*e,oi.right=n*e,oi.top=n,oi.bottom=-n,oi.updateProjectionMatrix()}addEventListener("resize",xf);xf();var bh=performance.now(),Cc=0,Ic=bh,Mh=0;function Tc(i){let t=Math.min(.05,(i-bh)/1e3);if(bh=i,document.hidden){requestAnimationFrame(Tc);return}if(mf){let e=Jd(Nn);if(Ie.toggleMode&&(Ie.toggleMode=!1,Eh()),window.__force&&(e.throttle=window.__force.throttle??e.throttle,e.brake=window.__force.brake??e.brake,e.steer=window.__force.steer??e.steer),Nn==="walk"){os-=e.lookDX*.0045,ao=Math.max(-.35,Math.min(.95,ao+e.lookDY*.0035));let r=Math.sin(os),o=Math.cos(os),a=-e.moveY*r-e.moveX*o,c=-e.moveY*o+e.moveX*r,l=jt.x,h=jt.z;jd(jt,t,a,c,e.run),We&&We.hits(jt.x,jt.z,.32)&&(jt.x=l,jt.z=h,jt.speed=0),En(jt.x,jt.z)&&(En(jt.x,h)?En(l,jt.z)?(jt.x=l,jt.z=h):jt.x=l:jt.z=h),uf&&(uf.style.transform=`translate(${Ie.stickDX.toFixed(1)}px, ${Ie.stickDY.toFixed(1)}px)`),as.group.position.set(jt.x,0,jt.z),as.group.rotation.y=jt.heading,as.pose(jt.phase,jt.speed),$e.position.set(jt.x+rs.x*150,rs.y*150,jt.z+rs.z*150),$e.target.position.set(jt.x,0,jt.z),$e.target.updateMatrixWorld(),_i+=t,Un&&Un.update(_i),We&&We.update(_i,t,Un),Vn&&Vn.update(_i,t,jt.x,jt.z,Un),so&&so.update(jt,t),yi.update(0,"walk",jt.speed,jt.phase,We?We.nearest(jt.x,jt.z):999),ly(t),un.render(wn,je),Cc++,i-Ic>1e3&&ff(i),requestAnimationFrame(Tc);return}let n=Lt.x,s=Lt.z;if(fh(Lt,t,e.throttle,e.brake,e.steer),We&&We.hits(Lt.x,Lt.z,.55)&&(Lt.x=n,Lt.z=s,Lt.speed*=-.12,Math.abs(Lt.speed)<.4&&(Lt.speed=0)),En(Lt.x,Lt.z)){let r={x:Lt.x,z:s},o={x:n,z:Lt.z};En(r.x,r.z)?En(o.x,o.z)?(Lt.x=n,Lt.z=s,Lt.speed*=.2):(Lt.x=n,Lt.speed*=.86):(Lt.z=s,Lt.speed*=.86)}Ac.position.set(Lt.x,0,Lt.z),Ac.rotation.y=Lt.heading,ro.group.rotation.z=Lt.lean,ro.wheels[0].rotation.x=-Lt.wheel,ro.wheels[1].rotation.x=-Lt.wheel,$e.position.set(Lt.x+rs.x*150,rs.y*150,Lt.z+rs.z*150),$e.target.position.set(Lt.x,0,Lt.z),$e.target.updateMatrixWorld(),_i+=t,Un&&Un.update(_i),We&&We.update(_i,t,Un),Vn&&Vn.update(_i,t,Lt.x,Lt.z,Un),so&&so.update(Lt,t),yi.update(Lt.speed,"ride",0,0,We?We.nearest(Lt.x,Lt.z):999),uy(t)}un.render(wn,gf==="top"?oi:je),Cc++,i-Ic>1e3&&ff(i),requestAnimationFrame(Tc)}function ff(i){{Mh=Math.round(Cc*1e3/(i-Ic)),Cc=0,Ic=i;let t=un.getPixelRatio(),e=Math.round(cs.clientWidth*t)+"x"+Math.round(cs.clientHeight*t);pf.textContent=`${Mh} fps \xB7 ${e} @dpr${t} \xB7 ${un.info.render.triangles/1e3|0}k tris \xB7 ${un.info.render.calls} draws \xB7 `+(Nn==="walk"?"on foot":`${Math.abs(Lt.speed*3.6)|0} km/h${Lt.reversing?" R":""}`)+(oo.buildings?` \xB7 ${oo.buildings} buildings`:""),window.__probe={fps:Mh,tris:un.info.render.triangles,calls:un.info.render.calls,px:e,dpr:t,kmh:+(Lt.speed*3.6).toFixed(1),mode:Nn,...oo}}}requestAnimationFrame(Tc);window.__drive=(i,t,e)=>{window.__force={throttle:i,steer:t,brake:0},setTimeout(()=>{window.__force=null},e*1e3)};window.__inp=()=>({TOUCH:gh,steer:Ie.steer,throttle:Ie.throttle,brake:Ie.brake,touches:Kd(),fired:window.__touchFired||0});window.__snd=yi;window.__auditRoads=(i=4)=>{let t=new Nr,e=new L(0,1,0),n=new L,s={tested:0,obstruct:[],overhang:[]},r=window.__roadList||[];for(let a of r){let c=a.p,l=a.w/2;for(let h=0;h<c.length-1;h++){let[d,u]=c[h],[f,g]=c[h+1],y=f-d,p=g-u,m=Math.hypot(y,p);if(m<1)continue;let M=y/m,E=p/m,_=-E,A=M;for(let S=0;S<m;S+=i){let w=d+M*S,x=u+E*S;for(let b=-l+1.4;b<=l-1.4;b+=2.8){if(/orchard road/i.test(a.n||"")&&Math.abs(b)<2)continue;s.tested++;let I=w+_*b,P=x+A*b;n.set(I,.4,P),t.set(n,e),t.near=0,t.far=1.6;let U=t.intersectObjects(Qe.children,!0),O=We?We.nearest(I,P):999;U.length&&O>4.5&&s.obstruct.push({road:a.n||a.k,x:+I.toFixed(1),z:+P.toFixed(1),off:+b.toFixed(1),h:+(.4+U[0].distance).toFixed(2)}),n.set(I,2.6,P),t.set(n,e),t.far=2,U=t.intersectObjects(Qe.children,!0),U.length&&O>4.5&&s.overhang.push({road:a.n||a.k,x:+I.toFixed(1),z:+P.toFixed(1),off:+b.toFixed(1),h:+(2.6+U[0].distance).toFixed(2)})}}}}let o=a=>{let c={};for(let l of a)c[l.road]=(c[l.road]||0)+1;return Object.entries(c).sort((l,h)=>h[1]-l[1]).slice(0,12)};return{tested:s.tested,obstruct:s.obstruct.length,obstructPct:+(100*s.obstruct.length/s.tested).toFixed(2),overhang:s.overhang.length,overhangPct:+(100*s.overhang.length/s.tested).toFixed(2),worstObstruct:o(s.obstruct),worstOverhang:o(s.overhang),sampleObstruct:s.obstruct.slice(0,12),sampleOverhang:s.overhang.slice(0,8)}};window.__crossers=()=>Vn?Vn.people.filter(i=>i.crossing).length:0;window.__sig=()=>Un?Un.list.map(i=>Un.stateAt(i,_i)):[];window.__traffic=()=>We?We.items.map(i=>+i.speed.toFixed(2)):[];window.__camYaw=()=>os;window.__mode=()=>Nn;window.__toggle=()=>Eh();window.__walker=()=>({x:+jt.x.toFixed(1),z:+jt.z.toFixed(1),sp:+jt.speed.toFixed(2)});window.__state=()=>({x:+Lt.x.toFixed(1),z:+Lt.z.toFixed(1),kmh:+(Lt.speed*3.6).toFixed(1)});window.__dbg=()=>{let i=new Rn().setFromObject(Qe),t=gf==="top"?oi:je;return{worldBox:{min:[i.min.x|0,i.min.y|0,i.min.z|0],max:[i.max.x|0,i.max.y|0,i.max.z|0]},children:Qe.children.length,camType:t.type,camPos:[t.position.x|0,t.position.y|0,t.position.z|0],camDir:(()=>{let e=new L;return t.getWorldDirection(e),[+e.x.toFixed(2),+e.y.toFixed(2),+e.z.toFixed(2)]})(),ortho:t.isOrthographicCamera?[t.left|0,t.right|0,t.top|0,t.bottom|0,t.near,t.far]:null}};window.__setState=(i,t,e)=>{Lt.x=i,Lt.z=t,Lt.heading=e,Rc=!1};
/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
