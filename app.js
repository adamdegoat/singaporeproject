var su=0,yc=1,ru=2;var Ur=1,xo=2,Fs=3,fi=0,Je=1,Ce=2,Qn=0,Ki=1,vc=2,Mc=3,Nr=4,au=5;var Ii=100,ou=101,lu=102,cu=103,hu=104,uu=200,du=201,fu=202,pu=203,La=204,Da=205,mu=206,gu=207,xu=208,_u=209,yu=210,vu=211,Mu=212,Su=213,bu=214,Ua=0,Na=1,Fa=2,Qi=3,Ba=4,Oa=5,za=6,Ha=7,_o=0,Eu=1,wu=2,zn=0,Sc=1,bc=2,Ec=3,Fr=4,wc=5,Tc=6,Ac=7;var Rc=300,Bi=301,ts=302,yo=303,vo=304,Br=306,ws=1e3,Zn=1001,Ga=1002,Xe=1003,Tu=1004;var Or=1005;var $e=1006,Mo=1007;var jn=1008;var pn=1009,Cc=1010,Ic=1011,Bs=1012,So=1013,Hn=1014,Cn=1015,ti=1016,bo=1017,Eo=1018,Os=1020,Pc=35902,Lc=35899,Dc=1021,Uc=1022,In=1023,$n=1026,Oi=1027,wo=1028,To=1029,zi=1030,Ao=1031;var Ro=1033,zr=33776,Hr=33777,Gr=33778,kr=33779,Co=35840,Io=35841,Po=35842,Lo=35843,Do=36196,Uo=37492,No=37496,Fo=37488,Bo=37489,Vr=37490,Oo=37491,zo=37808,Ho=37809,Go=37810,ko=37811,Vo=37812,Wo=37813,Xo=37814,qo=37815,Yo=37816,Zo=37817,$o=37818,Jo=37819,Ko=37820,Qo=37821,jo=36492,tl=36494,el=36495,nl=36283,il=36284,Wr=36285,sl=36286;var rr=2300,ka=2301,Pa=2302,rc=2303,ac=2400,oc=2401,lc=2402;var Au=3200;var Xr=0,Ru=1,xi="",De="srgb",ar="srgb-linear",or="linear",de="srgb";var Zi=7680;var cc=519,Cu=512,Iu=513,Pu=514,rl=515,Lu=516,Du=517,al=518,Uu=519,hc=35044;var Nc="300 es",On=2e3,Ts=2001;function _f(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function yf(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function lr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Nu(){let i=lr("canvas");return i.style.display="block",i}var Ih={},As=null;function Fc(...i){let t="THREE."+i.shift();As?As("log",t,...i):console.log(t,...i)}function Fu(i){let t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Zt(...i){i=Fu(i);let t="THREE."+i.shift();if(As)As("warn",t,...i);else{let e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function Jt(...i){i=Fu(i);let t="THREE."+i.shift();if(As)As("error",t,...i);else{let e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function Ji(...i){let t=i.join(" ");t in Ih||(Ih[t]=!0,Zt(...i))}function Bu(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var Ou={[Ua]:Na,[Fa]:za,[Ba]:Ha,[Qi]:Oa,[Na]:Ua,[za]:Fa,[Ha]:Ba,[Oa]:Qi},Jn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}},tn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Ll=Math.PI/180,Va=180/Math.PI;function zs(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(tn[i&255]+tn[i>>8&255]+tn[i>>16&255]+tn[i>>24&255]+"-"+tn[t&255]+tn[t>>8&255]+"-"+tn[t>>16&15|64]+tn[t>>24&255]+"-"+tn[e&63|128]+tn[e>>8&255]+"-"+tn[e>>16&255]+tn[e>>24&255]+tn[n&255]+tn[n>>8&255]+tn[n>>16&255]+tn[n>>24&255]).toLowerCase()}function ce(i,t,e){return Math.max(t,Math.min(e,i))}function vf(i,t){return(i%t+t)%t}function Dl(i,t,e){return(1-e)*i+e*t}function $s(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function dn(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var pt=class i{static{i.prototype.isVector2=!0}constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=ce(this.x,t.x,e.x),this.y=ce(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=ce(this.x,t,e),this.y=ce(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ce(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(ce(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Se=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],d=n[s+3],u=r[a+0],f=r[a+1],m=r[a+2],v=r[a+3];if(d!==v||l!==u||c!==f||h!==m){let p=l*u+c*f+h*m+d*v;p<0&&(u=-u,f=-f,m=-m,v=-v,p=-p);let g=1-o;if(p<.9995){let M=Math.acos(p),E=Math.sin(M);g=Math.sin(g*M)/E,o=Math.sin(o*M)/E,l=l*g+u*o,c=c*g+f*o,h=h*g+m*o,d=d*g+v*o}else{l=l*g+u*o,c=c*g+f*o,h=h*g+m*o,d=d*g+v*o;let M=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=M,c*=M,h*=M,d*=M}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=d}static multiplyQuaternionsFlat(t,e,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],d=r[a],u=r[a+1],f=r[a+2],m=r[a+3];return t[e]=o*m+h*d+l*f-c*u,t[e+1]=l*m+h*u+c*d-o*f,t[e+2]=c*m+h*f+o*u-l*d,t[e+3]=h*m-o*d-l*u-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),d=o(r/2),u=l(n/2),f=l(s/2),m=l(r/2);switch(a){case"XYZ":this._x=u*h*d+c*f*m,this._y=c*f*d-u*h*m,this._z=c*h*m+u*f*d,this._w=c*h*d-u*f*m;break;case"YXZ":this._x=u*h*d+c*f*m,this._y=c*f*d-u*h*m,this._z=c*h*m-u*f*d,this._w=c*h*d+u*f*m;break;case"ZXY":this._x=u*h*d-c*f*m,this._y=c*f*d+u*h*m,this._z=c*h*m+u*f*d,this._w=c*h*d-u*f*m;break;case"ZYX":this._x=u*h*d-c*f*m,this._y=c*f*d+u*h*m,this._z=c*h*m-u*f*d,this._w=c*h*d+u*f*m;break;case"YZX":this._x=u*h*d+c*f*m,this._y=c*f*d+u*h*m,this._z=c*h*m-u*f*d,this._w=c*h*d-u*f*m;break;case"XZY":this._x=u*h*d-c*f*m,this._y=c*f*d-u*h*m,this._z=c*h*m+u*f*d,this._w=c*h*d+u*f*m;break;default:Zt("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],d=e[10],u=n+o+d;if(u>0){let f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(a-s)*f}else if(n>o&&n>d){let f=2*Math.sqrt(1+n-o-d);this._w=(h-l)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+c)/f}else if(o>d){let f=2*Math.sqrt(1+o-n-d);this._w=(r-c)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+d-n-o);this._w=(a-s)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(ce(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=this.dot(t);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-e;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},L=class i{static{i.prototype.isVector3=!0}constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Ph.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Ph.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*n),h=2*(o*e-r*s),d=2*(r*n-a*e);return this.x=e+l*c+a*d-o*h,this.y=n+l*h+o*c-r*d,this.z=s+l*d+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=ce(this.x,t.x,e.x),this.y=ce(this.y,t.y,e.y),this.z=ce(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=ce(this.x,t,e),this.y=ce(this.y,t,e),this.z=ce(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ce(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Ul.copy(this).projectOnVector(t),this.sub(Ul)}reflect(t){return this.sub(Ul.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(ce(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ul=new L,Ph=new Se,Qt=class i{static{i.prototype.isMatrix3=!0}constructor(t,e,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c)}set(t,e,n,s,r,a,o,l,c){let h=this.elements;return h[0]=t,h[1]=s,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],d=n[7],u=n[2],f=n[5],m=n[8],v=s[0],p=s[3],g=s[6],M=s[1],E=s[4],_=s[7],A=s[2],S=s[5],w=s[8];return r[0]=a*v+o*M+l*A,r[3]=a*p+o*E+l*S,r[6]=a*g+o*_+l*w,r[1]=c*v+h*M+d*A,r[4]=c*p+h*E+d*S,r[7]=c*g+h*_+d*w,r[2]=u*v+f*M+m*A,r[5]=u*p+f*E+m*S,r[8]=u*g+f*_+m*w,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],d=h*a-o*c,u=o*l-h*r,f=c*r-a*l,m=e*d+n*u+s*f;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/m;return t[0]=d*v,t[1]=(s*c-h*n)*v,t[2]=(o*n-s*a)*v,t[3]=u*v,t[4]=(h*e-s*l)*v,t[5]=(s*r-o*e)*v,t[6]=f*v,t[7]=(n*l-c*e)*v,t[8]=(a*e-n*r)*v,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return Ji("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Nl.makeScale(t,e)),this}rotate(t){return Ji("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Nl.makeRotation(-t)),this}translate(t,e){return Ji("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Nl.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Nl=new Qt,Lh=new Qt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Dh=new Qt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Mf(){let i={enabled:!0,workingColorSpace:ar,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===de&&(s.r=di(s.r),s.g=di(s.g),s.b=di(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===de&&(s.r=Es(s.r),s.g=Es(s.g),s.b=Es(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===xi?or:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Ji("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Ji("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[ar]:{primaries:t,whitePoint:n,transfer:or,toXYZ:Lh,fromXYZ:Dh,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:De},outputColorSpaceConfig:{drawingBufferColorSpace:De}},[De]:{primaries:t,whitePoint:n,transfer:de,toXYZ:Lh,fromXYZ:Dh,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:De}}}),i}var he=Mf();function di(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Es(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var us,Wa=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{us===void 0&&(us=lr("canvas")),us.width=t.width,us.height=t.height;let s=us.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=us}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=lr("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=di(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(di(e[n]/255)*255):e[n]=di(e[n]);return{data:e,width:t.width,height:t.height}}else return Zt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Sf=0,Rs=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Sf++}),this.uuid=zs(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Fl(s[a].image)):r.push(Fl(s[a]))}else r=Fl(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function Fl(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Wa.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Zt("Texture: Unable to serialize Texture."),{})}var bf=0,Bl=new L,on=class i extends Jn{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=Zn,s=Zn,r=$e,a=jn,o=In,l=pn,c=i.DEFAULT_ANISOTROPY,h=xi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:bf++}),this.uuid=zs(),this.name="",this.source=new Rs(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new pt(0,0),this.repeat=new pt(1,1),this.center=new pt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Qt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Bl).x}get height(){return this.source.getSize(Bl).y}get depth(){return this.source.getSize(Bl).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){Zt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Zt(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Rc)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ws:t.x=t.x-Math.floor(t.x);break;case Zn:t.x=t.x<0?0:1;break;case Ga:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ws:t.y=t.y-Math.floor(t.y);break;case Zn:t.y=t.y<0?0:1;break;case Ga:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};on.DEFAULT_IMAGE=null;on.DEFAULT_MAPPING=Rc;on.DEFAULT_ANISOTROPY=1;var we=class i{static{i.prototype.isVector4=!0}constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,l=t.elements,c=l[0],h=l[4],d=l[8],u=l[1],f=l[5],m=l[9],v=l[2],p=l[6],g=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-v)<.01&&Math.abs(m-p)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+v)<.1&&Math.abs(m+p)<.1&&Math.abs(c+f+g-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let E=(c+1)/2,_=(f+1)/2,A=(g+1)/2,S=(h+u)/4,w=(d+v)/4,x=(m+p)/4;return E>_&&E>A?E<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(E),s=S/n,r=w/n):_>A?_<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(_),n=S/s,r=x/s):A<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(A),n=w/r,s=x/r),this.set(n,s,r,e),this}let M=Math.sqrt((p-m)*(p-m)+(d-v)*(d-v)+(u-h)*(u-h));return Math.abs(M)<.001&&(M=1),this.x=(p-m)/M,this.y=(d-v)/M,this.z=(u-h)/M,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=ce(this.x,t.x,e.x),this.y=ce(this.y,t.y,e.y),this.z=ce(this.z,t.z,e.z),this.w=ce(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=ce(this.x,t,e),this.y=ce(this.y,t,e),this.z=ce(this.z,t,e),this.w=ce(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ce(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Xa=class extends Jn{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:$e,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new we(0,0,t,e),this.scissorTest=!1,this.viewport=new we(0,0,t,e),this.textures=[];let s={width:t,height:e,depth:n.depth},r=new on(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:$e,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new Rs(s)}return this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},yn=class extends Xa{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},cr=class extends on{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Xe,this.minFilter=Xe,this.wrapR=Zn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var qa=class extends on{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Xe,this.minFilter=Xe,this.wrapR=Zn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ie=class i{static{i.prototype.isMatrix4=!0}constructor(t,e,n,s,r,a,o,l,c,h,d,u,f,m,v,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c,h,d,u,f,m,v,p)}set(t,e,n,s,r,a,o,l,c,h,d,u,f,m,v,p){let g=this.elements;return g[0]=t,g[4]=e,g[8]=n,g[12]=s,g[1]=r,g[5]=a,g[9]=o,g[13]=l,g[2]=c,g[6]=h,g[10]=d,g[14]=u,g[3]=f,g[7]=m,g[11]=v,g[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,s=1/ds.setFromMatrixColumn(t,0).length(),r=1/ds.setFromMatrixColumn(t,1).length(),a=1/ds.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),d=Math.sin(r);if(t.order==="XYZ"){let u=a*h,f=a*d,m=o*h,v=o*d;e[0]=l*h,e[4]=-l*d,e[8]=c,e[1]=f+m*c,e[5]=u-v*c,e[9]=-o*l,e[2]=v-u*c,e[6]=m+f*c,e[10]=a*l}else if(t.order==="YXZ"){let u=l*h,f=l*d,m=c*h,v=c*d;e[0]=u+v*o,e[4]=m*o-f,e[8]=a*c,e[1]=a*d,e[5]=a*h,e[9]=-o,e[2]=f*o-m,e[6]=v+u*o,e[10]=a*l}else if(t.order==="ZXY"){let u=l*h,f=l*d,m=c*h,v=c*d;e[0]=u-v*o,e[4]=-a*d,e[8]=m+f*o,e[1]=f+m*o,e[5]=a*h,e[9]=v-u*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){let u=a*h,f=a*d,m=o*h,v=o*d;e[0]=l*h,e[4]=m*c-f,e[8]=u*c+v,e[1]=l*d,e[5]=v*c+u,e[9]=f*c-m,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){let u=a*l,f=a*c,m=o*l,v=o*c;e[0]=l*h,e[4]=v-u*d,e[8]=m*d+f,e[1]=d,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=f*d+m,e[10]=u-v*d}else if(t.order==="XZY"){let u=a*l,f=a*c,m=o*l,v=o*c;e[0]=l*h,e[4]=-d,e[8]=c*h,e[1]=u*d+v,e[5]=a*h,e[9]=f*d-m,e[2]=m*d-f,e[6]=o*h,e[10]=v*d+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Ef,t,wf)}lookAt(t,e,n){let s=this.elements;return xn.subVectors(t,e),xn.lengthSq()===0&&(xn.z=1),xn.normalize(),bi.crossVectors(n,xn),bi.lengthSq()===0&&(Math.abs(n.z)===1?xn.x+=1e-4:xn.z+=1e-4,xn.normalize(),bi.crossVectors(n,xn)),bi.normalize(),la.crossVectors(xn,bi),s[0]=bi.x,s[4]=la.x,s[8]=xn.x,s[1]=bi.y,s[5]=la.y,s[9]=xn.y,s[2]=bi.z,s[6]=la.z,s[10]=xn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],d=n[5],u=n[9],f=n[13],m=n[2],v=n[6],p=n[10],g=n[14],M=n[3],E=n[7],_=n[11],A=n[15],S=s[0],w=s[4],x=s[8],b=s[12],R=s[1],I=s[5],P=s[9],N=s[13],O=s[2],D=s[6],k=s[10],F=s[14],H=s[3],Y=s[7],J=s[11],$=s[15];return r[0]=a*S+o*R+l*O+c*H,r[4]=a*w+o*I+l*D+c*Y,r[8]=a*x+o*P+l*k+c*J,r[12]=a*b+o*N+l*F+c*$,r[1]=h*S+d*R+u*O+f*H,r[5]=h*w+d*I+u*D+f*Y,r[9]=h*x+d*P+u*k+f*J,r[13]=h*b+d*N+u*F+f*$,r[2]=m*S+v*R+p*O+g*H,r[6]=m*w+v*I+p*D+g*Y,r[10]=m*x+v*P+p*k+g*J,r[14]=m*b+v*N+p*F+g*$,r[3]=M*S+E*R+_*O+A*H,r[7]=M*w+E*I+_*D+A*Y,r[11]=M*x+E*P+_*k+A*J,r[15]=M*b+E*N+_*F+A*$,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],d=t[6],u=t[10],f=t[14],m=t[3],v=t[7],p=t[11],g=t[15],M=l*f-c*u,E=o*f-c*d,_=o*u-l*d,A=a*f-c*h,S=a*u-l*h,w=a*d-o*h;return e*(v*M-p*E+g*_)-n*(m*M-p*A+g*S)+s*(m*E-v*A+g*w)-r*(m*_-v*S+p*w)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],a=t[5],o=t[9],l=t[2],c=t[6],h=t[10];return e*(a*h-o*c)-n*(r*h-o*l)+s*(r*c-a*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],d=t[9],u=t[10],f=t[11],m=t[12],v=t[13],p=t[14],g=t[15],M=e*o-n*a,E=e*l-s*a,_=e*c-r*a,A=n*l-s*o,S=n*c-r*o,w=s*c-r*l,x=h*v-d*m,b=h*p-u*m,R=h*g-f*m,I=d*p-u*v,P=d*g-f*v,N=u*g-f*p,O=M*N-E*P+_*I+A*R-S*b+w*x;if(O===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let D=1/O;return t[0]=(o*N-l*P+c*I)*D,t[1]=(s*P-n*N-r*I)*D,t[2]=(v*w-p*S+g*A)*D,t[3]=(u*S-d*w-f*A)*D,t[4]=(l*R-a*N-c*b)*D,t[5]=(e*N-s*R+r*b)*D,t[6]=(p*_-m*w-g*E)*D,t[7]=(h*w-u*_+f*E)*D,t[8]=(a*P-o*R+c*x)*D,t[9]=(n*R-e*P-r*x)*D,t[10]=(m*S-v*_+g*M)*D,t[11]=(d*_-h*S-f*M)*D,t[12]=(o*b-a*I-l*x)*D,t[13]=(e*I-n*b+s*x)*D,t[14]=(v*E-m*A-p*M)*D,t[15]=(h*A-d*E+u*M)*D,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,d=o+o,u=r*c,f=r*h,m=r*d,v=a*h,p=a*d,g=o*d,M=l*c,E=l*h,_=l*d,A=n.x,S=n.y,w=n.z;return s[0]=(1-(v+g))*A,s[1]=(f+_)*A,s[2]=(m-E)*A,s[3]=0,s[4]=(f-_)*S,s[5]=(1-(u+g))*S,s[6]=(p+M)*S,s[7]=0,s[8]=(m+E)*w,s[9]=(p-M)*w,s[10]=(1-(u+v))*w,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let a=ds.set(s[0],s[1],s[2]).length(),o=ds.set(s[4],s[5],s[6]).length(),l=ds.set(s[8],s[9],s[10]).length();r<0&&(a=-a),Nn.copy(this);let c=1/a,h=1/o,d=1/l;return Nn.elements[0]*=c,Nn.elements[1]*=c,Nn.elements[2]*=c,Nn.elements[4]*=h,Nn.elements[5]*=h,Nn.elements[6]*=h,Nn.elements[8]*=d,Nn.elements[9]*=d,Nn.elements[10]*=d,e.setFromRotationMatrix(Nn),n.x=a,n.y=o,n.z=l,this}makePerspective(t,e,n,s,r,a,o=On,l=!1){let c=this.elements,h=2*r/(e-t),d=2*r/(n-s),u=(e+t)/(e-t),f=(n+s)/(n-s),m,v;if(l)m=r/(a-r),v=a*r/(a-r);else if(o===On)m=-(a+r)/(a-r),v=-2*a*r/(a-r);else if(o===Ts)m=-a/(a-r),v=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=d,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=On,l=!1){let c=this.elements,h=2/(e-t),d=2/(n-s),u=-(e+t)/(e-t),f=-(n+s)/(n-s),m,v;if(l)m=1/(a-r),v=a/(a-r);else if(o===On)m=-2/(a-r),v=-(a+r)/(a-r);else if(o===Ts)m=-1/(a-r),v=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=d,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=m,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},ds=new L,Nn=new ie,Ef=new L(0,0,0),wf=new L(1,1,1),bi=new L,la=new L,xn=new L,Uh=new ie,Nh=new Se,Te=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],d=s[2],u=s[6],f=s[10];switch(e){case"XYZ":this._y=Math.asin(ce(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ce(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(ce(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-ce(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(ce(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-ce(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Zt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Uh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Uh,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Nh.setFromEuler(this),this.setFromQuaternion(Nh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Te.DEFAULT_ORDER="XYZ";var hr=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Tf=0,Fh=new L,fs=new Se,oi=new ie,ca=new L,Js=new L,Af=new L,Rf=new Se,Bh=new L(1,0,0),Oh=new L(0,1,0),zh=new L(0,0,1),Hh={type:"added"},Cf={type:"removed"},ps={type:"childadded",child:null},Ol={type:"childremoved",child:null},sn=class i extends Jn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Tf++}),this.uuid=zs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new L,e=new Te,n=new Se,s=new L(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ie},normalMatrix:{value:new Qt}}),this.matrix=new ie,this.matrixWorld=new ie,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new hr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return fs.setFromAxisAngle(t,e),this.quaternion.multiply(fs),this}rotateOnWorldAxis(t,e){return fs.setFromAxisAngle(t,e),this.quaternion.premultiply(fs),this}rotateX(t){return this.rotateOnAxis(Bh,t)}rotateY(t){return this.rotateOnAxis(Oh,t)}rotateZ(t){return this.rotateOnAxis(zh,t)}translateOnAxis(t,e){return Fh.copy(t).applyQuaternion(this.quaternion),this.position.add(Fh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Bh,t)}translateY(t){return this.translateOnAxis(Oh,t)}translateZ(t){return this.translateOnAxis(zh,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(oi.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?ca.copy(t):ca.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Js.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?oi.lookAt(Js,ca,this.up):oi.lookAt(ca,Js,this.up),this.quaternion.setFromRotationMatrix(oi),s&&(oi.extractRotation(s.matrixWorld),fs.setFromRotationMatrix(oi),this.quaternion.premultiply(fs.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Jt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Hh),ps.child=t,this.dispatchEvent(ps),ps.child=null):Jt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Cf),Ol.child=t,this.dispatchEvent(Ol),Ol.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),oi.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),oi.multiply(t.parent.matrixWorld)),t.applyMatrix4(oi),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Hh),ps.child=t,this.dispatchEvent(ps),ps.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Js,t,Af),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Js,Rf,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let d=l[c];r(t.shapes,d)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){let o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),d=a(t.shapes),u=a(t.skeletons),f=a(t.animations),m=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),u.length>0&&(n.skeletons=u),f.length>0&&(n.animations=f),m.length>0&&(n.nodes=m)}return n.object=s,n;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}};sn.DEFAULT_UP=new L(0,1,0);sn.DEFAULT_MATRIX_AUTO_UPDATE=!0;sn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var ge=class extends sn{constructor(){super(),this.isGroup=!0,this.type="Group"}},If={type:"move"},Cs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ge,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ge,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ge,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(let v of t.hand.values()){let p=e.getJointPose(v,n),g=this._getHandJoint(c,v);p!==null&&(g.matrix.fromArray(p.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=p.radius),g.visible=p!==null}let h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),f=.02,m=.005;c.inputState.pinching&&u>f+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=f-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(If)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new ge;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},zu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ei={h:0,s:0,l:0},ha={h:0,s:0,l:0};function zl(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var Vt=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=De){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,he.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=he.workingColorSpace){return this.r=t,this.g=e,this.b=n,he.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=he.workingColorSpace){if(t=vf(t,1),e=ce(e,0,1),n=ce(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=zl(a,r,t+1/3),this.g=zl(a,r,t),this.b=zl(a,r,t-1/3)}return he.colorSpaceToWorking(this,s),this}setStyle(t,e=De){function n(r){r!==void 0&&parseFloat(r)<1&&Zt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Zt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);Zt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=De){let n=zu[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Zt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=di(t.r),this.g=di(t.g),this.b=di(t.b),this}copyLinearToSRGB(t){return this.r=Es(t.r),this.g=Es(t.g),this.b=Es(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=De){return he.workingToColorSpace(en.copy(this),t),Math.round(ce(en.r*255,0,255))*65536+Math.round(ce(en.g*255,0,255))*256+Math.round(ce(en.b*255,0,255))}getHexString(t=De){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=he.workingColorSpace){he.workingToColorSpace(en.copy(this),e);let n=en.r,s=en.g,r=en.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let d=a-o;switch(c=h<=.5?d/(a+o):d/(2-a-o),a){case n:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-n)/d+2;break;case r:l=(n-s)/d+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=he.workingColorSpace){return he.workingToColorSpace(en.copy(this),e),t.r=en.r,t.g=en.g,t.b=en.b,t}getStyle(t=De){he.workingToColorSpace(en.copy(this),t);let e=en.r,n=en.g,s=en.b;return t!==De?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Ei),this.setHSL(Ei.h+t,Ei.s+e,Ei.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Ei),t.getHSL(ha);let n=Dl(Ei.h,ha.h,e),s=Dl(Ei.s,ha.s,e),r=Dl(Ei.l,ha.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},en=new Vt;Vt.NAMES=zu;var ur=class i{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new Vt(t),this.density=e}clone(){return new i(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var dr=class extends sn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Te,this.environmentIntensity=1,this.environmentRotation=new Te,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}},Fn=new L,li=new L,Hl=new L,ci=new L,ms=new L,gs=new L,Gh=new L,Gl=new L,kl=new L,Vl=new L,Wl=new we,Xl=new we,ql=new we,Ci=class i{constructor(t=new L,e=new L,n=new L){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),Fn.subVectors(t,e),s.cross(Fn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){Fn.subVectors(s,e),li.subVectors(n,e),Hl.subVectors(t,e);let a=Fn.dot(Fn),o=Fn.dot(li),l=Fn.dot(Hl),c=li.dot(li),h=li.dot(Hl),d=a*c-o*o;if(d===0)return r.set(0,0,0),null;let u=1/d,f=(c*l-o*h)*u,m=(a*h-o*l)*u;return r.set(1-f-m,m,f)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,ci)===null?!1:ci.x>=0&&ci.y>=0&&ci.x+ci.y<=1}static getInterpolation(t,e,n,s,r,a,o,l){return this.getBarycoord(t,e,n,s,ci)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,ci.x),l.addScaledVector(a,ci.y),l.addScaledVector(o,ci.z),l)}static getInterpolatedAttribute(t,e,n,s,r,a){return Wl.setScalar(0),Xl.setScalar(0),ql.setScalar(0),Wl.fromBufferAttribute(t,e),Xl.fromBufferAttribute(t,n),ql.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(Wl,r.x),a.addScaledVector(Xl,r.y),a.addScaledVector(ql,r.z),a}static isFrontFacing(t,e,n,s){return Fn.subVectors(n,e),li.subVectors(t,e),Fn.cross(li).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Fn.subVectors(this.c,this.b),li.subVectors(this.a,this.b),Fn.cross(li).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,a,o;ms.subVectors(s,n),gs.subVectors(r,n),Gl.subVectors(t,n);let l=ms.dot(Gl),c=gs.dot(Gl);if(l<=0&&c<=0)return e.copy(n);kl.subVectors(t,s);let h=ms.dot(kl),d=gs.dot(kl);if(h>=0&&d<=h)return e.copy(s);let u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(n).addScaledVector(ms,a);Vl.subVectors(t,r);let f=ms.dot(Vl),m=gs.dot(Vl);if(m>=0&&f<=m)return e.copy(r);let v=f*c-l*m;if(v<=0&&c>=0&&m<=0)return o=c/(c-m),e.copy(n).addScaledVector(gs,o);let p=h*m-f*d;if(p<=0&&d-h>=0&&f-m>=0)return Gh.subVectors(r,s),o=(d-h)/(d-h+(f-m)),e.copy(s).addScaledVector(Gh,o);let g=1/(p+v+u);return a=v*g,o=u*g,e.copy(n).addScaledVector(ms,a).addScaledVector(gs,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},An=class{constructor(t=new L(1/0,1/0,1/0),e=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Bn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Bn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=Bn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,Bn):Bn.fromBufferAttribute(r,a),Bn.applyMatrix4(t.matrixWorld),this.expandByPoint(Bn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),ua.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ua.copy(n.boundingBox)),ua.applyMatrix4(t.matrixWorld),this.union(ua)}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Bn),Bn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ks),da.subVectors(this.max,Ks),xs.subVectors(t.a,Ks),_s.subVectors(t.b,Ks),ys.subVectors(t.c,Ks),wi.subVectors(_s,xs),Ti.subVectors(ys,_s),Wi.subVectors(xs,ys);let e=[0,-wi.z,wi.y,0,-Ti.z,Ti.y,0,-Wi.z,Wi.y,wi.z,0,-wi.x,Ti.z,0,-Ti.x,Wi.z,0,-Wi.x,-wi.y,wi.x,0,-Ti.y,Ti.x,0,-Wi.y,Wi.x,0];return!Yl(e,xs,_s,ys,da)||(e=[1,0,0,0,1,0,0,0,1],!Yl(e,xs,_s,ys,da))?!1:(fa.crossVectors(wi,Ti),e=[fa.x,fa.y,fa.z],Yl(e,xs,_s,ys,da))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Bn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Bn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(hi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),hi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),hi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),hi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),hi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),hi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),hi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),hi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(hi),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},hi=[new L,new L,new L,new L,new L,new L,new L,new L],Bn=new L,ua=new An,xs=new L,_s=new L,ys=new L,wi=new L,Ti=new L,Wi=new L,Ks=new L,da=new L,fa=new L,Xi=new L;function Yl(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Xi.fromArray(i,r);let o=s.x*Math.abs(Xi.x)+s.y*Math.abs(Xi.y)+s.z*Math.abs(Xi.z),l=t.dot(Xi),c=e.dot(Xi),h=n.dot(Xi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var Ge=new L,pa=new pt,Pf=0,fn=class extends Jn{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Pf++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=hc,this.updateRanges=[],this.gpuType=Cn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)pa.fromBufferAttribute(this,e),pa.applyMatrix3(t),this.setXY(e,pa.x,pa.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Ge.fromBufferAttribute(this,e),Ge.applyMatrix3(t),this.setXYZ(e,Ge.x,Ge.y,Ge.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Ge.fromBufferAttribute(this,e),Ge.applyMatrix4(t),this.setXYZ(e,Ge.x,Ge.y,Ge.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ge.fromBufferAttribute(this,e),Ge.applyNormalMatrix(t),this.setXYZ(e,Ge.x,Ge.y,Ge.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ge.fromBufferAttribute(this,e),Ge.transformDirection(t),this.setXYZ(e,Ge.x,Ge.y,Ge.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=$s(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=dn(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=$s(e,this.array)),e}setX(t,e){return this.normalized&&(e=dn(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=$s(e,this.array)),e}setY(t,e){return this.normalized&&(e=dn(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=$s(e,this.array)),e}setZ(t,e){return this.normalized&&(e=dn(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=$s(e,this.array)),e}setW(t,e){return this.normalized&&(e=dn(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=dn(e,this.array),n=dn(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=dn(e,this.array),n=dn(n,this.array),s=dn(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=dn(e,this.array),n=dn(n,this.array),s=dn(s,this.array),r=dn(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==hc&&(t.usage=this.usage),t}dispose(){this.dispatchEvent({type:"dispose"})}};var fr=class extends fn{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var pr=class extends fn{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var se=class extends fn{constructor(t,e,n){super(new Float32Array(t),e,n)}},Lf=new An,Qs=new L,Zl=new L,Pi=class{constructor(t=new L,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):Lf.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Qs.subVectors(t,this.center);let e=Qs.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Qs,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Zl.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Qs.copy(t.center).add(Zl)),this.expandByPoint(Qs.copy(t.center).sub(Zl))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Df=0,Tn=new ie,$l=new sn,vs=new L,_n=new An,js=new An,We=new L,Be=class i extends Jn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Df++}),this.uuid=zs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(_f(t)?pr:fr)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Qt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return Tn.makeRotationFromQuaternion(t),this.applyMatrix4(Tn),this}rotateX(t){return Tn.makeRotationX(t),this.applyMatrix4(Tn),this}rotateY(t){return Tn.makeRotationY(t),this.applyMatrix4(Tn),this}rotateZ(t){return Tn.makeRotationZ(t),this.applyMatrix4(Tn),this}translate(t,e,n){return Tn.makeTranslation(t,e,n),this.applyMatrix4(Tn),this}scale(t,e,n){return Tn.makeScale(t,e,n),this.applyMatrix4(Tn),this}lookAt(t){return $l.lookAt(t),$l.updateMatrix(),this.applyMatrix4($l.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(vs).negate(),this.translate(vs.x,vs.y,vs.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new se(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&Zt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new An);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Jt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];_n.setFromBufferAttribute(r),this.morphTargetsRelative?(We.addVectors(this.boundingBox.min,_n.min),this.boundingBox.expandByPoint(We),We.addVectors(this.boundingBox.max,_n.max),this.boundingBox.expandByPoint(We)):(this.boundingBox.expandByPoint(_n.min),this.boundingBox.expandByPoint(_n.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Jt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Pi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Jt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(t){let n=this.boundingSphere.center;if(_n.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];js.setFromBufferAttribute(o),this.morphTargetsRelative?(We.addVectors(_n.min,js.min),_n.expandByPoint(We),We.addVectors(_n.max,js.max),_n.expandByPoint(We)):(_n.expandByPoint(js.min),_n.expandByPoint(js.max))}_n.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)We.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(We));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)We.fromBufferAttribute(o,c),l&&(vs.fromBufferAttribute(t,c),We.add(vs)),s=Math.max(s,n.distanceToSquared(We))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Jt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Jt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new fn(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let x=0;x<n.count;x++)o[x]=new L,l[x]=new L;let c=new L,h=new L,d=new L,u=new pt,f=new pt,m=new pt,v=new L,p=new L;function g(x,b,R){c.fromBufferAttribute(n,x),h.fromBufferAttribute(n,b),d.fromBufferAttribute(n,R),u.fromBufferAttribute(r,x),f.fromBufferAttribute(r,b),m.fromBufferAttribute(r,R),h.sub(c),d.sub(c),f.sub(u),m.sub(u);let I=1/(f.x*m.y-m.x*f.y);isFinite(I)&&(v.copy(h).multiplyScalar(m.y).addScaledVector(d,-f.y).multiplyScalar(I),p.copy(d).multiplyScalar(f.x).addScaledVector(h,-m.x).multiplyScalar(I),o[x].add(v),o[b].add(v),o[R].add(v),l[x].add(p),l[b].add(p),l[R].add(p))}let M=this.groups;M.length===0&&(M=[{start:0,count:t.count}]);for(let x=0,b=M.length;x<b;++x){let R=M[x],I=R.start,P=R.count;for(let N=I,O=I+P;N<O;N+=3)g(t.getX(N+0),t.getX(N+1),t.getX(N+2))}let E=new L,_=new L,A=new L,S=new L;function w(x){A.fromBufferAttribute(s,x),S.copy(A);let b=o[x];E.copy(b),E.sub(A.multiplyScalar(A.dot(b))).normalize(),_.crossVectors(S,b);let I=_.dot(l[x])<0?-1:1;a.setXYZW(x,E.x,E.y,E.z,I)}for(let x=0,b=M.length;x<b;++x){let R=M[x],I=R.start,P=R.count;for(let N=I,O=I+P;N<O;N+=3)w(t.getX(N+0)),w(t.getX(N+1)),w(t.getX(N+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new fn(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let u=0,f=n.count;u<f;u++)n.setXYZ(u,0,0,0);let s=new L,r=new L,a=new L,o=new L,l=new L,c=new L,h=new L,d=new L;if(t)for(let u=0,f=t.count;u<f;u+=3){let m=t.getX(u+0),v=t.getX(u+1),p=t.getX(u+2);s.fromBufferAttribute(e,m),r.fromBufferAttribute(e,v),a.fromBufferAttribute(e,p),h.subVectors(a,r),d.subVectors(s,r),h.cross(d),o.fromBufferAttribute(n,m),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,p),o.add(h),l.add(h),c.add(h),n.setXYZ(m,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let u=0,f=e.count;u<f;u+=3)s.fromBufferAttribute(e,u+0),r.fromBufferAttribute(e,u+1),a.fromBufferAttribute(e,u+2),h.subVectors(a,r),d.subVectors(s,r),h.cross(d),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)We.fromBufferAttribute(t,e),We.normalize(),t.setXYZ(e,We.x,We.y,We.z)}toNonIndexed(){function t(o,l){let c=o.array,h=o.itemSize,d=o.normalized,u=new c.constructor(l.length*h),f=0,m=0;for(let v=0,p=l.length;v<p;v++){o.isInterleavedBufferAttribute?f=l[v]*o.data.stride+o.offset:f=l[v]*h;for(let g=0;g<h;g++)u[m++]=c[f++]}return new fn(u,h,d)}if(this.index===null)return Zt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=t(l,n);e.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,d=c.length;h<d;h++){let u=c[h],f=t(u,n);l.push(f)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){let f=c[d];h.push(f.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],d=r[c];for(let u=0,f=d.length;u<f;u++)h.push(d[u].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let c=0,h=a.length;c<h;c++){let d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var Uf=0,pi=class extends Jn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Uf++}),this.uuid=zs(),this.name="",this.type="Material",this.blending=Ki,this.side=fi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=La,this.blendDst=Da,this.blendEquation=Ii,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Vt(0,0,0),this.blendAlpha=0,this.depthFunc=Qi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=cc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Zi,this.stencilZFail=Zi,this.stencilZPass=Zi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){Zt(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Zt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Ki&&(n.blending=this.blending),this.side!==fi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==La&&(n.blendSrc=this.blendSrc),this.blendDst!==Da&&(n.blendDst=this.blendDst),this.blendEquation!==Ii&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Qi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==cc&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Zi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Zi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Zi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(e){let r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Vt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new pt().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new pt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var ui=new L,Jl=new L,ma=new L,Ai=new L,Kl=new L,ga=new L,Ql=new L,Ya=class{constructor(t=new L,e=new L(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ui)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=ui.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(ui.copy(this.origin).addScaledVector(this.direction,e),ui.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Jl.copy(t).add(e).multiplyScalar(.5),ma.copy(e).sub(t).normalize(),Ai.copy(this.origin).sub(Jl);let r=t.distanceTo(e)*.5,a=-this.direction.dot(ma),o=Ai.dot(this.direction),l=-Ai.dot(ma),c=Ai.lengthSq(),h=Math.abs(1-a*a),d,u,f,m;if(h>0)if(d=a*l-o,u=a*o-l,m=r*h,d>=0)if(u>=-m)if(u<=m){let v=1/h;d*=v,u*=v,f=d*(d+a*u+2*o)+u*(a*d+u+2*l)+c}else u=r,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*l)+c;else u=-r,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*l)+c;else u<=-m?(d=Math.max(0,-(-a*r+o)),u=d>0?-r:Math.min(Math.max(-r,-l),r),f=-d*d+u*(u+2*l)+c):u<=m?(d=0,u=Math.min(Math.max(-r,-l),r),f=u*(u+2*l)+c):(d=Math.max(0,-(a*r+o)),u=d>0?r:Math.min(Math.max(-r,-l),r),f=-d*d+u*(u+2*l)+c);else u=a>0?-r:r,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(Jl).addScaledVector(ma,u),f}intersectSphere(t,e){ui.subVectors(t.center,this.origin);let n=ui.dot(this.direction),s=ui.dot(ui)-n*n,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(n=(t.min.x-u.x)*c,s=(t.max.x-u.x)*c):(n=(t.max.x-u.x)*c,s=(t.min.x-u.x)*c),h>=0?(r=(t.min.y-u.y)*h,a=(t.max.y-u.y)*h):(r=(t.max.y-u.y)*h,a=(t.min.y-u.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),d>=0?(o=(t.min.z-u.z)*d,l=(t.max.z-u.z)*d):(o=(t.max.z-u.z)*d,l=(t.min.z-u.z)*d),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,ui)!==null}intersectTriangle(t,e,n,s,r){Kl.subVectors(e,t),ga.subVectors(n,t),Ql.crossVectors(Kl,ga);let a=this.direction.dot(Ql),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Ai.subVectors(this.origin,t);let l=o*this.direction.dot(ga.crossVectors(Ai,ga));if(l<0)return null;let c=o*this.direction.dot(Kl.cross(Ai));if(c<0||l+c>a)return null;let h=-o*Ai.dot(Ql);return h<0?null:this.at(h/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Rn=class extends pi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Vt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Te,this.combine=_o,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},kh=new ie,qi=new Ya,xa=new Pi,Vh=new L,_a=new L,ya=new L,va=new L,jl=new L,Ma=new L,Wh=new L,Sa=new L,ft=class extends sn{constructor(t=new Be,e=new Rn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(r&&o){Ma.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],d=r[l];h!==0&&(jl.fromBufferAttribute(d,t),a?Ma.addScaledVector(jl,h):Ma.addScaledVector(jl.sub(e),h))}e.add(Ma)}return e}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),xa.copy(n.boundingSphere),xa.applyMatrix4(r),qi.copy(t.ray).recast(t.near),!(xa.containsPoint(qi.origin)===!1&&(qi.intersectSphere(xa,Vh)===null||qi.origin.distanceToSquared(Vh)>(t.far-t.near)**2))&&(kh.copy(r).invert(),qi.copy(t.ray).applyMatrix4(kh),!(n.boundingBox!==null&&qi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,qi)))}_computeIntersections(t,e,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,u=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let m=0,v=u.length;m<v;m++){let p=u[m],g=a[p.materialIndex],M=Math.max(p.start,f.start),E=Math.min(o.count,Math.min(p.start+p.count,f.start+f.count));for(let _=M,A=E;_<A;_+=3){let S=o.getX(_),w=o.getX(_+1),x=o.getX(_+2);s=ba(this,g,t,n,c,h,d,S,w,x),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{let m=Math.max(0,f.start),v=Math.min(o.count,f.start+f.count);for(let p=m,g=v;p<g;p+=3){let M=o.getX(p),E=o.getX(p+1),_=o.getX(p+2);s=ba(this,a,t,n,c,h,d,M,E,_),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let m=0,v=u.length;m<v;m++){let p=u[m],g=a[p.materialIndex],M=Math.max(p.start,f.start),E=Math.min(l.count,Math.min(p.start+p.count,f.start+f.count));for(let _=M,A=E;_<A;_+=3){let S=_,w=_+1,x=_+2;s=ba(this,g,t,n,c,h,d,S,w,x),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{let m=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let p=m,g=v;p<g;p+=3){let M=p,E=p+1,_=p+2;s=ba(this,a,t,n,c,h,d,M,E,_),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}}};function Nf(i,t,e,n,s,r,a,o){let l;if(t.side===Je?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,t.side===fi,o),l===null)return null;Sa.copy(o),Sa.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(Sa);return c<e.near||c>e.far?null:{distance:c,point:Sa.clone(),object:i}}function ba(i,t,e,n,s,r,a,o,l,c){i.getVertexPosition(o,_a),i.getVertexPosition(l,ya),i.getVertexPosition(c,va);let h=Nf(i,t,e,n,_a,ya,va,Wh);if(h){let d=new L;Ci.getBarycoord(Wh,_a,ya,va,d),s&&(h.uv=Ci.getInterpolatedAttribute(s,o,l,c,d,new pt)),r&&(h.uv1=Ci.getInterpolatedAttribute(r,o,l,c,d,new pt)),a&&(h.normal=Ci.getInterpolatedAttribute(a,o,l,c,d,new L),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new L,materialIndex:0};Ci.getNormal(_a,ya,va,u.normal),h.face=u,h.barycoord=d}return h}var mr=class extends on{constructor(t=null,e=1,n=1,s,r,a,o,l,c=Xe,h=Xe,d,u){super(null,a,o,l,c,h,s,r,d,u),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var gr=class extends fn{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Ms=new ie,Xh=new ie,Ea=[],qh=new An,Ff=new ie,tr=new ft,er=new Pi,Oe=class extends ft{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new gr(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Ff)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new An),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ms),qh.copy(t.boundingBox).applyMatrix4(Ms),this.boundingBox.union(qh)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Pi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ms),er.copy(t.boundingSphere).applyMatrix4(Ms),this.boundingSphere.union(er)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(t,e){let n=this.matrixWorld,s=this.count;if(tr.geometry=this.geometry,tr.material=this.material,tr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),er.copy(this.boundingSphere),er.applyMatrix4(n),t.ray.intersectsSphere(er)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ms),Xh.multiplyMatrices(n,Ms),tr.matrixWorld=Xh,tr.raycast(t,Ea);for(let a=0,o=Ea.length;a<o;a++){let l=Ea[a];l.instanceId=r,l.object=this,e.push(l)}Ea.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new gr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new mr(new Float32Array(s*this.count),s,this.count,wo,Cn));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*t;return r[l]=o,r.set(n,l+1),this}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},tc=new L,Bf=new L,Of=new Qt,Yn=class{constructor(t=new L(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=tc.subVectors(n,e).cross(Bf.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let s=t.delta(tc),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let a=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(s,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Of.getNormalMatrix(t),s=this.coplanarPoint(tc).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},Yi=new Pi,zf=new pt(.5,.5),wa=new L,Is=class{constructor(t=new Yn,e=new Yn,n=new Yn,s=new Yn,r=new Yn,a=new Yn){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=On,n=!1){let s=this.planes,r=t.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],d=r[5],u=r[6],f=r[7],m=r[8],v=r[9],p=r[10],g=r[11],M=r[12],E=r[13],_=r[14],A=r[15];if(s[0].setComponents(c-a,f-h,g-m,A-M).normalize(),s[1].setComponents(c+a,f+h,g+m,A+M).normalize(),s[2].setComponents(c+o,f+d,g+v,A+E).normalize(),s[3].setComponents(c-o,f-d,g-v,A-E).normalize(),n)s[4].setComponents(l,u,p,_).normalize(),s[5].setComponents(c-l,f-u,g-p,A-_).normalize();else if(s[4].setComponents(c-l,f-u,g-p,A-_).normalize(),e===On)s[5].setComponents(c+l,f+u,g+p,A+_).normalize();else if(e===Ts)s[5].setComponents(l,u,p,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Yi.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Yi.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Yi)}intersectsSprite(t){Yi.center.set(0,0,0);let e=zf.distanceTo(t.center);return Yi.radius=.7071067811865476+e,Yi.applyMatrix4(t.matrixWorld),this.intersectsSphere(Yi)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(wa.x=s.normal.x>0?t.max.x:t.min.x,wa.y=s.normal.y>0?t.max.y:t.min.y,wa.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(wa)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var xr=class extends on{constructor(t=[],e=Bi,n,s,r,a,o,l,c,h){super(t,e,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Kn=class extends on{constructor(t,e,n,s,r,a,o,l,c){super(t,e,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var mi=class extends on{constructor(t,e,n=Hn,s,r,a,o=Xe,l=Xe,c,h=$n,d=1){if(h!==$n&&h!==Oi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:e,depth:d};super(u,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Rs(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}},Za=class extends mi{constructor(t,e=Hn,n=Bi,s,r,a=Xe,o=Xe,l,c=$n){let h={width:t,height:t,depth:1},d=[h,h,h,h,h,h];super(t,t,e,n,s,r,a,o,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},_r=class extends on{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},ut=class i extends Be{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],d=[],u=0,f=0;m("z","y","x",-1,-1,n,e,t,a,r,0),m("z","y","x",1,-1,n,e,-t,a,r,1),m("x","z","y",1,1,t,n,e,s,a,2),m("x","z","y",1,-1,t,n,-e,s,a,3),m("x","y","z",1,-1,t,e,n,s,r,4),m("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new se(c,3)),this.setAttribute("normal",new se(h,3)),this.setAttribute("uv",new se(d,2));function m(v,p,g,M,E,_,A,S,w,x,b){let R=_/w,I=A/x,P=_/2,N=A/2,O=S/2,D=w+1,k=x+1,F=0,H=0,Y=new L;for(let J=0;J<k;J++){let $=J*I-N;for(let it=0;it<D;it++){let st=it*R-P;Y[v]=st*M,Y[p]=$*E,Y[g]=O,c.push(Y.x,Y.y,Y.z),Y[v]=0,Y[p]=0,Y[g]=S>0?1:-1,h.push(Y.x,Y.y,Y.z),d.push(it/w),d.push(1-J/x),F+=1}}for(let J=0;J<x;J++)for(let $=0;$<w;$++){let it=u+$+D*J,st=u+$+D*(J+1),Tt=u+($+1)+D*(J+1),vt=u+($+1)+D*J;l.push(it,st,vt),l.push(st,Tt,vt),H+=6}o.addGroup(f,H,b),f+=H,u+=F}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Re=class i extends Be{constructor(t=1,e=1,n=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:t,height:e,capSegments:n,radialSegments:s,heightSegments:r},e=Math.max(0,e),n=Math.max(1,Math.floor(n)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));let a=[],o=[],l=[],c=[],h=e/2,d=Math.PI/2*t,u=e,f=2*d+u,m=n*2+r,v=s+1,p=new L,g=new L;for(let M=0;M<=m;M++){let E=0,_=0,A=0,S=0;if(M<=n){let b=M/n,R=b*Math.PI/2;_=-h-t*Math.cos(R),A=t*Math.sin(R),S=-t*Math.cos(R),E=b*d}else if(M<=n+r){let b=(M-n)/r;_=-h+b*e,A=t,S=0,E=d+b*u}else{let b=(M-n-r)/n,R=b*Math.PI/2;_=h+t*Math.sin(R),A=t*Math.cos(R),S=t*Math.sin(R),E=d+u+b*d}let w=Math.max(0,Math.min(1,E/f)),x=0;M===0?x=.5/s:M===m&&(x=-.5/s);for(let b=0;b<=s;b++){let R=b/s,I=R*Math.PI*2,P=Math.sin(I),N=Math.cos(I);g.x=-A*N,g.y=_,g.z=A*P,o.push(g.x,g.y,g.z),p.set(-A*N,S,A*P),p.normalize(),l.push(p.x,p.y,p.z),c.push(R+x,w)}if(M>0){let b=(M-1)*v;for(let R=0;R<s;R++){let I=b+R,P=b+R+1,N=M*v+R,O=M*v+R+1;a.push(I,P,N),a.push(P,O,N)}}}this.setIndex(a),this.setAttribute("position",new se(o,3)),this.setAttribute("normal",new se(l,3)),this.setAttribute("uv",new se(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},Li=class i extends Be{constructor(t=1,e=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:s},e=Math.max(3,e);let r=[],a=[],o=[],l=[],c=new L,h=new pt;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let d=0,u=3;d<=e;d++,u+=3){let f=n+d/e*s;c.x=t*Math.cos(f),c.y=t*Math.sin(f),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[u]/t+1)/2,h.y=(a[u+1]/t+1)/2,l.push(h.x,h.y)}for(let d=1;d<=e;d++)r.push(d,d+1,0);this.setIndex(r),this.setAttribute("position",new se(a,3)),this.setAttribute("normal",new se(o,3)),this.setAttribute("uv",new se(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.segments,t.thetaStart,t.thetaLength)}},qt=class i extends Be{constructor(t=1,e=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],d=[],u=[],f=[],m=0,v=[],p=n/2,g=0;M(),a===!1&&(t>0&&E(!0),e>0&&E(!1)),this.setIndex(h),this.setAttribute("position",new se(d,3)),this.setAttribute("normal",new se(u,3)),this.setAttribute("uv",new se(f,2));function M(){let _=new L,A=new L,S=0,w=(e-t)/n;for(let x=0;x<=r;x++){let b=[],R=x/r,I=R*(e-t)+t;for(let P=0;P<=s;P++){let N=P/s,O=N*l+o,D=Math.sin(O),k=Math.cos(O);A.x=I*D,A.y=-R*n+p,A.z=I*k,d.push(A.x,A.y,A.z),_.set(D,w,k).normalize(),u.push(_.x,_.y,_.z),f.push(N,1-R),b.push(m++)}v.push(b)}for(let x=0;x<s;x++)for(let b=0;b<r;b++){let R=v[b][x],I=v[b+1][x],P=v[b+1][x+1],N=v[b][x+1];(t>0||b!==0)&&(h.push(R,I,N),S+=3),(e>0||b!==r-1)&&(h.push(I,P,N),S+=3)}c.addGroup(g,S,0),g+=S}function E(_){let A=m,S=new pt,w=new L,x=0,b=_===!0?t:e,R=_===!0?1:-1;for(let P=1;P<=s;P++)d.push(0,p*R,0),u.push(0,R,0),f.push(.5,.5),m++;let I=m;for(let P=0;P<=s;P++){let O=P/s*l+o,D=Math.cos(O),k=Math.sin(O);w.x=b*k,w.y=p*R,w.z=b*D,d.push(w.x,w.y,w.z),u.push(0,R,0),S.x=D*.5+.5,S.y=k*.5*R+.5,f.push(S.x,S.y),m++}for(let P=0;P<s;P++){let N=A+P,O=I+P;_===!0?h.push(O,O+1,N):h.push(O+1,O,N),x+=3}c.addGroup(g,x,_===!0?1:2),g+=x}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},gi=class i extends qt{constructor(t=1,e=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new i(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},$a=class i extends Be{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};let r=[],a=[];o(s),c(n),h(),this.setAttribute("position",new se(r,3)),this.setAttribute("normal",new se(r.slice(),3)),this.setAttribute("uv",new se(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(M){let E=new L,_=new L,A=new L;for(let S=0;S<e.length;S+=3)f(e[S+0],E),f(e[S+1],_),f(e[S+2],A),l(E,_,A,M)}function l(M,E,_,A){let S=A+1,w=[];for(let x=0;x<=S;x++){w[x]=[];let b=M.clone().lerp(_,x/S),R=E.clone().lerp(_,x/S),I=S-x;for(let P=0;P<=I;P++)P===0&&x===S?w[x][P]=b:w[x][P]=b.clone().lerp(R,P/I)}for(let x=0;x<S;x++)for(let b=0;b<2*(S-x)-1;b++){let R=Math.floor(b/2);b%2===0?(u(w[x][R+1]),u(w[x+1][R]),u(w[x][R])):(u(w[x][R+1]),u(w[x+1][R+1]),u(w[x+1][R]))}}function c(M){let E=new L;for(let _=0;_<r.length;_+=3)E.x=r[_+0],E.y=r[_+1],E.z=r[_+2],E.normalize().multiplyScalar(M),r[_+0]=E.x,r[_+1]=E.y,r[_+2]=E.z}function h(){let M=new L;for(let E=0;E<r.length;E+=3){M.x=r[E+0],M.y=r[E+1],M.z=r[E+2];let _=p(M)/2/Math.PI+.5,A=g(M)/Math.PI+.5;a.push(_,1-A)}m(),d()}function d(){for(let M=0;M<a.length;M+=6){let E=a[M+0],_=a[M+2],A=a[M+4],S=Math.max(E,_,A),w=Math.min(E,_,A);S>.9&&w<.1&&(E<.2&&(a[M+0]+=1),_<.2&&(a[M+2]+=1),A<.2&&(a[M+4]+=1))}}function u(M){r.push(M.x,M.y,M.z)}function f(M,E){let _=M*3;E.x=t[_+0],E.y=t[_+1],E.z=t[_+2]}function m(){let M=new L,E=new L,_=new L,A=new L,S=new pt,w=new pt,x=new pt;for(let b=0,R=0;b<r.length;b+=9,R+=6){M.set(r[b+0],r[b+1],r[b+2]),E.set(r[b+3],r[b+4],r[b+5]),_.set(r[b+6],r[b+7],r[b+8]),S.set(a[R+0],a[R+1]),w.set(a[R+2],a[R+3]),x.set(a[R+4],a[R+5]),A.copy(M).add(E).add(_).divideScalar(3);let I=p(A);v(S,R+0,M,I),v(w,R+2,E,I),v(x,R+4,_,I)}}function v(M,E,_,A){A<0&&M.x===1&&(a[E]=M.x-1),_.x===0&&_.z===0&&(a[E]=A/2/Math.PI+.5)}function p(M){return Math.atan2(M.z,-M.x)}function g(M){return Math.atan2(-M.y,Math.sqrt(M.x*M.x+M.z*M.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.vertices,t.indices,t.radius,t.detail)}};var vn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Zt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,s=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)n=this.getPoint(a/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let n=this.getLengths(),s=0,r=n.length,a;e?a=e:a=t*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);let h=n[s],u=n[s+1]-h,f=(a-h)/u;return(s+f)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),l=e||(a.isVector2?new pt:new L);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){let n=new L,s=[],r=[],a=[],o=new L,l=new ie;for(let f=0;f<=t;f++){let m=f/t;s[f]=this.getTangentAt(m,new L)}r[0]=new L,a[0]=new L;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),d=Math.abs(s[0].y),u=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),d<=c&&(c=d,n.set(0,1,0)),u<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(s[f-1],s[f]),o.length()>Number.EPSILON){o.normalize();let m=Math.acos(ce(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(o,m))}a[f].crossVectors(s[f],r[f])}if(e===!0){let f=Math.acos(ce(r[0].dot(r[t]),-1,1));f/=t,s[0].dot(o.crossVectors(r[0],r[t]))>0&&(f=-f);for(let m=1;m<=t;m++)r[m].applyMatrix4(l.makeRotationAxis(s[m],f*m)),a[m].crossVectors(s[m],r[m])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},Ps=class extends vn{constructor(t=0,e=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new pt){let n=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),u=l-this.aX,f=c-this.aY;l=u*h-f*d+this.aX,c=u*d+f*h+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Ja=class extends Ps{constructor(t,e,n,s,r,a){super(t,e,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Bc(){let i=0,t=0,e=0,n=0;function s(r,a,o,l){i=r,t=o,e=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,d){let u=(a-r)/c-(o-r)/(c+h)+(o-a)/h,f=(o-a)/h-(l-a)/(h+d)+(l-o)/d;u*=h,f*=h,s(a,o,u,f)},calc:function(r){let a=r*r,o=a*r;return i+t*r+e*a+n*o}}}var Yh=new L,Zh=new L,ec=new Bc,nc=new Bc,ic=new Bc,Ka=class extends vn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new L){let n=e,s=this.points,r=s.length,a=(r-(this.closed?0:1))*t,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=s[(o-1)%r]:(Zh.subVectors(s[0],s[1]).add(s[0]),c=Zh);let d=s[o%r],u=s[(o+1)%r];if(this.closed||o+2<r?h=s[(o+2)%r]:(Yh.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=Yh),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,m=Math.pow(c.distanceToSquared(d),f),v=Math.pow(d.distanceToSquared(u),f),p=Math.pow(u.distanceToSquared(h),f);v<1e-4&&(v=1),m<1e-4&&(m=v),p<1e-4&&(p=v),ec.initNonuniformCatmullRom(c.x,d.x,u.x,h.x,m,v,p),nc.initNonuniformCatmullRom(c.y,d.y,u.y,h.y,m,v,p),ic.initNonuniformCatmullRom(c.z,d.z,u.z,h.z,m,v,p)}else this.curveType==="catmullrom"&&(ec.initCatmullRom(c.x,d.x,u.x,h.x,this.tension),nc.initCatmullRom(c.y,d.y,u.y,h.y,this.tension),ic.initCatmullRom(c.z,d.z,u.z,h.z,this.tension));return n.set(ec.calc(l),nc.calc(l),ic.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new L().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function $h(i,t,e,n,s){let r=(n-t)*.5,a=(s-e)*.5,o=i*i,l=i*o;return(2*e-2*n+r+a)*l+(-3*e+3*n-2*r-a)*o+r*i+e}function Hf(i,t){let e=1-i;return e*e*t}function Gf(i,t){return 2*(1-i)*i*t}function kf(i,t){return i*i*t}function ir(i,t,e,n){return Hf(i,t)+Gf(i,e)+kf(i,n)}function Vf(i,t){let e=1-i;return e*e*e*t}function Wf(i,t){let e=1-i;return 3*e*e*i*t}function Xf(i,t){return 3*(1-i)*i*i*t}function qf(i,t){return i*i*i*t}function sr(i,t,e,n,s){return Vf(i,t)+Wf(i,e)+Xf(i,n)+qf(i,s)}var yr=class extends vn{constructor(t=new pt,e=new pt,n=new pt,s=new pt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new pt){let n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(sr(t,s.x,r.x,a.x,o.x),sr(t,s.y,r.y,a.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Qa=class extends vn{constructor(t=new L,e=new L,n=new L,s=new L){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new L){let n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(sr(t,s.x,r.x,a.x,o.x),sr(t,s.y,r.y,a.y,o.y),sr(t,s.z,r.z,a.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},vr=class extends vn{constructor(t=new pt,e=new pt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new pt){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new pt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},ja=class extends vn{constructor(t=new L,e=new L){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new L){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new L){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Mr=class extends vn{constructor(t=new pt,e=new pt,n=new pt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new pt){let n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(ir(t,s.x,r.x,a.x),ir(t,s.y,r.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},to=class extends vn{constructor(t=new L,e=new L,n=new L){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new L){let n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(ir(t,s.x,r.x,a.x),ir(t,s.y,r.y,a.y),ir(t,s.z,r.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Sr=class extends vn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new pt){let n=e,s=this.points,r=(s.length-1)*t,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],h=s[a>s.length-2?s.length-1:a+1],d=s[a>s.length-3?s.length-1:a+2];return n.set($h(o,l.x,c.x,h.x,d.x),$h(o,l.y,c.y,h.y,d.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new pt().fromArray(s))}return this}},uc=Object.freeze({__proto__:null,ArcCurve:Ja,CatmullRomCurve3:Ka,CubicBezierCurve:yr,CubicBezierCurve3:Qa,EllipseCurve:Ps,LineCurve:vr,LineCurve3:ja,QuadraticBezierCurve:Mr,QuadraticBezierCurve3:to,SplineCurve:Sr}),eo=class extends vn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new uc[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let a=s[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(new uc[s.type]().fromJSON(s))}return this}},br=class extends eo{constructor(t){super(),this.type="Path",this.currentPoint=new pt,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let n=new vr(this.currentPoint.clone(),new pt(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){let r=new Mr(this.currentPoint.clone(),new pt(t,e),new pt(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,a){let o=new yr(this.currentPoint.clone(),new pt(t,e),new pt(n,s),new pt(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),n=new Sr(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+o,e+l,n,s,r,a),this}absarc(t,e,n,s,r,a){return this.absellipse(t,e,n,n,s,r,a),this}ellipse(t,e,n,s,r,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,n,s,r,a,o,l),this}absellipse(t,e,n,s,r,a,o,l){let c=new Ps(t,e,n,s,r,a,o,l);if(this.curves.length>0){let d=c.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},Ls=class extends br{constructor(t){super(t),this.uuid=zs(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){let s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(new br().fromJSON(s))}return this}};function Yf(i,t,e=2){let n=t&&t.length,s=n?t[0]*e:i.length,r=Hu(i,0,s,e,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(n&&(r=Qf(i,t,r,e)),i.length>80*e){o=i[0],l=i[1];let h=o,d=l;for(let u=e;u<s;u+=e){let f=i[u],m=i[u+1];f<o&&(o=f),m<l&&(l=m),f>h&&(h=f),m>d&&(d=m)}c=Math.max(h-o,d-l),c=c!==0?32767/c:0}return Er(r,a,e,o,l,c,0),a}function Hu(i,t,e,n,s){let r;if(s===cp(i,t,e,n)>0)for(let a=t;a<e;a+=n)r=Jh(a/n|0,i[a],i[a+1],r);else for(let a=e-n;a>=t;a-=n)r=Jh(a/n|0,i[a],i[a+1],r);return r&&Ds(r,r.next)&&(Tr(r),r=r.next),r}function ji(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(Ds(e,e.next)||Ae(e.prev,e,e.next)===0)){if(Tr(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function Er(i,t,e,n,s,r,a){if(!i)return;!a&&r&&ip(i,n,s,r);let o=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(r?$f(i,n,s,r):Zf(i)){t.push(l.i,i.i,c.i),Tr(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=Jf(ji(i),t),Er(i,t,e,n,s,r,2)):a===2&&Kf(i,t,e,n,s,r):Er(ji(i),t,e,n,s,r,1);break}}}function Zf(i){let t=i.prev,e=i,n=i.next;if(Ae(t,e,n)>=0)return!1;let s=t.x,r=e.x,a=n.x,o=t.y,l=e.y,c=n.y,h=Math.min(s,r,a),d=Math.min(o,l,c),u=Math.max(s,r,a),f=Math.max(o,l,c),m=n.next;for(;m!==t;){if(m.x>=h&&m.x<=u&&m.y>=d&&m.y<=f&&nr(s,o,r,l,a,c,m.x,m.y)&&Ae(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function $f(i,t,e,n){let s=i.prev,r=i,a=i.next;if(Ae(s,r,a)>=0)return!1;let o=s.x,l=r.x,c=a.x,h=s.y,d=r.y,u=a.y,f=Math.min(o,l,c),m=Math.min(h,d,u),v=Math.max(o,l,c),p=Math.max(h,d,u),g=dc(f,m,t,e,n),M=dc(v,p,t,e,n),E=i.prevZ,_=i.nextZ;for(;E&&E.z>=g&&_&&_.z<=M;){if(E.x>=f&&E.x<=v&&E.y>=m&&E.y<=p&&E!==s&&E!==a&&nr(o,h,l,d,c,u,E.x,E.y)&&Ae(E.prev,E,E.next)>=0||(E=E.prevZ,_.x>=f&&_.x<=v&&_.y>=m&&_.y<=p&&_!==s&&_!==a&&nr(o,h,l,d,c,u,_.x,_.y)&&Ae(_.prev,_,_.next)>=0))return!1;_=_.nextZ}for(;E&&E.z>=g;){if(E.x>=f&&E.x<=v&&E.y>=m&&E.y<=p&&E!==s&&E!==a&&nr(o,h,l,d,c,u,E.x,E.y)&&Ae(E.prev,E,E.next)>=0)return!1;E=E.prevZ}for(;_&&_.z<=M;){if(_.x>=f&&_.x<=v&&_.y>=m&&_.y<=p&&_!==s&&_!==a&&nr(o,h,l,d,c,u,_.x,_.y)&&Ae(_.prev,_,_.next)>=0)return!1;_=_.nextZ}return!0}function Jf(i,t){let e=i;do{let n=e.prev,s=e.next.next;!Ds(n,s)&&ku(n,e,e.next,s)&&wr(n,s)&&wr(s,n)&&(t.push(n.i,e.i,s.i),Tr(e),Tr(e.next),e=i=s),e=e.next}while(e!==i);return ji(e)}function Kf(i,t,e,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&ap(a,o)){let l=Vu(a,o);a=ji(a,a.next),l=ji(l,l.next),Er(a,t,e,n,s,r,0),Er(l,t,e,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function Qf(i,t,e,n){let s=[];for(let r=0,a=t.length;r<a;r++){let o=t[r]*n,l=r<a-1?t[r+1]*n:i.length,c=Hu(i,o,l,n,!1);c===c.next&&(c.steiner=!0),s.push(rp(c))}s.sort(jf);for(let r=0;r<s.length;r++)e=tp(s[r],e);return e}function jf(i,t){let e=i.x-t.x;if(e===0&&(e=i.y-t.y,e===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(t.next.y-t.y)/(t.next.x-t.x);e=n-s}return e}function tp(i,t){let e=ep(i,t);if(!e)return t;let n=Vu(e,i);return ji(n,n.next),ji(e,e.next)}function ep(i,t){let e=t,n=i.x,s=i.y,r=-1/0,a;if(Ds(i,e))return e;do{if(Ds(i,e.next))return e.next;if(s<=e.y&&s>=e.next.y&&e.next.y!==e.y){let d=e.x+(s-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(d<=n&&d>r&&(r=d,a=e.x<e.next.x?e:e.next,d===n))return a}e=e.next}while(e!==t);if(!a)return null;let o=a,l=a.x,c=a.y,h=1/0;e=a;do{if(n>=e.x&&e.x>=l&&n!==e.x&&Gu(s<c?n:r,s,l,c,s<c?r:n,s,e.x,e.y)){let d=Math.abs(s-e.y)/(n-e.x);wr(e,i)&&(d<h||d===h&&(e.x>a.x||e.x===a.x&&np(a,e)))&&(a=e,h=d)}e=e.next}while(e!==o);return a}function np(i,t){return Ae(i.prev,i,t.prev)<0&&Ae(t.next,i,i.next)<0}function ip(i,t,e,n){let s=i;do s.z===0&&(s.z=dc(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,sp(s)}function sp(i){let t,e=1;do{let n=i,s;i=null;let r=null;for(t=0;n;){t++;let a=n,o=0;for(let c=0;c<e&&(o++,a=a.nextZ,!!a);c++);let l=e;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(s=n,n=n.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=a}r.nextZ=null,e*=2}while(t>1);return i}function dc(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function rp(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function Gu(i,t,e,n,s,r,a,o){return(s-a)*(t-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(e-a)*(t-o)&&(e-a)*(r-o)>=(s-a)*(n-o)}function nr(i,t,e,n,s,r,a,o){return!(i===a&&t===o)&&Gu(i,t,e,n,s,r,a,o)}function ap(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!op(i,t)&&(wr(i,t)&&wr(t,i)&&lp(i,t)&&(Ae(i.prev,i,t.prev)||Ae(i,t.prev,t))||Ds(i,t)&&Ae(i.prev,i,i.next)>0&&Ae(t.prev,t,t.next)>0)}function Ae(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function Ds(i,t){return i.x===t.x&&i.y===t.y}function ku(i,t,e,n){let s=Aa(Ae(i,t,e)),r=Aa(Ae(i,t,n)),a=Aa(Ae(e,n,i)),o=Aa(Ae(e,n,t));return!!(s!==r&&a!==o||s===0&&Ta(i,e,t)||r===0&&Ta(i,n,t)||a===0&&Ta(e,i,n)||o===0&&Ta(e,t,n))}function Ta(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function Aa(i){return i>0?1:i<0?-1:0}function op(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&ku(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function wr(i,t){return Ae(i.prev,i,i.next)<0?Ae(i,t,i.next)>=0&&Ae(i,i.prev,t)>=0:Ae(i,t,i.prev)<0||Ae(i,i.next,t)<0}function lp(i,t){let e=i,n=!1,s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function Vu(i,t){let e=fc(i.i,i.x,i.y),n=fc(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function Jh(i,t,e,n){let s=fc(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Tr(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function fc(i,t,e){return{i,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function cp(i,t,e,n){let s=0;for(let r=t,a=e-n;r<e;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}var pc=class{static triangulate(t,e,n=2){return Yf(t,e,n)}},$i=class i{static area(t){let e=t.length,n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return i.area(t)<0}static triangulateShape(t,e){let n=[],s=[],r=[];Kh(t),Qh(n,t);let a=t.length;e.forEach(Kh);for(let l=0;l<e.length;l++)s.push(a),a+=e[l].length,Qh(n,e[l]);let o=pc.triangulate(n,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function Kh(i){let t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function Qh(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}var Us=class i extends Be{constructor(t=new Ls([new pt(.5,.5),new pt(-.5,.5),new pt(-.5,-.5),new pt(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let n=this,s=[],r=[];for(let o=0,l=t.length;o<l;o++){let c=t[o];a(c)}this.setAttribute("position",new se(s,3)),this.setAttribute("uv",new se(r,2)),this.computeVertexNormals();function a(o){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,d=e.depth!==void 0?e.depth:1,u=e.bevelEnabled!==void 0?e.bevelEnabled:!0,f=e.bevelThickness!==void 0?e.bevelThickness:.2,m=e.bevelSize!==void 0?e.bevelSize:f-.1,v=e.bevelOffset!==void 0?e.bevelOffset:0,p=e.bevelSegments!==void 0?e.bevelSegments:3,g=e.extrudePath,M=e.UVGenerator!==void 0?e.UVGenerator:hp,E,_=!1,A,S,w,x;if(g){E=g.getSpacedPoints(h),_=!0,u=!1;let j=g.isCatmullRomCurve3?g.closed:!1;A=g.computeFrenetFrames(h,j),S=new L,w=new L,x=new L}u||(p=0,f=0,m=0,v=0);let b=o.extractPoints(c),R=b.shape,I=b.holes;if(!$i.isClockWise(R)){R=R.reverse();for(let j=0,ct=I.length;j<ct;j++){let lt=I[j];$i.isClockWise(lt)&&(I[j]=lt.reverse())}}function N(j){let lt=10000000000000001e-36,Et=j[0];for(let Mt=1;Mt<=j.length;Mt++){let Yt=Mt%j.length,Ht=j[Yt],Kt=Ht.x-Et.x,te=Ht.y-Et.y,U=Kt*Kt+te*te,pe=Math.max(Math.abs(Ht.x),Math.abs(Ht.y),Math.abs(Et.x),Math.abs(Et.y)),le=lt*pe*pe;if(U<=le){j.splice(Yt,1),Mt--;continue}Et=Ht}}N(R),I.forEach(N);let O=I.length,D=R;for(let j=0;j<O;j++){let ct=I[j];R=R.concat(ct)}function k(j,ct,lt){return ct||Jt("ExtrudeGeometry: vec does not exist"),j.clone().addScaledVector(ct,lt)}let F=R.length;function H(j,ct,lt){let Et,Mt,Yt,Ht=j.x-ct.x,Kt=j.y-ct.y,te=lt.x-j.x,U=lt.y-j.y,pe=Ht*Ht+Kt*Kt,le=Ht*U-Kt*te;if(Math.abs(le)>Number.EPSILON){let C=Math.sqrt(pe),y=Math.sqrt(te*te+U*U),G=ct.x-Kt/C,X=ct.y+Ht/C,K=lt.x-U/y,dt=lt.y+te/y,mt=((K-G)*U-(dt-X)*te)/(Ht*U-Kt*te);Et=G+Ht*mt-j.x,Mt=X+Kt*mt-j.y;let Q=Et*Et+Mt*Mt;if(Q<=2)return new pt(Et,Mt);Yt=Math.sqrt(Q/2)}else{let C=!1;Ht>Number.EPSILON?te>Number.EPSILON&&(C=!0):Ht<-Number.EPSILON?te<-Number.EPSILON&&(C=!0):Math.sign(Kt)===Math.sign(U)&&(C=!0),C?(Et=-Kt,Mt=Ht,Yt=Math.sqrt(pe)):(Et=Ht,Mt=Kt,Yt=Math.sqrt(pe/2))}return new pt(Et/Yt,Mt/Yt)}let Y=[];for(let j=0,ct=D.length,lt=ct-1,Et=j+1;j<ct;j++,lt++,Et++)lt===ct&&(lt=0),Et===ct&&(Et=0),Y[j]=H(D[j],D[lt],D[Et]);let J=[],$,it=Y.concat();for(let j=0,ct=O;j<ct;j++){let lt=I[j];$=[];for(let Et=0,Mt=lt.length,Yt=Mt-1,Ht=Et+1;Et<Mt;Et++,Yt++,Ht++)Yt===Mt&&(Yt=0),Ht===Mt&&(Ht=0),$[Et]=H(lt[Et],lt[Yt],lt[Ht]);J.push($),it=it.concat($)}let st;if(p===0)st=$i.triangulateShape(D,I);else{let j=[],ct=[];for(let lt=0;lt<p;lt++){let Et=lt/p,Mt=f*Math.cos(Et*Math.PI/2),Yt=m*Math.sin(Et*Math.PI/2)+v;for(let Ht=0,Kt=D.length;Ht<Kt;Ht++){let te=k(D[Ht],Y[Ht],Yt);ht(te.x,te.y,-Mt),Et===0&&j.push(te)}for(let Ht=0,Kt=O;Ht<Kt;Ht++){let te=I[Ht];$=J[Ht];let U=[];for(let pe=0,le=te.length;pe<le;pe++){let C=k(te[pe],$[pe],Yt);ht(C.x,C.y,-Mt),Et===0&&U.push(C)}Et===0&&ct.push(U)}}st=$i.triangulateShape(j,ct)}let Tt=st.length,vt=m+v;for(let j=0;j<F;j++){let ct=u?k(R[j],it[j],vt):R[j];_?(w.copy(A.normals[0]).multiplyScalar(ct.x),S.copy(A.binormals[0]).multiplyScalar(ct.y),x.copy(E[0]).add(w).add(S),ht(x.x,x.y,x.z)):ht(ct.x,ct.y,0)}for(let j=1;j<=h;j++)for(let ct=0;ct<F;ct++){let lt=u?k(R[ct],it[ct],vt):R[ct];_?(w.copy(A.normals[j]).multiplyScalar(lt.x),S.copy(A.binormals[j]).multiplyScalar(lt.y),x.copy(E[j]).add(w).add(S),ht(x.x,x.y,x.z)):ht(lt.x,lt.y,d/h*j)}for(let j=p-1;j>=0;j--){let ct=j/p,lt=f*Math.cos(ct*Math.PI/2),Et=m*Math.sin(ct*Math.PI/2)+v;for(let Mt=0,Yt=D.length;Mt<Yt;Mt++){let Ht=k(D[Mt],Y[Mt],Et);ht(Ht.x,Ht.y,d+lt)}for(let Mt=0,Yt=I.length;Mt<Yt;Mt++){let Ht=I[Mt];$=J[Mt];for(let Kt=0,te=Ht.length;Kt<te;Kt++){let U=k(Ht[Kt],$[Kt],Et);_?ht(U.x,U.y+E[h-1].y,E[h-1].x+lt):ht(U.x,U.y,d+lt)}}}q(),rt();function q(){let j=s.length/3;if(u){let ct=0,lt=F*ct;for(let Et=0;Et<Tt;Et++){let Mt=st[Et];Ot(Mt[2]+lt,Mt[1]+lt,Mt[0]+lt)}ct=h+p*2,lt=F*ct;for(let Et=0;Et<Tt;Et++){let Mt=st[Et];Ot(Mt[0]+lt,Mt[1]+lt,Mt[2]+lt)}}else{for(let ct=0;ct<Tt;ct++){let lt=st[ct];Ot(lt[2],lt[1],lt[0])}for(let ct=0;ct<Tt;ct++){let lt=st[ct];Ot(lt[0]+F*h,lt[1]+F*h,lt[2]+F*h)}}n.addGroup(j,s.length/3-j,0)}function rt(){let j=s.length/3,ct=0;et(D,ct),ct+=D.length;for(let lt=0,Et=I.length;lt<Et;lt++){let Mt=I[lt];et(Mt,ct),ct+=Mt.length}n.addGroup(j,s.length/3-j,1)}function et(j,ct){let lt=j.length;for(;--lt>=0;){let Et=lt,Mt=lt-1;Mt<0&&(Mt=j.length-1);for(let Yt=0,Ht=h+p*2;Yt<Ht;Yt++){let Kt=F*Yt,te=F*(Yt+1),U=ct+Et+Kt,pe=ct+Mt+Kt,le=ct+Mt+te,C=ct+Et+te;Nt(U,pe,le,C)}}}function ht(j,ct,lt){l.push(j),l.push(ct),l.push(lt)}function Ot(j,ct,lt){ae(j),ae(ct),ae(lt);let Et=s.length/3,Mt=M.generateTopUV(n,s,Et-3,Et-2,Et-1);It(Mt[0]),It(Mt[1]),It(Mt[2])}function Nt(j,ct,lt,Et){ae(j),ae(ct),ae(Et),ae(ct),ae(lt),ae(Et);let Mt=s.length/3,Yt=M.generateSideWallUV(n,s,Mt-6,Mt-3,Mt-2,Mt-1);It(Yt[0]),It(Yt[1]),It(Yt[3]),It(Yt[1]),It(Yt[2]),It(Yt[3])}function ae(j){s.push(l[j*3+0]),s.push(l[j*3+1]),s.push(l[j*3+2])}function It(j){r.push(j.x),r.push(j.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return up(e,n,t)}static fromJSON(t,e){let n=[];for(let r=0,a=t.shapes.length;r<a;r++){let o=e[t.shapes[r]];n.push(o)}let s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new uc[s.type]().fromJSON(s)),new i(n,t.options)}},hp={generateTopUV:function(i,t,e,n,s){let r=t[e*3],a=t[e*3+1],o=t[n*3],l=t[n*3+1],c=t[s*3],h=t[s*3+1];return[new pt(r,a),new pt(o,l),new pt(c,h)]},generateSideWallUV:function(i,t,e,n,s,r){let a=t[e*3],o=t[e*3+1],l=t[e*3+2],c=t[n*3],h=t[n*3+1],d=t[n*3+2],u=t[s*3],f=t[s*3+1],m=t[s*3+2],v=t[r*3],p=t[r*3+1],g=t[r*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new pt(a,1-l),new pt(c,1-d),new pt(u,1-m),new pt(v,1-g)]:[new pt(o,1-l),new pt(h,1-d),new pt(f,1-m),new pt(p,1-g)]}};function up(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var Ar=class i extends $a{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};var Ee=class i extends Be{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,d=t/o,u=e/l,f=[],m=[],v=[],p=[];for(let g=0;g<h;g++){let M=g*u-a;for(let E=0;E<c;E++){let _=E*d-r;m.push(_,-M,0),v.push(0,0,1),p.push(E/o),p.push(1-g/l)}}for(let g=0;g<l;g++)for(let M=0;M<o;M++){let E=M+c*g,_=M+c*(g+1),A=M+1+c*(g+1),S=M+1+c*g;f.push(E,_,S),f.push(_,A,S)}this.setIndex(f),this.setAttribute("position",new se(m,3)),this.setAttribute("normal",new se(v,3)),this.setAttribute("uv",new se(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}};var fe=class i extends Be{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,h=[],d=new L,u=new L,f=[],m=[],v=[],p=[];for(let g=0;g<=n;g++){let M=[],E=g/n,_=a+E*o,A=t*Math.cos(_),S=Math.sqrt(t*t-A*A),w=0;g===0&&a===0?w=.5/e:g===n&&l===Math.PI&&(w=-.5/e);for(let x=0;x<=e;x++){let b=x/e,R=s+b*r;d.x=-S*Math.cos(R),d.y=A,d.z=S*Math.sin(R),m.push(d.x,d.y,d.z),u.copy(d).normalize(),v.push(u.x,u.y,u.z),p.push(b+w,1-E),M.push(c++)}h.push(M)}for(let g=0;g<n;g++)for(let M=0;M<e;M++){let E=h[g][M+1],_=h[g][M],A=h[g+1][M],S=h[g+1][M+1];(g!==0||a>0)&&f.push(E,_,S),(g!==n-1||l<Math.PI)&&f.push(_,A,S)}this.setIndex(f),this.setAttribute("position",new se(m,3)),this.setAttribute("normal",new se(v,3)),this.setAttribute("uv",new se(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var Rr=class i extends Be{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),s=Math.floor(s);let l=[],c=[],h=[],d=[],u=new L,f=new L,m=new L;for(let v=0;v<=n;v++){let p=a+v/n*o;for(let g=0;g<=s;g++){let M=g/s*r;f.x=(t+e*Math.cos(p))*Math.cos(M),f.y=(t+e*Math.cos(p))*Math.sin(M),f.z=e*Math.sin(p),c.push(f.x,f.y,f.z),u.x=t*Math.cos(M),u.y=t*Math.sin(M),m.subVectors(f,u).normalize(),h.push(m.x,m.y,m.z),d.push(g/s),d.push(v/n)}}for(let v=1;v<=n;v++)for(let p=1;p<=s;p++){let g=(s+1)*v+p-1,M=(s+1)*(v-1)+p-1,E=(s+1)*(v-1)+p,_=(s+1)*v+p;l.push(g,M,_),l.push(M,E,_)}this.setIndex(l),this.setAttribute("position",new se(c,3)),this.setAttribute("normal",new se(h,3)),this.setAttribute("uv",new se(d,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}};function es(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];if(jh(s))s.isRenderTargetTexture?(Zt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(jh(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function rn(i){let t={};for(let e=0;e<i.length;e++){let n=es(i[e]);for(let s in n)t[s]=n[s]}return t}function jh(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function dp(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Oc(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:he.workingColorSpace}var Wu={clone:es,merge:rn},fp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,pp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,ln=class extends pi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=fp,this.fragmentShader=pp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=es(t.uniforms),this.uniformsGroups=dp(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new Vt().setHex(s.value);break;case"v2":this.uniforms[n].value=new pt().fromArray(s.value);break;case"v3":this.uniforms[n].value=new L().fromArray(s.value);break;case"v4":this.uniforms[n].value=new we().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Qt().fromArray(s.value);break;case"m4":this.uniforms[n].value=new ie().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},no=class extends ln{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Ct=class extends pi{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Vt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Vt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Xr,this.normalScale=new pt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Te,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var Ue=class extends pi{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Vt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Vt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Xr,this.normalScale=new pt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Te,this.combine=_o,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},io=class extends pi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Au,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},so=class extends pi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Ra(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}var Di=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let a;e:{i:if(!(t<s)){for(let o=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=e[++n],t<s)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=e[--n-1],t>=r)break t}a=n,n=0;break e}break n}for(;n<a;){let o=n+a>>>1;t<e[o]?a=o:n=o+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=n[r+a];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},ro=class extends Di{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ac,endingEnd:ac}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,a=t+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case oc:r=t,o=2*e-n;break;case lc:r=s.length-2,o=e+s[r]-s[r+1];break;default:r=t,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case oc:a=t,l=2*n-e;break;case lc:a=1,l=n+s[1]-s[0];break;default:a=t-1,l=e}let c=(n-e)*.5,h=this.valueSize;this._weightPrev=c/(e-o),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,f=this._weightNext,m=(n-e)/(s-e),v=m*m,p=v*m,g=-u*p+2*u*v-u*m,M=(1+u)*p+(-1.5-2*u)*v+(-.5+u)*m+1,E=(-1-f)*p+(1.5+f)*v+.5*m,_=f*p-f*v;for(let A=0;A!==o;++A)r[A]=g*a[h+A]+M*a[c+A]+E*a[l+A]+_*a[d+A];return r}},ao=class extends Di{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=(n-e)/(s-e),d=1-h;for(let u=0;u!==o;++u)r[u]=a[c+u]*d+a[l+u]*h;return r}},oo=class extends Di{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},lo=class extends Di{interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this.inTangents,d=this.outTangents;if(!h||!d){let m=(n-e)/(s-e),v=1-m;for(let p=0;p!==o;++p)r[p]=a[c+p]*v+a[l+p]*m;return r}let u=o*2,f=t-1;for(let m=0;m!==o;++m){let v=a[c+m],p=a[l+m],g=f*u+m*2,M=d[g],E=d[g+1],_=t*u+m*2,A=h[_],S=h[_+1],w=(n-e)/(s-e),x,b,R,I,P;for(let N=0;N<8;N++){x=w*w,b=x*w,R=1-w,I=R*R,P=I*R;let D=P*e+3*I*w*M+3*R*x*A+b*s-n;if(Math.abs(D)<1e-10)break;let k=3*I*(M-e)+6*R*w*(A-M)+3*x*(s-A);if(Math.abs(k)<1e-10)break;w=w-D/k,w=Math.max(0,Math.min(1,w))}r[m]=P*v+3*I*w*E+3*R*x*S+b*p}return r}},Mn=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Ra(e,this.TimeBufferType),this.values=Ra(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:Ra(t.times,Array),values:Ra(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s)}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new oo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new ao(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new ro(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new lo(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case rr:e=this.InterpolantFactoryMethodDiscrete;break;case ka:e=this.InterpolantFactoryMethodLinear;break;case Pa:e=this.InterpolantFactoryMethodSmooth;break;case rc:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Zt("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return rr;case this.InterpolantFactoryMethodLinear:return ka;case this.InterpolantFactoryMethodSmooth:return Pa;case this.InterpolantFactoryMethodBezier:return rc}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t}return this}trim(t,e){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<t;)++r;for(;a!==-1&&n[a]>e;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Jt("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Jt("KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){Jt("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(a!==null&&a>l){Jt("KeyframeTrack: Out of order keys.",this,o,l,a),t=!1;break}a=l}if(s!==void 0&&yf(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Jt("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Pa,r=t.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=t[o],h=t[o+1];if(c!==h&&(o!==1||c!==t[0]))if(s)l=!0;else{let d=o*n,u=d-n,f=d+n;for(let m=0;m!==n;++m){let v=e[d+m];if(v!==e[u+m]||v!==e[f+m]){l=!0;break}}}if(l){if(o!==a){t[a]=t[o];let d=o*n,u=a*n;for(let f=0;f!==n;++f)e[u+f]=e[d+f]}++a}}if(r>0){t[a]=t[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)e[l+c]=e[o+c];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,s}};Mn.prototype.ValueTypeName="";Mn.prototype.TimeBufferType=Float32Array;Mn.prototype.ValueBufferType=Float32Array;Mn.prototype.DefaultInterpolation=ka;var Ui=class extends Mn{constructor(t,e,n){super(t,e,n)}};Ui.prototype.ValueTypeName="bool";Ui.prototype.ValueBufferType=Array;Ui.prototype.DefaultInterpolation=rr;Ui.prototype.InterpolantFactoryMethodLinear=void 0;Ui.prototype.InterpolantFactoryMethodSmooth=void 0;var co=class extends Mn{constructor(t,e,n,s){super(t,e,n,s)}};co.prototype.ValueTypeName="color";var ho=class extends Mn{constructor(t,e,n,s){super(t,e,n,s)}};ho.prototype.ValueTypeName="number";var uo=class extends Di{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-e)/(s-e),c=t*o;for(let h=c+o;c!==h;c+=4)Se.slerpFlat(r,0,a,c-o,a,c,l);return r}},Cr=class extends Mn{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new uo(this.times,this.values,this.getValueSize(),t)}};Cr.prototype.ValueTypeName="quaternion";Cr.prototype.InterpolantFactoryMethodSmooth=void 0;var Ni=class extends Mn{constructor(t,e,n){super(t,e,n)}};Ni.prototype.ValueTypeName="string";Ni.prototype.ValueBufferType=Array;Ni.prototype.DefaultInterpolation=rr;Ni.prototype.InterpolantFactoryMethodLinear=void 0;Ni.prototype.InterpolantFactoryMethodSmooth=void 0;var fo=class extends Mn{constructor(t,e,n,s){super(t,e,n,s)}};fo.prototype.ValueTypeName="vector";var po=class{constructor(t,e,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){let d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=c.length;d<u;d+=2){let f=c[d],m=c[d+1];if(f.global&&(f.lastIndex=0),f.test(h))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Xu=new po,mo=class{constructor(t){this.manager=t!==void 0?t:Xu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};mo.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ir=class extends sn{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Vt(t),this.intensity=e}dispose(){this.dispatchEvent({type:"dispose"})}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},Pr=class extends Ir{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(sn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Vt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},sc=new ie,tu=new L,eu=new L,mc=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new pt(512,512),this.mapType=pn,this.map=null,this.mapPass=null,this.matrix=new ie,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Is,this._frameExtents=new pt(1,1),this._viewportCount=1,this._viewports=[new we(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera,n=this.matrix;tu.setFromMatrixPosition(t.matrixWorld),e.position.copy(tu),eu.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(eu),e.updateMatrixWorld(),sc.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(sc,e.coordinateSystem,e.reversedDepth),e.coordinateSystem===Ts||e.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(sc)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Ca=new L,Ia=new Se,qn=new L,Lr=class extends sn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ie,this.projectionMatrix=new ie,this.projectionMatrixInverse=new ie,this.coordinateSystem=On,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Ca,Ia,qn),qn.x===1&&qn.y===1&&qn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ca,Ia,qn.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(Ca,Ia,qn),qn.x===1&&qn.y===1&&qn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ca,Ia,qn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Ri=new L,nu=new pt,iu=new pt,nn=class extends Lr{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Va*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Ll*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Va*2*Math.atan(Math.tan(Ll*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Ri.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Ri.x,Ri.y).multiplyScalar(-t/Ri.z),Ri.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ri.x,Ri.y).multiplyScalar(-t/Ri.z)}getViewSize(t,e){return this.getViewBounds(t,nu,iu),e.subVectors(iu,nu)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Ll*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var Fi=class extends Lr{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,a=n+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},gc=class extends mc{constructor(){super(new Fi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Dr=class extends Ir{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(sn.DEFAULT_UP),this.updateMatrix(),this.target=new sn,this.shadow=new gc}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var Ss=-90,bs=1,Ns=class extends sn{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new nn(Ss,bs,t,e);s.layers=this.layers,this.add(s);let r=new nn(Ss,bs,t,e);r.layers=this.layers,this.add(r);let a=new nn(Ss,bs,t,e);a.layers=this.layers,this.add(a);let o=new nn(Ss,bs,t,e);o.layers=this.layers,this.add(o);let l=new nn(Ss,bs,t,e);l.layers=this.layers,this.add(l);let c=new nn(Ss,bs,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,l]=e;for(let c of e)this.remove(c);if(t===On)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Ts)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,d=t.getRenderTarget(),u=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),m=t.xr.enabled;t.xr.enabled=!1;let v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let p=!1;t.isWebGLRenderer===!0?p=t.state.buffers.depth.getReversed():p=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,2,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,3,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(n,4,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),n.texture.generateMipmaps=v,t.setRenderTarget(n,5,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(d,u,f),t.xr.enabled=m,n.texture.needsPMREMUpdate=!0}},go=class extends nn{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var zc="\\[\\]\\.:\\/",mp=new RegExp("["+zc+"]","g"),Hc="[^"+zc+"]",gp="[^"+zc.replace("\\.","")+"]",xp=/((?:WC+[\/:])*)/.source.replace("WC",Hc),_p=/(WCOD+)?/.source.replace("WCOD",gp),yp=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Hc),vp=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Hc),Mp=new RegExp("^"+xp+_p+yp+vp+"$"),Sp=["material","materials","bones","map"],xc=class{constructor(t,e,n){let s=n||be.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},be=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(mp,"")}static parseTrackName(t){let e=Mp.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Sp.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let l=n(o.children);if(l)return l}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Zt("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){Jt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Jt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Jt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Jt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Jt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){Jt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){Jt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let a=t[s];if(a===void 0){let c=e.nodeName;Jt("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Jt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Jt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};be.Composite=xc;be.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};be.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};be.prototype.GetterByBindingType=[be.prototype._getValue_direct,be.prototype._getValue_array,be.prototype._getValue_arrayElement,be.prototype._getValue_toArray];be.prototype.SetterByBindingTypeAndVersioning=[[be.prototype._setValue_direct,be.prototype._setValue_direct_setNeedsUpdate,be.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[be.prototype._setValue_array,be.prototype._setValue_array_setNeedsUpdate,be.prototype._setValue_array_setMatrixWorldNeedsUpdate],[be.prototype._setValue_arrayElement,be.prototype._setValue_arrayElement_setNeedsUpdate,be.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[be.prototype._setValue_fromArray,be.prototype._setValue_fromArray_setNeedsUpdate,be.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var ay=new Float32Array(1);var _c=class i{static{i.prototype.isMatrix2=!0}constructor(t,e,n,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=s,this}};function Gc(i,t,e,n){let s=bp(n);switch(e){case Dc:return i*t;case wo:return i*t/s.components*s.byteLength;case To:return i*t/s.components*s.byteLength;case zi:return i*t*2/s.components*s.byteLength;case Ao:return i*t*2/s.components*s.byteLength;case Uc:return i*t*3/s.components*s.byteLength;case In:return i*t*4/s.components*s.byteLength;case Ro:return i*t*4/s.components*s.byteLength;case zr:case Hr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Gr:case kr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Io:case Lo:return Math.max(i,16)*Math.max(t,8)/4;case Co:case Po:return Math.max(i,8)*Math.max(t,8)/2;case Do:case Uo:case Fo:case Bo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case No:case Vr:case Oo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case zo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Ho:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Go:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case ko:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Vo:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case Wo:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Xo:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case qo:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Yo:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Zo:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case $o:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Jo:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Ko:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Qo:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case jo:case tl:case el:return Math.ceil(i/4)*Math.ceil(t/4)*16;case nl:case il:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Wr:case sl:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function bp(i){switch(i){case pn:case Cc:return{byteLength:1,components:1};case Bs:case Ic:case ti:return{byteLength:2,components:1};case bo:case Eo:return{byteLength:2,components:4};case Hn:case So:case Cn:return{byteLength:4,components:1};case Pc:case Lc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"185"}}));typeof window<"u"&&(window.__THREE__?Zt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="185");function pd(){let i=null,t=!1,e=null,n=null;function s(r,a){e(r,a),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function wp(i){let t=new WeakMap;function e(o,l){let c=o.array,h=o.usage,d=c.byteLength,u=i.createBuffer();i.bindBuffer(l,u),i.bufferData(l,c,h),o.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function n(o,l,c){let h=l.array,d=l.updateRanges;if(i.bindBuffer(c,o),d.length===0)i.bufferSubData(c,0,h);else{d.sort((f,m)=>f.start-m.start);let u=0;for(let f=1;f<d.length;f++){let m=d[u],v=d[f];v.start<=m.start+m.count+1?m.count=Math.max(m.count,v.start+v.count-m.start):(++u,d[u]=v)}d.length=u+1;for(let f=0,m=d.length;f<m;f++){let v=d[f];i.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(i.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Tp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Ap=`#ifdef USE_ALPHAHASH
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
#endif`,Rp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Cp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ip=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Pp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Lp=`#ifdef USE_AOMAP
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
#endif`,Dp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Up=`#ifdef USE_BATCHING
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
#endif`,Np=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Fp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Bp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Op=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,zp=`#ifdef USE_IRIDESCENCE
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
#endif`,Hp=`#ifdef USE_BUMPMAP
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
#endif`,Gp=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,kp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Vp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Wp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Xp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,qp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Yp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Zp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,$p=`#define PI 3.141592653589793
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
} // validated`,Jp=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Kp=`vec3 transformedNormal = objectNormal;
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
#endif`,Qp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,jp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,tm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,em=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,nm="gl_FragColor = linearToOutputTexel( gl_FragColor );",im=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,sm=`#ifdef USE_ENVMAP
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
#endif`,rm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,am=`#ifdef USE_ENVMAP
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
#endif`,om=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,lm=`#ifdef USE_ENVMAP
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
#endif`,cm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,hm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,um=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,dm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,fm=`#ifdef USE_GRADIENTMAP
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
}`,pm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,mm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,gm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,xm=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,_m=`#ifdef USE_ENVMAP
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
#endif`,ym=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,vm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Mm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Sm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,bm=`PhysicalMaterial material;
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
#endif`,Em=`uniform sampler2D dfgLUT;
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
}`,wm=`
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
#endif`,Tm=`#if defined( RE_IndirectDiffuse )
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
#endif`,Am=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Rm=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,Cm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Im=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Pm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Lm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Dm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Um=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Nm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Fm=`#if defined( USE_POINTS_UV )
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
#endif`,Bm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Om=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,zm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Hm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Gm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,km=`#ifdef USE_MORPHTARGETS
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
#endif`,Vm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Wm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Xm=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,qm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ym=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Zm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,$m=`#ifdef USE_NORMALMAP
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
#endif`,Jm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Km=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Qm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,jm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,t0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,e0=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,n0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,i0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,s0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,r0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,a0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,o0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,l0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,c0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,h0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,u0=`float getShadowMask() {
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
}`,d0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,f0=`#ifdef USE_SKINNING
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
#endif`,p0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,m0=`#ifdef USE_SKINNING
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
#endif`,g0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,x0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,_0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,y0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,v0=`#ifdef USE_TRANSMISSION
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
#endif`,M0=`#ifdef USE_TRANSMISSION
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
#endif`,S0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,b0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,E0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,w0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,T0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,A0=`uniform sampler2D t2D;
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
}`,R0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,C0=`#ifdef ENVMAP_TYPE_CUBE
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
}`,I0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,P0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,L0=`#include <common>
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
}`,D0=`#if DEPTH_PACKING == 3200
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
}`,U0=`#define DISTANCE
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
}`,N0=`#define DISTANCE
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
}`,F0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,B0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,O0=`uniform float scale;
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
}`,z0=`uniform vec3 diffuse;
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
}`,H0=`#include <common>
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
}`,G0=`uniform vec3 diffuse;
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
}`,k0=`#define LAMBERT
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
}`,V0=`#define LAMBERT
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
}`,W0=`#define MATCAP
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
}`,X0=`#define MATCAP
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
}`,q0=`#define NORMAL
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
}`,Y0=`#define NORMAL
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
}`,Z0=`#define PHONG
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
}`,$0=`#define PHONG
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
}`,J0=`#define STANDARD
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
}`,K0=`#define STANDARD
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
}`,Q0=`#define TOON
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
}`,j0=`#define TOON
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
}`,tg=`uniform float size;
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
}`,eg=`uniform vec3 diffuse;
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
}`,ng=`#include <common>
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
}`,ig=`uniform vec3 color;
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
}`,sg=`uniform float rotation;
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
}`,rg=`uniform vec3 diffuse;
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
}`,re={alphahash_fragment:Tp,alphahash_pars_fragment:Ap,alphamap_fragment:Rp,alphamap_pars_fragment:Cp,alphatest_fragment:Ip,alphatest_pars_fragment:Pp,aomap_fragment:Lp,aomap_pars_fragment:Dp,batching_pars_vertex:Up,batching_vertex:Np,begin_vertex:Fp,beginnormal_vertex:Bp,bsdfs:Op,iridescence_fragment:zp,bumpmap_pars_fragment:Hp,clipping_planes_fragment:Gp,clipping_planes_pars_fragment:kp,clipping_planes_pars_vertex:Vp,clipping_planes_vertex:Wp,color_fragment:Xp,color_pars_fragment:qp,color_pars_vertex:Yp,color_vertex:Zp,common:$p,cube_uv_reflection_fragment:Jp,defaultnormal_vertex:Kp,displacementmap_pars_vertex:Qp,displacementmap_vertex:jp,emissivemap_fragment:tm,emissivemap_pars_fragment:em,colorspace_fragment:nm,colorspace_pars_fragment:im,envmap_fragment:sm,envmap_common_pars_fragment:rm,envmap_pars_fragment:am,envmap_pars_vertex:om,envmap_physical_pars_fragment:_m,envmap_vertex:lm,fog_vertex:cm,fog_pars_vertex:hm,fog_fragment:um,fog_pars_fragment:dm,gradientmap_pars_fragment:fm,lightmap_pars_fragment:pm,lights_lambert_fragment:mm,lights_lambert_pars_fragment:gm,lights_pars_begin:xm,lights_toon_fragment:ym,lights_toon_pars_fragment:vm,lights_phong_fragment:Mm,lights_phong_pars_fragment:Sm,lights_physical_fragment:bm,lights_physical_pars_fragment:Em,lights_fragment_begin:wm,lights_fragment_maps:Tm,lights_fragment_end:Am,lightprobes_pars_fragment:Rm,logdepthbuf_fragment:Cm,logdepthbuf_pars_fragment:Im,logdepthbuf_pars_vertex:Pm,logdepthbuf_vertex:Lm,map_fragment:Dm,map_pars_fragment:Um,map_particle_fragment:Nm,map_particle_pars_fragment:Fm,metalnessmap_fragment:Bm,metalnessmap_pars_fragment:Om,morphinstance_vertex:zm,morphcolor_vertex:Hm,morphnormal_vertex:Gm,morphtarget_pars_vertex:km,morphtarget_vertex:Vm,normal_fragment_begin:Wm,normal_fragment_maps:Xm,normal_pars_fragment:qm,normal_pars_vertex:Ym,normal_vertex:Zm,normalmap_pars_fragment:$m,clearcoat_normal_fragment_begin:Jm,clearcoat_normal_fragment_maps:Km,clearcoat_pars_fragment:Qm,iridescence_pars_fragment:jm,opaque_fragment:t0,packing:e0,premultiplied_alpha_fragment:n0,project_vertex:i0,dithering_fragment:s0,dithering_pars_fragment:r0,roughnessmap_fragment:a0,roughnessmap_pars_fragment:o0,shadowmap_pars_fragment:l0,shadowmap_pars_vertex:c0,shadowmap_vertex:h0,shadowmask_pars_fragment:u0,skinbase_vertex:d0,skinning_pars_vertex:f0,skinning_vertex:p0,skinnormal_vertex:m0,specularmap_fragment:g0,specularmap_pars_fragment:x0,tonemapping_fragment:_0,tonemapping_pars_fragment:y0,transmission_fragment:v0,transmission_pars_fragment:M0,uv_pars_fragment:S0,uv_pars_vertex:b0,uv_vertex:E0,worldpos_vertex:w0,background_vert:T0,background_frag:A0,backgroundCube_vert:R0,backgroundCube_frag:C0,cube_vert:I0,cube_frag:P0,depth_vert:L0,depth_frag:D0,distance_vert:U0,distance_frag:N0,equirect_vert:F0,equirect_frag:B0,linedashed_vert:O0,linedashed_frag:z0,meshbasic_vert:H0,meshbasic_frag:G0,meshlambert_vert:k0,meshlambert_frag:V0,meshmatcap_vert:W0,meshmatcap_frag:X0,meshnormal_vert:q0,meshnormal_frag:Y0,meshphong_vert:Z0,meshphong_frag:$0,meshphysical_vert:J0,meshphysical_frag:K0,meshtoon_vert:Q0,meshtoon_frag:j0,points_vert:tg,points_frag:eg,shadow_vert:ng,shadow_frag:ig,sprite_vert:sg,sprite_frag:rg},bt={common:{diffuse:{value:new Vt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Qt},alphaMap:{value:null},alphaMapTransform:{value:new Qt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Qt}},envmap:{envMap:{value:null},envMapRotation:{value:new Qt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Qt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Qt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Qt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Qt},normalScale:{value:new pt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Qt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Qt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Qt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Qt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Vt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new L},probesMax:{value:new L},probesResolution:{value:new L}},points:{diffuse:{value:new Vt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Qt},alphaTest:{value:0},uvTransform:{value:new Qt}},sprite:{diffuse:{value:new Vt(16777215)},opacity:{value:1},center:{value:new pt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Qt},alphaMap:{value:null},alphaMapTransform:{value:new Qt},alphaTest:{value:0}}},ni={basic:{uniforms:rn([bt.common,bt.specularmap,bt.envmap,bt.aomap,bt.lightmap,bt.fog]),vertexShader:re.meshbasic_vert,fragmentShader:re.meshbasic_frag},lambert:{uniforms:rn([bt.common,bt.specularmap,bt.envmap,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.fog,bt.lights,{emissive:{value:new Vt(0)},envMapIntensity:{value:1}}]),vertexShader:re.meshlambert_vert,fragmentShader:re.meshlambert_frag},phong:{uniforms:rn([bt.common,bt.specularmap,bt.envmap,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.fog,bt.lights,{emissive:{value:new Vt(0)},specular:{value:new Vt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:re.meshphong_vert,fragmentShader:re.meshphong_frag},standard:{uniforms:rn([bt.common,bt.envmap,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.roughnessmap,bt.metalnessmap,bt.fog,bt.lights,{emissive:{value:new Vt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:re.meshphysical_vert,fragmentShader:re.meshphysical_frag},toon:{uniforms:rn([bt.common,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.gradientmap,bt.fog,bt.lights,{emissive:{value:new Vt(0)}}]),vertexShader:re.meshtoon_vert,fragmentShader:re.meshtoon_frag},matcap:{uniforms:rn([bt.common,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.fog,{matcap:{value:null}}]),vertexShader:re.meshmatcap_vert,fragmentShader:re.meshmatcap_frag},points:{uniforms:rn([bt.points,bt.fog]),vertexShader:re.points_vert,fragmentShader:re.points_frag},dashed:{uniforms:rn([bt.common,bt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:re.linedashed_vert,fragmentShader:re.linedashed_frag},depth:{uniforms:rn([bt.common,bt.displacementmap]),vertexShader:re.depth_vert,fragmentShader:re.depth_frag},normal:{uniforms:rn([bt.common,bt.bumpmap,bt.normalmap,bt.displacementmap,{opacity:{value:1}}]),vertexShader:re.meshnormal_vert,fragmentShader:re.meshnormal_frag},sprite:{uniforms:rn([bt.sprite,bt.fog]),vertexShader:re.sprite_vert,fragmentShader:re.sprite_frag},background:{uniforms:{uvTransform:{value:new Qt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:re.background_vert,fragmentShader:re.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Qt}},vertexShader:re.backgroundCube_vert,fragmentShader:re.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:re.cube_vert,fragmentShader:re.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:re.equirect_vert,fragmentShader:re.equirect_frag},distance:{uniforms:rn([bt.common,bt.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:re.distance_vert,fragmentShader:re.distance_frag},shadow:{uniforms:rn([bt.lights,bt.fog,{color:{value:new Vt(0)},opacity:{value:1}}]),vertexShader:re.shadow_vert,fragmentShader:re.shadow_frag}};ni.physical={uniforms:rn([ni.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Qt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Qt},clearcoatNormalScale:{value:new pt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Qt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Qt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Qt},sheen:{value:0},sheenColor:{value:new Vt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Qt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Qt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Qt},transmissionSamplerSize:{value:new pt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Qt},attenuationDistance:{value:0},attenuationColor:{value:new Vt(0)},specularColor:{value:new Vt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Qt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Qt},anisotropyVector:{value:new pt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Qt}}]),vertexShader:re.meshphysical_vert,fragmentShader:re.meshphysical_frag};var ol={r:0,b:0,g:0},ag=new ie,md=new Qt;md.set(-1,0,0,0,1,0,0,0,1);function og(i,t,e,n,s,r){let a=new Vt(0),o=s===!0?0:1,l,c,h=null,d=0,u=null;function f(M){let E=M.isScene===!0?M.background:null;if(E&&E.isTexture){let _=M.backgroundBlurriness>0;E=t.get(E,_)}return E}function m(M){let E=!1,_=f(M);_===null?p(a,o):_&&_.isColor&&(p(_,1),E=!0);let A=i.xr.getEnvironmentBlendMode();A==="additive"?e.buffers.color.setClear(0,0,0,1,r):A==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||E)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function v(M,E){let _=f(E);_&&(_.isCubeTexture||_.mapping===Br)?(c===void 0&&(c=new ft(new ut(1,1,1),new ln({name:"BackgroundCubeMaterial",uniforms:es(ni.backgroundCube.uniforms),vertexShader:ni.backgroundCube.vertexShader,fragmentShader:ni.backgroundCube.fragmentShader,side:Je,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(A,S,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=_,c.material.uniforms.backgroundBlurriness.value=E.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(ag.makeRotationFromEuler(E.backgroundRotation)).transpose(),_.isCubeTexture&&_.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(md),c.material.toneMapped=he.getTransfer(_.colorSpace)!==de,(h!==_||d!==_.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,h=_,d=_.version,u=i.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null)):_&&_.isTexture&&(l===void 0&&(l=new ft(new Ee(2,2),new ln({name:"BackgroundMaterial",uniforms:es(ni.background.uniforms),vertexShader:ni.background.vertexShader,fragmentShader:ni.background.fragmentShader,side:fi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=_,l.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,l.material.toneMapped=he.getTransfer(_.colorSpace)!==de,_.matrixAutoUpdate===!0&&_.updateMatrix(),l.material.uniforms.uvTransform.value.copy(_.matrix),(h!==_||d!==_.version||u!==i.toneMapping)&&(l.material.needsUpdate=!0,h=_,d=_.version,u=i.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null))}function p(M,E){M.getRGB(ol,Oc(i)),e.buffers.color.setClear(ol.r,ol.g,ol.b,E,r)}function g(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(M,E=1){a.set(M),o=E,p(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(M){o=M,p(a,o)},render:m,addToRenderList:v,dispose:g}}function lg(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null),r=s,a=!1;function o(I,P,N,O,D){let k=!1,F=d(I,O,N,P);r!==F&&(r=F,c(r.object)),k=f(I,O,N,D),k&&m(I,O,N,D),D!==null&&t.update(D,i.ELEMENT_ARRAY_BUFFER),(k||a)&&(a=!1,_(I,P,N,O),D!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(D).buffer))}function l(){return i.createVertexArray()}function c(I){return i.bindVertexArray(I)}function h(I){return i.deleteVertexArray(I)}function d(I,P,N,O){let D=O.wireframe===!0,k=n[P.id];k===void 0&&(k={},n[P.id]=k);let F=I.isInstancedMesh===!0?I.id:0,H=k[F];H===void 0&&(H={},k[F]=H);let Y=H[N.id];Y===void 0&&(Y={},H[N.id]=Y);let J=Y[D];return J===void 0&&(J=u(l()),Y[D]=J),J}function u(I){let P=[],N=[],O=[];for(let D=0;D<e;D++)P[D]=0,N[D]=0,O[D]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:N,attributeDivisors:O,object:I,attributes:{},index:null}}function f(I,P,N,O){let D=r.attributes,k=P.attributes,F=0,H=N.getAttributes();for(let Y in H)if(H[Y].location>=0){let $=D[Y],it=k[Y];if(it===void 0&&(Y==="instanceMatrix"&&I.instanceMatrix&&(it=I.instanceMatrix),Y==="instanceColor"&&I.instanceColor&&(it=I.instanceColor)),$===void 0||$.attribute!==it||it&&$.data!==it.data)return!0;F++}return r.attributesNum!==F||r.index!==O}function m(I,P,N,O){let D={},k=P.attributes,F=0,H=N.getAttributes();for(let Y in H)if(H[Y].location>=0){let $=k[Y];$===void 0&&(Y==="instanceMatrix"&&I.instanceMatrix&&($=I.instanceMatrix),Y==="instanceColor"&&I.instanceColor&&($=I.instanceColor));let it={};it.attribute=$,$&&$.data&&(it.data=$.data),D[Y]=it,F++}r.attributes=D,r.attributesNum=F,r.index=O}function v(){let I=r.newAttributes;for(let P=0,N=I.length;P<N;P++)I[P]=0}function p(I){g(I,0)}function g(I,P){let N=r.newAttributes,O=r.enabledAttributes,D=r.attributeDivisors;N[I]=1,O[I]===0&&(i.enableVertexAttribArray(I),O[I]=1),D[I]!==P&&(i.vertexAttribDivisor(I,P),D[I]=P)}function M(){let I=r.newAttributes,P=r.enabledAttributes;for(let N=0,O=P.length;N<O;N++)P[N]!==I[N]&&(i.disableVertexAttribArray(N),P[N]=0)}function E(I,P,N,O,D,k,F){F===!0?i.vertexAttribIPointer(I,P,N,D,k):i.vertexAttribPointer(I,P,N,O,D,k)}function _(I,P,N,O){v();let D=O.attributes,k=N.getAttributes(),F=P.defaultAttributeValues;for(let H in k){let Y=k[H];if(Y.location>=0){let J=D[H];if(J===void 0&&(H==="instanceMatrix"&&I.instanceMatrix&&(J=I.instanceMatrix),H==="instanceColor"&&I.instanceColor&&(J=I.instanceColor)),J!==void 0){let $=J.normalized,it=J.itemSize,st=t.get(J);if(st===void 0)continue;let Tt=st.buffer,vt=st.type,q=st.bytesPerElement,rt=vt===i.INT||vt===i.UNSIGNED_INT||J.gpuType===So;if(J.isInterleavedBufferAttribute){let et=J.data,ht=et.stride,Ot=J.offset;if(et.isInstancedInterleavedBuffer){for(let Nt=0;Nt<Y.locationSize;Nt++)g(Y.location+Nt,et.meshPerAttribute);I.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=et.meshPerAttribute*et.count)}else for(let Nt=0;Nt<Y.locationSize;Nt++)p(Y.location+Nt);i.bindBuffer(i.ARRAY_BUFFER,Tt);for(let Nt=0;Nt<Y.locationSize;Nt++)E(Y.location+Nt,it/Y.locationSize,vt,$,ht*q,(Ot+it/Y.locationSize*Nt)*q,rt)}else{if(J.isInstancedBufferAttribute){for(let et=0;et<Y.locationSize;et++)g(Y.location+et,J.meshPerAttribute);I.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=J.meshPerAttribute*J.count)}else for(let et=0;et<Y.locationSize;et++)p(Y.location+et);i.bindBuffer(i.ARRAY_BUFFER,Tt);for(let et=0;et<Y.locationSize;et++)E(Y.location+et,it/Y.locationSize,vt,$,it*q,it/Y.locationSize*et*q,rt)}}else if(F!==void 0){let $=F[H];if($!==void 0)switch($.length){case 2:i.vertexAttrib2fv(Y.location,$);break;case 3:i.vertexAttrib3fv(Y.location,$);break;case 4:i.vertexAttrib4fv(Y.location,$);break;default:i.vertexAttrib1fv(Y.location,$)}}}}M()}function A(){b();for(let I in n){let P=n[I];for(let N in P){let O=P[N];for(let D in O){let k=O[D];for(let F in k)h(k[F].object),delete k[F];delete O[D]}}delete n[I]}}function S(I){if(n[I.id]===void 0)return;let P=n[I.id];for(let N in P){let O=P[N];for(let D in O){let k=O[D];for(let F in k)h(k[F].object),delete k[F];delete O[D]}}delete n[I.id]}function w(I){for(let P in n){let N=n[P];for(let O in N){let D=N[O];if(D[I.id]===void 0)continue;let k=D[I.id];for(let F in k)h(k[F].object),delete k[F];delete D[I.id]}}}function x(I){for(let P in n){let N=n[P],O=I.isInstancedMesh===!0?I.id:0,D=N[O];if(D!==void 0){for(let k in D){let F=D[k];for(let H in F)h(F[H].object),delete F[H];delete D[k]}delete N[O],Object.keys(N).length===0&&delete n[P]}}}function b(){R(),a=!0,r!==s&&(r=s,c(r.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:b,resetDefaultState:R,dispose:A,releaseStatesOfGeometry:S,releaseStatesOfObject:x,releaseStatesOfProgram:w,initAttributes:v,enableAttribute:p,disableUnusedAttributes:M}}function cg(i,t,e){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),e.update(c,n,1)}function a(l,c,h){h!==0&&(i.drawArraysInstanced(n,l,c,h),e.update(c,n,h))}function o(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let u=0;for(let f=0;f<h;f++)u+=c[f];e.update(u,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function hg(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let w=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(w){return!(w!==In&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){let x=w===ti&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(w!==pn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==Cn&&!x)}function l(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(Zt("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let d=e.logarithmicDepthBuffer===!0,u=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&u===!1&&Zt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),m=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),p=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),E=i.getParameter(i.MAX_VARYING_VECTORS),_=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),A=i.getParameter(i.MAX_SAMPLES),S=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:m,maxTextureSize:v,maxCubemapSize:p,maxAttributes:g,maxVertexUniforms:M,maxVaryings:E,maxFragmentUniforms:_,maxSamples:A,samples:S}}function ug(i){let t=this,e=null,n=0,s=!1,r=!1,a=new Yn,o=new Qt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){let f=d.length!==0||u||n!==0||s;return s=u,n=d.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,u){e=h(d,u,0)},this.setState=function(d,u,f){let m=d.clippingPlanes,v=d.clipIntersection,p=d.clipShadows,g=i.get(d);if(!s||m===null||m.length===0||r&&!p)r?h(null):c();else{let M=r?0:n,E=M*4,_=g.clippingState||null;l.value=_,_=h(m,u,E,f);for(let A=0;A!==E;++A)_[A]=e[A];g.clippingState=_,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(d,u,f,m){let v=d!==null?d.length:0,p=null;if(v!==0){if(p=l.value,m!==!0||p===null){let g=f+v*4,M=u.matrixWorldInverse;o.getNormalMatrix(M),(p===null||p.length<g)&&(p=new Float32Array(g));for(let E=0,_=f;E!==v;++E,_+=4)a.copy(d[E]).applyMatrix4(M,o),a.normal.toArray(p,_),p[_+3]=a.constant}l.value=p,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,p}}var Hi=4,qu=[.125,.215,.35,.446,.526,.582],ns=20,dg=256,qr=new Fi,Yu=new Vt,kc=null,Vc=0,Wc=0,Xc=!1,fg=new L,cl=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){let{size:a=256,position:o=fg}=r;kc=this._renderer.getRenderTarget(),Vc=this._renderer.getActiveCubeFace(),Wc=this._renderer.getActiveMipmapLevel(),Xc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,n,s,l,o),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ju(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=$u(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(kc,Vc,Wc),this._renderer.xr.enabled=Xc,t.scissorTest=!1,Hs(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Bi||t.mapping===ts?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),kc=this._renderer.getRenderTarget(),Vc=this._renderer.getActiveCubeFace(),Wc=this._renderer.getActiveMipmapLevel(),Xc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:$e,minFilter:$e,generateMipmaps:!1,type:ti,format:In,colorSpace:ar,depthBuffer:!1},s=Zu(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Zu(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=pg(r)),this._blurMaterial=gg(r,t,e),this._ggxMaterial=mg(r,t,e)}return s}_compileMaterial(t){let e=new ft(new Be,t);this._renderer.compile(e,qr)}_sceneToCubeUV(t,e,n,s,r){let l=new nn(90,1,e,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,f=d.toneMapping;d.getClearColor(Yu),d.toneMapping=zn,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new ft(new ut,new Rn({name:"PMREM.Background",side:Je,depthWrite:!1,depthTest:!1})));let v=this._backgroundBox,p=v.material,g=!1,M=t.background;M?M.isColor&&(p.color.copy(M),t.background=null,g=!0):(p.color.copy(Yu),g=!0);for(let E=0;E<6;E++){let _=E%3;_===0?(l.up.set(0,c[E],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[E],r.y,r.z)):_===1?(l.up.set(0,0,c[E]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[E],r.z)):(l.up.set(0,c[E],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[E]));let A=this._cubeSize;Hs(s,_*A,E>2?A:0,A,A),d.setRenderTarget(s),g&&d.render(v,l),d.render(t,l)}d.toneMapping=f,d.autoClear=u,t.background=M}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===Bi||t.mapping===ts;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ju()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=$u());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=t;let l=this._cubeSize;Hs(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,qr)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let l=a.uniforms,c=n/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),d=Math.sqrt(c*c-h*h),u=0+c*1.25,f=d*u,{_lodMax:m}=this,v=this._sizeLods[n],p=3*v*(n>m-Hi?n-m+Hi:0),g=4*(this._cubeSize-v);l.envMap.value=t.texture,l.roughness.value=f,l.mipInt.value=m-e,Hs(r,p,g,3*v,2*v),s.setRenderTarget(r),s.render(o,qr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=m-n,Hs(t,p,g,3*v,2*v),s.setRenderTarget(t),s.render(o,qr)}_blur(t,e,n,s,r){let a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,s,"latitudinal",r),this._halfBlur(a,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,a,o){let l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&Jt("blur direction must be either latitudinal or longitudinal!");let h=3,d=this._lodMeshes[s];d.material=c;let u=c.uniforms,f=this._sizeLods[n]-1,m=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*ns-1),v=r/m,p=isFinite(r)?1+Math.floor(h*v):ns;p>ns&&Zt(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${ns}`);let g=[],M=0;for(let w=0;w<ns;++w){let x=w/v,b=Math.exp(-x*x/2);g.push(b),w===0?M+=b:w<p&&(M+=2*b)}for(let w=0;w<g.length;w++)g[w]=g[w]/M;u.envMap.value=t.texture,u.samples.value=p,u.weights.value=g,u.latitudinal.value=a==="latitudinal",o&&(u.poleAxis.value=o);let{_lodMax:E}=this;u.dTheta.value=m,u.mipInt.value=E-n;let _=this._sizeLods[s],A=3*_*(s>E-Hi?s-E+Hi:0),S=4*(this._cubeSize-_);Hs(e,A,S,3*_,2*_),l.setRenderTarget(e),l.render(d,qr)}};function pg(i){let t=[],e=[],n=[],s=i,r=i-Hi+1+qu.length;for(let a=0;a<r;a++){let o=Math.pow(2,s);t.push(o);let l=1/o;a>i-Hi?l=qu[a-i+Hi-1]:a===0&&(l=0),e.push(l);let c=1/(o-2),h=-c,d=1+c,u=[h,h,d,h,d,d,h,h,d,d,h,d],f=6,m=6,v=3,p=2,g=1,M=new Float32Array(v*m*f),E=new Float32Array(p*m*f),_=new Float32Array(g*m*f);for(let S=0;S<f;S++){let w=S%3*2/3-1,x=S>2?0:-1,b=[w,x,0,w+2/3,x,0,w+2/3,x+1,0,w,x,0,w+2/3,x+1,0,w,x+1,0];M.set(b,v*m*S),E.set(u,p*m*S);let R=[S,S,S,S,S,S];_.set(R,g*m*S)}let A=new Be;A.setAttribute("position",new fn(M,v)),A.setAttribute("uv",new fn(E,p)),A.setAttribute("faceIndex",new fn(_,g)),n.push(new ft(A,null)),s>Hi&&s--}return{lodMeshes:n,sizeLods:t,sigmas:e}}function Zu(i,t,e){let n=new yn(i,t,e);return n.texture.mapping=Br,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Hs(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function mg(i,t,e){return new ln({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:dg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:ul(),fragmentShader:`

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
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function gg(i,t,e){let n=new Float32Array(ns),s=new L(0,1,0);return new ln({name:"SphericalGaussianBlur",defines:{n:ns,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:ul(),fragmentShader:`

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
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function $u(){return new ln({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ul(),fragmentShader:`

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
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function Ju(){return new ln({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ul(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function ul(){return`

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
	`}var ks=class extends yn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new xr(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new ut(5,5,5),r=new ln({name:"CubemapFromEquirect",uniforms:es(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Je,blending:Qn});r.uniforms.tEquirect.value=e;let a=new ft(s,r),o=e.minFilter;return e.minFilter===jn&&(e.minFilter=$e),new Ns(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}};function xg(i){let t=new WeakMap,e=new WeakMap,n=null;function s(u,f=!1){return u==null?null:f?a(u):r(u)}function r(u){if(u&&u.isTexture){let f=u.mapping;if(f===yo||f===vo)if(t.has(u)){let m=t.get(u).texture;return o(m,u.mapping)}else{let m=u.image;if(m&&m.height>0){let v=new ks(m.height);return v.fromEquirectangularTexture(i,u),t.set(u,v),u.addEventListener("dispose",c),o(v.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture){let f=u.mapping,m=f===yo||f===vo,v=f===Bi||f===ts;if(m||v){let p=e.get(u),g=p!==void 0?p.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==g)return n===null&&(n=new cl(i)),p=m?n.fromEquirectangular(u,p):n.fromCubemap(u,p),p.texture.pmremVersion=u.pmremVersion,e.set(u,p),p.texture;if(p!==void 0)return p.texture;{let M=u.image;return m&&M&&M.height>0||v&&M&&l(M)?(n===null&&(n=new cl(i)),p=m?n.fromEquirectangular(u):n.fromCubemap(u),p.texture.pmremVersion=u.pmremVersion,e.set(u,p),u.addEventListener("dispose",h),p.texture):null}}}return u}function o(u,f){return f===yo?u.mapping=Bi:f===vo&&(u.mapping=ts),u}function l(u){let f=0,m=6;for(let v=0;v<m;v++)u[v]!==void 0&&f++;return f===m}function c(u){let f=u.target;f.removeEventListener("dispose",c);let m=t.get(f);m!==void 0&&(t.delete(f),m.dispose())}function h(u){let f=u.target;f.removeEventListener("dispose",h);let m=e.get(f);m!==void 0&&(e.delete(f),m.dispose())}function d(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:d}}function _g(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&Ji("WebGLRenderer: "+n+" extension not supported."),s}}}function yg(i,t,e,n){let s={},r=new WeakMap;function a(d){let u=d.target;u.index!==null&&t.remove(u.index);for(let m in u.attributes)t.remove(u.attributes[m]);u.removeEventListener("dispose",a),delete s[u.id];let f=r.get(u);f&&(t.remove(f),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function o(d,u){return s[u.id]===!0||(u.addEventListener("dispose",a),s[u.id]=!0,e.memory.geometries++),u}function l(d){let u=d.attributes;for(let f in u)t.update(u[f],i.ARRAY_BUFFER)}function c(d){let u=[],f=d.index,m=d.attributes.position,v=0;if(m===void 0)return;if(f!==null){let M=f.array;v=f.version;for(let E=0,_=M.length;E<_;E+=3){let A=M[E+0],S=M[E+1],w=M[E+2];u.push(A,S,S,w,w,A)}}else{let M=m.array;v=m.version;for(let E=0,_=M.length/3-1;E<_;E+=3){let A=E+0,S=E+1,w=E+2;u.push(A,S,S,w,w,A)}}let p=new(m.count>=65535?pr:fr)(u,1);p.version=v;let g=r.get(d);g&&t.remove(g),r.set(d,p)}function h(d){let u=r.get(d);if(u){let f=d.index;f!==null&&u.version<f.version&&c(d)}else c(d);return r.get(d)}return{get:o,update:l,getWireframeAttribute:h}}function vg(i,t,e){let n;function s(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,u){i.drawElements(n,u,r,d*a),e.update(u,n,1)}function c(d,u,f){f!==0&&(i.drawElementsInstanced(n,u,r,d*a,f),e.update(u,n,f))}function h(d,u,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,r,d,0,f);let v=0;for(let p=0;p<f;p++)v+=u[p];e.update(v,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function Mg(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:Jt("WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Sg(i,t,e){let n=new WeakMap,s=new we;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=h!==void 0?h.length:0,u=n.get(o);if(u===void 0||u.count!==d){let b=function(){w.dispose(),n.delete(o),o.removeEventListener("dispose",b)};u!==void 0&&u.texture.dispose();let f=o.morphAttributes.position!==void 0,m=o.morphAttributes.normal!==void 0,v=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],g=o.morphAttributes.normal||[],M=o.morphAttributes.color||[],E=0;f===!0&&(E=1),m===!0&&(E=2),v===!0&&(E=3);let _=o.attributes.position.count*E,A=1;_>t.maxTextureSize&&(A=Math.ceil(_/t.maxTextureSize),_=t.maxTextureSize);let S=new Float32Array(_*A*4*d),w=new cr(S,_,A,d);w.type=Cn,w.needsUpdate=!0;let x=E*4;for(let R=0;R<d;R++){let I=p[R],P=g[R],N=M[R],O=_*A*4*R;for(let D=0;D<I.count;D++){let k=D*x;f===!0&&(s.fromBufferAttribute(I,D),S[O+k+0]=s.x,S[O+k+1]=s.y,S[O+k+2]=s.z,S[O+k+3]=0),m===!0&&(s.fromBufferAttribute(P,D),S[O+k+4]=s.x,S[O+k+5]=s.y,S[O+k+6]=s.z,S[O+k+7]=0),v===!0&&(s.fromBufferAttribute(N,D),S[O+k+8]=s.x,S[O+k+9]=s.y,S[O+k+10]=s.z,S[O+k+11]=N.itemSize===4?s.w:1)}}u={count:d,texture:w,size:new pt(_,A)},n.set(o,u),o.addEventListener("dispose",b)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let f=0;for(let v=0;v<c.length;v++)f+=c[v];let m=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",m),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",u.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:r}}function bg(i,t,e,n,s){let r=new WeakMap;function a(c){let h=s.render.frame,d=c.geometry,u=t.get(c,d);if(r.get(u)!==h&&(t.update(u),r.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(e.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return u}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:a,dispose:o}}var Eg={[Sc]:"LINEAR_TONE_MAPPING",[bc]:"REINHARD_TONE_MAPPING",[Ec]:"CINEON_TONE_MAPPING",[Fr]:"ACES_FILMIC_TONE_MAPPING",[Tc]:"AGX_TONE_MAPPING",[Ac]:"NEUTRAL_TONE_MAPPING",[wc]:"CUSTOM_TONE_MAPPING"};function wg(i,t,e,n,s,r){let a=new yn(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,depthTexture:s?new mi(t,e):void 0}),o=new yn(t,e,{type:ti,depthBuffer:!1,stencilBuffer:!1}),l=new Be;l.setAttribute("position",new se([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new se([0,2,0,0,2,0],2));let c=new no({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),h=new ft(l,c),d=new Fi(-1,1,1,-1,0,1),u=null,f=null,m=!1,v,p=null,g=[],M=!1;this.setSize=function(E,_){a.setSize(E,_),o.setSize(E,_);for(let A=0;A<g.length;A++){let S=g[A];S.setSize&&S.setSize(E,_)}},this.setEffects=function(E){g=E,M=g.length>0&&g[0].isRenderPass===!0;let _=a.width,A=a.height;for(let S=0;S<g.length;S++){let w=g[S];w.setSize&&w.setSize(_,A)}},this.begin=function(E,_){if(m||E.toneMapping===zn&&g.length===0)return!1;if(p=_,_!==null){let A=_.width,S=_.height;(a.width!==A||a.height!==S)&&this.setSize(A,S)}return M===!1&&E.setRenderTarget(a),v=E.toneMapping,E.toneMapping=zn,!0},this.hasRenderPass=function(){return M},this.end=function(E,_){E.toneMapping=v,m=!0;let A=a,S=o;for(let w=0;w<g.length;w++){let x=g[w];if(x.enabled!==!1&&(x.render(E,S,A,_),x.needsSwap!==!1)){let b=A;A=S,S=b}}if(u!==E.outputColorSpace||f!==E.toneMapping){u=E.outputColorSpace,f=E.toneMapping,c.defines={},he.getTransfer(u)===de&&(c.defines.SRGB_TRANSFER="");let w=Eg[f];w&&(c.defines[w]=""),c.needsUpdate=!0}c.uniforms.tDiffuse.value=A.texture,E.setRenderTarget(p),E.render(h,d),p=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),o.dispose(),l.dispose(),c.dispose()}}var gd=new on,Zc=new mi(1,1),xd=new cr,_d=new qa,yd=new xr,Ku=[],Qu=[],ju=new Float32Array(16),td=new Float32Array(9),ed=new Float32Array(4);function Vs(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=Ku[s];if(r===void 0&&(r=new Float32Array(s),Ku[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function ke(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Ve(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function dl(i,t){let e=Qu[t];e===void 0&&(e=new Int32Array(t),Qu[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Tg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Ag(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ke(e,t))return;i.uniform2fv(this.addr,t),Ve(e,t)}}function Rg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(ke(e,t))return;i.uniform3fv(this.addr,t),Ve(e,t)}}function Cg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ke(e,t))return;i.uniform4fv(this.addr,t),Ve(e,t)}}function Ig(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(ke(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Ve(e,t)}else{if(ke(e,n))return;ed.set(n),i.uniformMatrix2fv(this.addr,!1,ed),Ve(e,n)}}function Pg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(ke(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Ve(e,t)}else{if(ke(e,n))return;td.set(n),i.uniformMatrix3fv(this.addr,!1,td),Ve(e,n)}}function Lg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(ke(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Ve(e,t)}else{if(ke(e,n))return;ju.set(n),i.uniformMatrix4fv(this.addr,!1,ju),Ve(e,n)}}function Dg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Ug(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ke(e,t))return;i.uniform2iv(this.addr,t),Ve(e,t)}}function Ng(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ke(e,t))return;i.uniform3iv(this.addr,t),Ve(e,t)}}function Fg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ke(e,t))return;i.uniform4iv(this.addr,t),Ve(e,t)}}function Bg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function Og(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ke(e,t))return;i.uniform2uiv(this.addr,t),Ve(e,t)}}function zg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ke(e,t))return;i.uniform3uiv(this.addr,t),Ve(e,t)}}function Hg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ke(e,t))return;i.uniform4uiv(this.addr,t),Ve(e,t)}}function Gg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Zc.compareFunction=e.isReversedDepthBuffer()?al:rl,r=Zc):r=gd,e.setTexture2D(t||r,s)}function kg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||_d,s)}function Vg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||yd,s)}function Wg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||xd,s)}function Xg(i){switch(i){case 5126:return Tg;case 35664:return Ag;case 35665:return Rg;case 35666:return Cg;case 35674:return Ig;case 35675:return Pg;case 35676:return Lg;case 5124:case 35670:return Dg;case 35667:case 35671:return Ug;case 35668:case 35672:return Ng;case 35669:case 35673:return Fg;case 5125:return Bg;case 36294:return Og;case 36295:return zg;case 36296:return Hg;case 35678:case 36198:case 36298:case 36306:case 35682:return Gg;case 35679:case 36299:case 36307:return kg;case 35680:case 36300:case 36308:case 36293:return Vg;case 36289:case 36303:case 36311:case 36292:return Wg}}function qg(i,t){i.uniform1fv(this.addr,t)}function Yg(i,t){let e=Vs(t,this.size,2);i.uniform2fv(this.addr,e)}function Zg(i,t){let e=Vs(t,this.size,3);i.uniform3fv(this.addr,e)}function $g(i,t){let e=Vs(t,this.size,4);i.uniform4fv(this.addr,e)}function Jg(i,t){let e=Vs(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function Kg(i,t){let e=Vs(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function Qg(i,t){let e=Vs(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function jg(i,t){i.uniform1iv(this.addr,t)}function tx(i,t){i.uniform2iv(this.addr,t)}function ex(i,t){i.uniform3iv(this.addr,t)}function nx(i,t){i.uniform4iv(this.addr,t)}function ix(i,t){i.uniform1uiv(this.addr,t)}function sx(i,t){i.uniform2uiv(this.addr,t)}function rx(i,t){i.uniform3uiv(this.addr,t)}function ax(i,t){i.uniform4uiv(this.addr,t)}function ox(i,t,e){let n=this.cache,s=t.length,r=dl(e,s);ke(n,r)||(i.uniform1iv(this.addr,r),Ve(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Zc:a=gd;for(let o=0;o!==s;++o)e.setTexture2D(t[o]||a,r[o])}function lx(i,t,e){let n=this.cache,s=t.length,r=dl(e,s);ke(n,r)||(i.uniform1iv(this.addr,r),Ve(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||_d,r[a])}function cx(i,t,e){let n=this.cache,s=t.length,r=dl(e,s);ke(n,r)||(i.uniform1iv(this.addr,r),Ve(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||yd,r[a])}function hx(i,t,e){let n=this.cache,s=t.length,r=dl(e,s);ke(n,r)||(i.uniform1iv(this.addr,r),Ve(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||xd,r[a])}function ux(i){switch(i){case 5126:return qg;case 35664:return Yg;case 35665:return Zg;case 35666:return $g;case 35674:return Jg;case 35675:return Kg;case 35676:return Qg;case 5124:case 35670:return jg;case 35667:case 35671:return tx;case 35668:case 35672:return ex;case 35669:case 35673:return nx;case 5125:return ix;case 36294:return sx;case 36295:return rx;case 36296:return ax;case 35678:case 36198:case 36298:case 36306:case 35682:return ox;case 35679:case 36299:case 36307:return lx;case 35680:case 36300:case 36308:case 36293:return cx;case 36289:case 36303:case 36311:case 36292:return hx}}var $c=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Xg(e.type)}},Jc=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=ux(e.type)}},Kc=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(t,e[o.id],n)}}},qc=/(\w+)(\])?(\[|\.)?/g;function nd(i,t){i.seq.push(t),i.map[t.id]=t}function dx(i,t,e){let n=i.name,s=n.length;for(qc.lastIndex=0;;){let r=qc.exec(n),a=qc.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){nd(e,c===void 0?new $c(o,i,t):new Jc(o,i,t));break}else{let d=e.map[o];d===void 0&&(d=new Kc(o),nd(e,d)),e=d}}}var Gs=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=t.getActiveUniform(e,a),l=t.getUniformLocation(e,o.name);dx(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){let o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];a.id in e&&n.push(a)}return n}};function id(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var fx=37297,px=0;function mx(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}var sd=new Qt;function gx(i){he._getMatrix(sd,he.workingColorSpace,i);let t=`mat3( ${sd.elements.map(e=>e.toFixed(4))} )`;switch(he.getTransfer(i)){case or:return[t,"LinearTransferOETF"];case de:return[t,"sRGBTransferOETF"];default:return Zt("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function rd(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+mx(i.getShaderSource(t),o)}else return r}function xx(i,t){let e=gx(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var _x={[Sc]:"Linear",[bc]:"Reinhard",[Ec]:"Cineon",[Fr]:"ACESFilmic",[Tc]:"AgX",[Ac]:"Neutral",[wc]:"Custom"};function yx(i,t){let e=_x[t];return e===void 0?(Zt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var ll=new L;function vx(){he.getLuminanceCoefficients(ll);let i=ll.x.toFixed(4),t=ll.y.toFixed(4),e=ll.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Mx(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Zr).join(`
`)}function Sx(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function bx(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function Zr(i){return i!==""}function ad(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function od(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Ex=/^[ \t]*#include +<([\w\d./]+)>/gm;function Qc(i){return i.replace(Ex,Tx)}var wx=new Map;function Tx(i,t){let e=re[t];if(e===void 0){let n=wx.get(t);if(n!==void 0)e=re[n],Zt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Qc(e)}var Ax=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ld(i){return i.replace(Ax,Rx)}function Rx(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function cd(i){let t=`precision ${i.precision} float;
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
#define LOW_PRECISION`),t}var Cx={[Ur]:"SHADOWMAP_TYPE_PCF",[Fs]:"SHADOWMAP_TYPE_VSM"};function Ix(i){return Cx[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Px={[Bi]:"ENVMAP_TYPE_CUBE",[ts]:"ENVMAP_TYPE_CUBE",[Br]:"ENVMAP_TYPE_CUBE_UV"};function Lx(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":Px[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var Dx={[ts]:"ENVMAP_MODE_REFRACTION"};function Ux(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":Dx[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Nx={[_o]:"ENVMAP_BLENDING_MULTIPLY",[Eu]:"ENVMAP_BLENDING_MIX",[wu]:"ENVMAP_BLENDING_ADD"};function Fx(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":Nx[i.combine]||"ENVMAP_BLENDING_NONE"}function Bx(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function Ox(i,t,e,n){let s=i.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,l=Ix(e),c=Lx(e),h=Ux(e),d=Fx(e),u=Bx(e),f=Mx(e),m=Sx(r),v=s.createProgram(),p,g,M=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(Zr).join(`
`),p.length>0&&(p+=`
`),g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(Zr).join(`
`),g.length>0&&(g+=`
`)):(p=[cd(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Zr).join(`
`),g=[cd(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==zn?"#define TONE_MAPPING":"",e.toneMapping!==zn?re.tonemapping_pars_fragment:"",e.toneMapping!==zn?yx("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",re.colorspace_pars_fragment,xx("linearToOutputTexel",e.outputColorSpace),vx(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Zr).join(`
`)),a=Qc(a),a=ad(a,e),a=od(a,e),o=Qc(o),o=ad(o,e),o=od(o,e),a=ld(a),o=ld(o),e.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,p=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,g=["#define varying in",e.glslVersion===Nc?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Nc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);let E=M+p+a,_=M+g+o,A=id(s,s.VERTEX_SHADER,E),S=id(s,s.FRAGMENT_SHADER,_);s.attachShader(v,A),s.attachShader(v,S),e.index0AttributeName!==void 0?s.bindAttribLocation(v,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function w(I){if(i.debug.checkShaderErrors){let P=s.getProgramInfoLog(v)||"",N=s.getShaderInfoLog(A)||"",O=s.getShaderInfoLog(S)||"",D=P.trim(),k=N.trim(),F=O.trim(),H=!0,Y=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(H=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,A,S);else{let J=rd(s,A,"vertex"),$=rd(s,S,"fragment");Jt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+D+`
`+J+`
`+$)}else D!==""?Zt("WebGLProgram: Program Info Log:",D):(k===""||F==="")&&(Y=!1);Y&&(I.diagnostics={runnable:H,programLog:D,vertexShader:{log:k,prefix:p},fragmentShader:{log:F,prefix:g}})}s.deleteShader(A),s.deleteShader(S),x=new Gs(s,v),b=bx(s,v)}let x;this.getUniforms=function(){return x===void 0&&w(this),x};let b;this.getAttributes=function(){return b===void 0&&w(this),b};let R=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=s.getProgramParameter(v,fx)),R},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=px++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=A,this.fragmentShader=S,this}var zx=0,jc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new th(t),e.set(t,n)),n}},th=class{constructor(t){this.id=zx++,this.code=t,this.usedTimes=0}};function Hx(i){return i===zi||i===Vr||i===Wr}function Gx(i,t,e,n,s,r){let a=new hr,o=new jc,l=new Set,c=[],h=new Map,d=n.logarithmicDepthBuffer,u=n.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(x){return l.add(x),x===0?"uv":`uv${x}`}function v(x,b,R,I,P,N){let O=I.fog,D=P.geometry,k=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?I.environment:null,F=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,H=t.get(x.envMap||k,F),Y=H&&H.mapping===Br?H.image.height:null,J=f[x.type];x.precision!==null&&(u=n.getMaxPrecision(x.precision),u!==x.precision&&Zt("WebGLProgram.getParameters:",x.precision,"not supported, using",u,"instead."));let $=D.morphAttributes.position||D.morphAttributes.normal||D.morphAttributes.color,it=$!==void 0?$.length:0,st=0;D.morphAttributes.position!==void 0&&(st=1),D.morphAttributes.normal!==void 0&&(st=2),D.morphAttributes.color!==void 0&&(st=3);let Tt,vt,q,rt;if(J){let Ft=ni[J];Tt=Ft.vertexShader,vt=Ft.fragmentShader}else{Tt=x.vertexShader,vt=x.fragmentShader;let Ft=o.getVertexShaderStage(x),Pe=o.getFragmentShaderStage(x);o.update(x,Ft,Pe),q=Ft.id,rt=Pe.id}let et=i.getRenderTarget(),ht=i.state.buffers.depth.getReversed(),Ot=P.isInstancedMesh===!0,Nt=P.isBatchedMesh===!0,ae=!!x.map,It=!!x.matcap,j=!!H,ct=!!x.aoMap,lt=!!x.lightMap,Et=!!x.bumpMap&&x.wireframe===!1,Mt=!!x.normalMap,Yt=!!x.displacementMap,Ht=!!x.emissiveMap,Kt=!!x.metalnessMap,te=!!x.roughnessMap,U=x.anisotropy>0,pe=x.clearcoat>0,le=x.dispersion>0,C=x.iridescence>0,y=x.sheen>0,G=x.transmission>0,X=U&&!!x.anisotropyMap,K=pe&&!!x.clearcoatMap,dt=pe&&!!x.clearcoatNormalMap,mt=pe&&!!x.clearcoatRoughnessMap,Q=C&&!!x.iridescenceMap,nt=C&&!!x.iridescenceThicknessMap,xt=y&&!!x.sheenColorMap,Gt=y&&!!x.sheenRoughnessMap,St=!!x.specularMap,_t=!!x.specularColorMap,Xt=!!x.specularIntensityMap,$t=G&&!!x.transmissionMap,ee=G&&!!x.thicknessMap,B=!!x.gradientMap,gt=!!x.alphaMap,tt=x.alphaTest>0,yt=!!x.alphaHash,Rt=!!x.extensions,at=zn;x.toneMapped&&(et===null||et.isXRRenderTarget===!0)&&(at=i.toneMapping);let zt={shaderID:J,shaderType:x.type,shaderName:x.name,vertexShader:Tt,fragmentShader:vt,defines:x.defines,customVertexShaderID:q,customFragmentShaderID:rt,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:u,batching:Nt,batchingColor:Nt&&P._colorsTexture!==null,instancing:Ot,instancingColor:Ot&&P.instanceColor!==null,instancingMorph:Ot&&P.morphTexture!==null,outputColorSpace:et===null?i.outputColorSpace:et.isXRRenderTarget===!0?et.texture.colorSpace:he.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:ae,matcap:It,envMap:j,envMapMode:j&&H.mapping,envMapCubeUVHeight:Y,aoMap:ct,lightMap:lt,bumpMap:Et,normalMap:Mt,displacementMap:Yt,emissiveMap:Ht,normalMapObjectSpace:Mt&&x.normalMapType===Ru,normalMapTangentSpace:Mt&&x.normalMapType===Xr,packedNormalMap:Mt&&x.normalMapType===Xr&&Hx(x.normalMap.format),metalnessMap:Kt,roughnessMap:te,anisotropy:U,anisotropyMap:X,clearcoat:pe,clearcoatMap:K,clearcoatNormalMap:dt,clearcoatRoughnessMap:mt,dispersion:le,iridescence:C,iridescenceMap:Q,iridescenceThicknessMap:nt,sheen:y,sheenColorMap:xt,sheenRoughnessMap:Gt,specularMap:St,specularColorMap:_t,specularIntensityMap:Xt,transmission:G,transmissionMap:$t,thicknessMap:ee,gradientMap:B,opaque:x.transparent===!1&&x.blending===Ki&&x.alphaToCoverage===!1,alphaMap:gt,alphaTest:tt,alphaHash:yt,combine:x.combine,mapUv:ae&&m(x.map.channel),aoMapUv:ct&&m(x.aoMap.channel),lightMapUv:lt&&m(x.lightMap.channel),bumpMapUv:Et&&m(x.bumpMap.channel),normalMapUv:Mt&&m(x.normalMap.channel),displacementMapUv:Yt&&m(x.displacementMap.channel),emissiveMapUv:Ht&&m(x.emissiveMap.channel),metalnessMapUv:Kt&&m(x.metalnessMap.channel),roughnessMapUv:te&&m(x.roughnessMap.channel),anisotropyMapUv:X&&m(x.anisotropyMap.channel),clearcoatMapUv:K&&m(x.clearcoatMap.channel),clearcoatNormalMapUv:dt&&m(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:mt&&m(x.clearcoatRoughnessMap.channel),iridescenceMapUv:Q&&m(x.iridescenceMap.channel),iridescenceThicknessMapUv:nt&&m(x.iridescenceThicknessMap.channel),sheenColorMapUv:xt&&m(x.sheenColorMap.channel),sheenRoughnessMapUv:Gt&&m(x.sheenRoughnessMap.channel),specularMapUv:St&&m(x.specularMap.channel),specularColorMapUv:_t&&m(x.specularColorMap.channel),specularIntensityMapUv:Xt&&m(x.specularIntensityMap.channel),transmissionMapUv:$t&&m(x.transmissionMap.channel),thicknessMapUv:ee&&m(x.thicknessMap.channel),alphaMapUv:gt&&m(x.alphaMap.channel),vertexTangents:!!D.attributes.tangent&&(Mt||U),vertexNormals:!!D.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!D.attributes.color&&D.attributes.color.itemSize===4,pointsUvs:P.isPoints===!0&&!!D.attributes.uv&&(ae||gt),fog:!!O,useFog:x.fog===!0,fogExp2:!!O&&O.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||D.attributes.normal===void 0&&Mt===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:ht,skinning:P.isSkinnedMesh===!0,hasPositionAttribute:D.attributes.position!==void 0,morphTargets:D.morphAttributes.position!==void 0,morphNormals:D.morphAttributes.normal!==void 0,morphColors:D.morphAttributes.color!==void 0,morphTargetsCount:it,morphTextureStride:st,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numLightProbeGrids:N.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&R.length>0,shadowMapType:i.shadowMap.type,toneMapping:at,decodeVideoTexture:ae&&x.map.isVideoTexture===!0&&he.getTransfer(x.map.colorSpace)===de,decodeVideoTextureEmissive:Ht&&x.emissiveMap.isVideoTexture===!0&&he.getTransfer(x.emissiveMap.colorSpace)===de,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Ce,flipSided:x.side===Je,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:Rt&&x.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Rt&&x.extensions.multiDraw===!0||Nt)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return zt.vertexUv1s=l.has(1),zt.vertexUv2s=l.has(2),zt.vertexUv3s=l.has(3),l.clear(),zt}function p(x){let b=[];if(x.shaderID?b.push(x.shaderID):(b.push(x.customVertexShaderID),b.push(x.customFragmentShaderID)),x.defines!==void 0)for(let R in x.defines)b.push(R),b.push(x.defines[R]);return x.isRawShaderMaterial===!1&&(g(b,x),M(b,x),b.push(i.outputColorSpace)),b.push(x.customProgramCacheKey),b.join()}function g(x,b){x.push(b.precision),x.push(b.outputColorSpace),x.push(b.envMapMode),x.push(b.envMapCubeUVHeight),x.push(b.mapUv),x.push(b.alphaMapUv),x.push(b.lightMapUv),x.push(b.aoMapUv),x.push(b.bumpMapUv),x.push(b.normalMapUv),x.push(b.displacementMapUv),x.push(b.emissiveMapUv),x.push(b.metalnessMapUv),x.push(b.roughnessMapUv),x.push(b.anisotropyMapUv),x.push(b.clearcoatMapUv),x.push(b.clearcoatNormalMapUv),x.push(b.clearcoatRoughnessMapUv),x.push(b.iridescenceMapUv),x.push(b.iridescenceThicknessMapUv),x.push(b.sheenColorMapUv),x.push(b.sheenRoughnessMapUv),x.push(b.specularMapUv),x.push(b.specularColorMapUv),x.push(b.specularIntensityMapUv),x.push(b.transmissionMapUv),x.push(b.thicknessMapUv),x.push(b.combine),x.push(b.fogExp2),x.push(b.sizeAttenuation),x.push(b.morphTargetsCount),x.push(b.morphAttributeCount),x.push(b.numDirLights),x.push(b.numPointLights),x.push(b.numSpotLights),x.push(b.numSpotLightMaps),x.push(b.numHemiLights),x.push(b.numRectAreaLights),x.push(b.numDirLightShadows),x.push(b.numPointLightShadows),x.push(b.numSpotLightShadows),x.push(b.numSpotLightShadowsWithMaps),x.push(b.numLightProbes),x.push(b.shadowMapType),x.push(b.toneMapping),x.push(b.numClippingPlanes),x.push(b.numClipIntersection),x.push(b.depthPacking)}function M(x,b){a.disableAll(),b.instancing&&a.enable(0),b.instancingColor&&a.enable(1),b.instancingMorph&&a.enable(2),b.matcap&&a.enable(3),b.envMap&&a.enable(4),b.normalMapObjectSpace&&a.enable(5),b.normalMapTangentSpace&&a.enable(6),b.clearcoat&&a.enable(7),b.iridescence&&a.enable(8),b.alphaTest&&a.enable(9),b.vertexColors&&a.enable(10),b.vertexAlphas&&a.enable(11),b.vertexUv1s&&a.enable(12),b.vertexUv2s&&a.enable(13),b.vertexUv3s&&a.enable(14),b.vertexTangents&&a.enable(15),b.anisotropy&&a.enable(16),b.alphaHash&&a.enable(17),b.batching&&a.enable(18),b.dispersion&&a.enable(19),b.batchingColor&&a.enable(20),b.gradientMap&&a.enable(21),b.packedNormalMap&&a.enable(22),b.vertexNormals&&a.enable(23),x.push(a.mask),a.disableAll(),b.fog&&a.enable(0),b.useFog&&a.enable(1),b.flatShading&&a.enable(2),b.logarithmicDepthBuffer&&a.enable(3),b.reversedDepthBuffer&&a.enable(4),b.skinning&&a.enable(5),b.morphTargets&&a.enable(6),b.morphNormals&&a.enable(7),b.morphColors&&a.enable(8),b.premultipliedAlpha&&a.enable(9),b.shadowMapEnabled&&a.enable(10),b.doubleSided&&a.enable(11),b.flipSided&&a.enable(12),b.useDepthPacking&&a.enable(13),b.dithering&&a.enable(14),b.transmission&&a.enable(15),b.sheen&&a.enable(16),b.opaque&&a.enable(17),b.pointsUvs&&a.enable(18),b.decodeVideoTexture&&a.enable(19),b.decodeVideoTextureEmissive&&a.enable(20),b.alphaToCoverage&&a.enable(21),b.numLightProbeGrids>0&&a.enable(22),b.hasPositionAttribute&&a.enable(23),x.push(a.mask)}function E(x){let b=f[x.type],R;if(b){let I=ni[b];R=Wu.clone(I.uniforms)}else R=x.uniforms;return R}function _(x,b){let R=h.get(b);return R!==void 0?++R.usedTimes:(R=new Ox(i,b,x,s),c.push(R),h.set(b,R)),R}function A(x){if(--x.usedTimes===0){let b=c.indexOf(x);c[b]=c[c.length-1],c.pop(),h.delete(x.cacheKey),x.destroy()}}function S(x){o.remove(x)}function w(){o.dispose()}return{getParameters:v,getProgramCacheKey:p,getUniforms:E,acquireProgram:_,releaseProgram:A,releaseShaderCache:S,programs:c,dispose:w}}function kx(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function Vx(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function hd(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function ud(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(u){let f=0;return u.isInstancedMesh&&(f+=2),u.isSkinnedMesh&&(f+=1),f}function o(u,f,m,v,p,g){let M=i[t];return M===void 0?(M={id:u.id,object:u,geometry:f,material:m,materialVariant:a(u),groupOrder:v,renderOrder:u.renderOrder,z:p,group:g},i[t]=M):(M.id=u.id,M.object=u,M.geometry=f,M.material=m,M.materialVariant=a(u),M.groupOrder=v,M.renderOrder=u.renderOrder,M.z=p,M.group=g),t++,M}function l(u,f,m,v,p,g){let M=o(u,f,m,v,p,g);m.transmission>0?n.push(M):m.transparent===!0?s.push(M):e.push(M)}function c(u,f,m,v,p,g){let M=o(u,f,m,v,p,g);m.transmission>0?n.unshift(M):m.transparent===!0?s.unshift(M):e.unshift(M)}function h(u,f,m){e.length>1&&e.sort(u||Vx),n.length>1&&n.sort(f||hd),s.length>1&&s.sort(f||hd),m&&(e.reverse(),n.reverse(),s.reverse())}function d(){for(let u=t,f=i.length;u<f;u++){let m=i[u];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:d,sort:h}}function Wx(){let i=new WeakMap;function t(n,s){let r=i.get(n),a;return r===void 0?(a=new ud,i.set(n,[a])):s>=r.length?(a=new ud,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function Xx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new L,color:new Vt};break;case"SpotLight":e={position:new L,direction:new L,color:new Vt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new L,color:new Vt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new L,skyColor:new Vt,groundColor:new Vt};break;case"RectAreaLight":e={color:new Vt,position:new L,halfWidth:new L,halfHeight:new L};break}return i[t.id]=e,e}}}function qx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var Yx=0;function Zx(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function $x(i){let t=new Xx,e=qx(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new L);let s=new L,r=new ie,a=new ie;function o(c){let h=0,d=0,u=0;for(let b=0;b<9;b++)n.probe[b].set(0,0,0);let f=0,m=0,v=0,p=0,g=0,M=0,E=0,_=0,A=0,S=0,w=0;c.sort(Zx);for(let b=0,R=c.length;b<R;b++){let I=c[b],P=I.color,N=I.intensity,O=I.distance,D=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===zi?D=I.shadow.map.texture:D=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)h+=P.r*N,d+=P.g*N,u+=P.b*N;else if(I.isLightProbe){for(let k=0;k<9;k++)n.probe[k].addScaledVector(I.sh.coefficients[k],N);w++}else if(I.isDirectionalLight){let k=t.get(I);if(k.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let F=I.shadow,H=e.get(I);H.shadowIntensity=F.intensity,H.shadowBias=F.bias,H.shadowNormalBias=F.normalBias,H.shadowRadius=F.radius,H.shadowMapSize=F.mapSize,n.directionalShadow[f]=H,n.directionalShadowMap[f]=D,n.directionalShadowMatrix[f]=I.shadow.matrix,M++}n.directional[f]=k,f++}else if(I.isSpotLight){let k=t.get(I);k.position.setFromMatrixPosition(I.matrixWorld),k.color.copy(P).multiplyScalar(N),k.distance=O,k.coneCos=Math.cos(I.angle),k.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),k.decay=I.decay,n.spot[v]=k;let F=I.shadow;if(I.map&&(n.spotLightMap[A]=I.map,A++,F.updateMatrices(I),I.castShadow&&S++),n.spotLightMatrix[v]=F.matrix,I.castShadow){let H=e.get(I);H.shadowIntensity=F.intensity,H.shadowBias=F.bias,H.shadowNormalBias=F.normalBias,H.shadowRadius=F.radius,H.shadowMapSize=F.mapSize,n.spotShadow[v]=H,n.spotShadowMap[v]=D,_++}v++}else if(I.isRectAreaLight){let k=t.get(I);k.color.copy(P).multiplyScalar(N),k.halfWidth.set(I.width*.5,0,0),k.halfHeight.set(0,I.height*.5,0),n.rectArea[p]=k,p++}else if(I.isPointLight){let k=t.get(I);if(k.color.copy(I.color).multiplyScalar(I.intensity),k.distance=I.distance,k.decay=I.decay,I.castShadow){let F=I.shadow,H=e.get(I);H.shadowIntensity=F.intensity,H.shadowBias=F.bias,H.shadowNormalBias=F.normalBias,H.shadowRadius=F.radius,H.shadowMapSize=F.mapSize,H.shadowCameraNear=F.camera.near,H.shadowCameraFar=F.camera.far,n.pointShadow[m]=H,n.pointShadowMap[m]=D,n.pointShadowMatrix[m]=I.shadow.matrix,E++}n.point[m]=k,m++}else if(I.isHemisphereLight){let k=t.get(I);k.skyColor.copy(I.color).multiplyScalar(N),k.groundColor.copy(I.groundColor).multiplyScalar(N),n.hemi[g]=k,g++}}p>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=bt.LTC_FLOAT_1,n.rectAreaLTC2=bt.LTC_FLOAT_2):(n.rectAreaLTC1=bt.LTC_HALF_1,n.rectAreaLTC2=bt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=d,n.ambient[2]=u;let x=n.hash;(x.directionalLength!==f||x.pointLength!==m||x.spotLength!==v||x.rectAreaLength!==p||x.hemiLength!==g||x.numDirectionalShadows!==M||x.numPointShadows!==E||x.numSpotShadows!==_||x.numSpotMaps!==A||x.numLightProbes!==w)&&(n.directional.length=f,n.spot.length=v,n.rectArea.length=p,n.point.length=m,n.hemi.length=g,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.pointShadow.length=E,n.pointShadowMap.length=E,n.spotShadow.length=_,n.spotShadowMap.length=_,n.directionalShadowMatrix.length=M,n.pointShadowMatrix.length=E,n.spotLightMatrix.length=_+A-S,n.spotLightMap.length=A,n.numSpotLightShadowsWithMaps=S,n.numLightProbes=w,x.directionalLength=f,x.pointLength=m,x.spotLength=v,x.rectAreaLength=p,x.hemiLength=g,x.numDirectionalShadows=M,x.numPointShadows=E,x.numSpotShadows=_,x.numSpotMaps=A,x.numLightProbes=w,n.version=Yx++)}function l(c,h){let d=0,u=0,f=0,m=0,v=0,p=h.matrixWorldInverse;for(let g=0,M=c.length;g<M;g++){let E=c[g];if(E.isDirectionalLight){let _=n.directional[d];_.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),_.direction.sub(s),_.direction.transformDirection(p),d++}else if(E.isSpotLight){let _=n.spot[f];_.position.setFromMatrixPosition(E.matrixWorld),_.position.applyMatrix4(p),_.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),_.direction.sub(s),_.direction.transformDirection(p),f++}else if(E.isRectAreaLight){let _=n.rectArea[m];_.position.setFromMatrixPosition(E.matrixWorld),_.position.applyMatrix4(p),a.identity(),r.copy(E.matrixWorld),r.premultiply(p),a.extractRotation(r),_.halfWidth.set(E.width*.5,0,0),_.halfHeight.set(0,E.height*.5,0),_.halfWidth.applyMatrix4(a),_.halfHeight.applyMatrix4(a),m++}else if(E.isPointLight){let _=n.point[u];_.position.setFromMatrixPosition(E.matrixWorld),_.position.applyMatrix4(p),u++}else if(E.isHemisphereLight){let _=n.hemi[v];_.direction.setFromMatrixPosition(E.matrixWorld),_.direction.transformDirection(p),v++}}}return{setup:o,setupView:l,state:n}}function dd(i){let t=new $x(i),e=[],n=[],s=[];function r(u){d.camera=u,e.length=0,n.length=0,s.length=0}function a(u){e.push(u)}function o(u){n.push(u)}function l(u){s.push(u)}function c(){t.setup(e)}function h(u){t.setupView(e,u)}let d={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:c,setupLightsView:h,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function Jx(i){let t=new WeakMap;function e(s,r=0){let a=t.get(s),o;return a===void 0?(o=new dd(i),t.set(s,[o])):r>=a.length?(o=new dd(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}var Kx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Qx=`uniform sampler2D shadow_pass;
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
}`,jx=[new L(1,0,0),new L(-1,0,0),new L(0,1,0),new L(0,-1,0),new L(0,0,1),new L(0,0,-1)],t_=[new L(0,-1,0),new L(0,-1,0),new L(0,0,1),new L(0,0,-1),new L(0,-1,0),new L(0,-1,0)],fd=new ie,Yr=new L,Yc=new L;function e_(i,t,e){let n=new Is,s=new pt,r=new pt,a=new we,o=new io,l=new so,c={},h=e.maxTextureSize,d={[fi]:Je,[Je]:fi,[Ce]:Ce},u=new ln({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new pt},radius:{value:4}},vertexShader:Kx,fragmentShader:Qx}),f=u.clone();f.defines.HORIZONTAL_PASS=1;let m=new Be;m.setAttribute("position",new fn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new ft(m,u),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ur;let g=this.type;this.render=function(S,w,x){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||S.length===0)return;this.type===xo&&(Zt("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Ur);let b=i.getRenderTarget(),R=i.getActiveCubeFace(),I=i.getActiveMipmapLevel(),P=i.state;P.setBlending(Qn),P.buffers.depth.getReversed()===!0?P.buffers.color.setClear(0,0,0,0):P.buffers.color.setClear(1,1,1,1),P.buffers.depth.setTest(!0),P.setScissorTest(!1);let N=g!==this.type;N&&w.traverse(function(O){O.material&&(Array.isArray(O.material)?O.material.forEach(D=>D.needsUpdate=!0):O.material.needsUpdate=!0)});for(let O=0,D=S.length;O<D;O++){let k=S[O],F=k.shadow;if(F===void 0){Zt("WebGLShadowMap:",k,"has no shadow.");continue}if(F.autoUpdate===!1&&F.needsUpdate===!1)continue;s.copy(F.mapSize);let H=F.getFrameExtents();s.multiply(H),r.copy(F.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/H.x),s.x=r.x*H.x,F.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/H.y),s.y=r.y*H.y,F.mapSize.y=r.y));let Y=i.state.buffers.depth.getReversed();if(F.camera._reversedDepth=Y,F.map===null||N===!0){if(F.map!==null&&(F.map.depthTexture!==null&&(F.map.depthTexture.dispose(),F.map.depthTexture=null),F.map.dispose()),this.type===Fs){if(k.isPointLight){Zt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}F.map=new yn(s.x,s.y,{format:zi,type:ti,minFilter:$e,magFilter:$e,generateMipmaps:!1}),F.map.texture.name=k.name+".shadowMap",F.map.depthTexture=new mi(s.x,s.y,Cn),F.map.depthTexture.name=k.name+".shadowMapDepth",F.map.depthTexture.format=$n,F.map.depthTexture.compareFunction=null,F.map.depthTexture.minFilter=Xe,F.map.depthTexture.magFilter=Xe}else k.isPointLight?(F.map=new ks(s.x),F.map.depthTexture=new Za(s.x,Hn)):(F.map=new yn(s.x,s.y),F.map.depthTexture=new mi(s.x,s.y,Hn)),F.map.depthTexture.name=k.name+".shadowMap",F.map.depthTexture.format=$n,this.type===Ur?(F.map.depthTexture.compareFunction=Y?al:rl,F.map.depthTexture.minFilter=$e,F.map.depthTexture.magFilter=$e):(F.map.depthTexture.compareFunction=null,F.map.depthTexture.minFilter=Xe,F.map.depthTexture.magFilter=Xe);F.camera.updateProjectionMatrix()}let J=F.map.isWebGLCubeRenderTarget?6:1;for(let $=0;$<J;$++){if(F.map.isWebGLCubeRenderTarget)i.setRenderTarget(F.map,$),i.clear();else{$===0&&(i.setRenderTarget(F.map),i.clear());let it=F.getViewport($);a.set(r.x*it.x,r.y*it.y,r.x*it.z,r.y*it.w),P.viewport(a)}if(k.isPointLight){let it=F.camera,st=F.matrix,Tt=k.distance||it.far;Tt!==it.far&&(it.far=Tt,it.updateProjectionMatrix()),Yr.setFromMatrixPosition(k.matrixWorld),it.position.copy(Yr),Yc.copy(it.position),Yc.add(jx[$]),it.up.copy(t_[$]),it.lookAt(Yc),it.updateMatrixWorld(),st.makeTranslation(-Yr.x,-Yr.y,-Yr.z),fd.multiplyMatrices(it.projectionMatrix,it.matrixWorldInverse),F._frustum.setFromProjectionMatrix(fd,it.coordinateSystem,it.reversedDepth)}else F.updateMatrices(k);n=F.getFrustum(),_(w,x,F.camera,k,this.type)}F.isPointLightShadow!==!0&&this.type===Fs&&M(F,x),F.needsUpdate=!1}g=this.type,p.needsUpdate=!1,i.setRenderTarget(b,R,I)};function M(S,w){let x=t.update(v);u.defines.VSM_SAMPLES!==S.blurSamples&&(u.defines.VSM_SAMPLES=S.blurSamples,f.defines.VSM_SAMPLES=S.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),S.mapPass===null&&(S.mapPass=new yn(s.x,s.y,{format:zi,type:ti})),u.uniforms.shadow_pass.value=S.map.depthTexture,u.uniforms.resolution.value=S.mapSize,u.uniforms.radius.value=S.radius,i.setRenderTarget(S.mapPass),i.clear(),i.renderBufferDirect(w,null,x,u,v,null),f.uniforms.shadow_pass.value=S.mapPass.texture,f.uniforms.resolution.value=S.mapSize,f.uniforms.radius.value=S.radius,i.setRenderTarget(S.map),i.clear(),i.renderBufferDirect(w,null,x,f,v,null)}function E(S,w,x,b){let R=null,I=x.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(I!==void 0)R=I;else if(R=x.isPointLight===!0?l:o,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){let P=R.uuid,N=w.uuid,O=c[P];O===void 0&&(O={},c[P]=O);let D=O[N];D===void 0&&(D=R.clone(),O[N]=D,w.addEventListener("dispose",A)),R=D}if(R.visible=w.visible,R.wireframe=w.wireframe,b===Fs?R.side=w.shadowSide!==null?w.shadowSide:w.side:R.side=w.shadowSide!==null?w.shadowSide:d[w.side],R.alphaMap=w.alphaMap,R.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,R.map=w.map,R.clipShadows=w.clipShadows,R.clippingPlanes=w.clippingPlanes,R.clipIntersection=w.clipIntersection,R.displacementMap=w.displacementMap,R.displacementScale=w.displacementScale,R.displacementBias=w.displacementBias,R.wireframeLinewidth=w.wireframeLinewidth,R.linewidth=w.linewidth,x.isPointLight===!0&&R.isMeshDistanceMaterial===!0){let P=i.properties.get(R);P.light=x}return R}function _(S,w,x,b,R){if(S.visible===!1)return;if(S.layers.test(w.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&R===Fs)&&(!S.frustumCulled||n.intersectsObject(S))){S.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,S.matrixWorld);let N=t.update(S),O=S.material;if(Array.isArray(O)){let D=N.groups;for(let k=0,F=D.length;k<F;k++){let H=D[k],Y=O[H.materialIndex];if(Y&&Y.visible){let J=E(S,Y,b,R);S.onBeforeShadow(i,S,w,x,N,J,H),i.renderBufferDirect(x,null,N,J,S,H),S.onAfterShadow(i,S,w,x,N,J,H)}}}else if(O.visible){let D=E(S,O,b,R);S.onBeforeShadow(i,S,w,x,N,D,null),i.renderBufferDirect(x,null,N,D,S,null),S.onAfterShadow(i,S,w,x,N,D,null)}}let P=S.children;for(let N=0,O=P.length;N<O;N++)_(P[N],w,x,b,R)}function A(S){S.target.removeEventListener("dispose",A);for(let x in c){let b=c[x],R=S.target.uuid;R in b&&(b[R].dispose(),delete b[R])}}}function n_(i,t){function e(){let B=!1,gt=new we,tt=null,yt=new we(0,0,0,0);return{setMask:function(Rt){tt!==Rt&&!B&&(i.colorMask(Rt,Rt,Rt,Rt),tt=Rt)},setLocked:function(Rt){B=Rt},setClear:function(Rt,at,zt,Ft,Pe){Pe===!0&&(Rt*=Ft,at*=Ft,zt*=Ft),gt.set(Rt,at,zt,Ft),yt.equals(gt)===!1&&(i.clearColor(Rt,at,zt,Ft),yt.copy(gt))},reset:function(){B=!1,tt=null,yt.set(-1,0,0,0)}}}function n(){let B=!1,gt=!1,tt=null,yt=null,Rt=null;return{setReversed:function(at){if(gt!==at){let zt=t.get("EXT_clip_control");at?zt.clipControlEXT(zt.LOWER_LEFT_EXT,zt.ZERO_TO_ONE_EXT):zt.clipControlEXT(zt.LOWER_LEFT_EXT,zt.NEGATIVE_ONE_TO_ONE_EXT),gt=at;let Ft=Rt;Rt=null,this.setClear(Ft)}},getReversed:function(){return gt},setTest:function(at){at?et(i.DEPTH_TEST):ht(i.DEPTH_TEST)},setMask:function(at){tt!==at&&!B&&(i.depthMask(at),tt=at)},setFunc:function(at){if(gt&&(at=Ou[at]),yt!==at){switch(at){case Ua:i.depthFunc(i.NEVER);break;case Na:i.depthFunc(i.ALWAYS);break;case Fa:i.depthFunc(i.LESS);break;case Qi:i.depthFunc(i.LEQUAL);break;case Ba:i.depthFunc(i.EQUAL);break;case Oa:i.depthFunc(i.GEQUAL);break;case za:i.depthFunc(i.GREATER);break;case Ha:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}yt=at}},setLocked:function(at){B=at},setClear:function(at){Rt!==at&&(Rt=at,gt&&(at=1-at),i.clearDepth(at))},reset:function(){B=!1,tt=null,yt=null,Rt=null,gt=!1}}}function s(){let B=!1,gt=null,tt=null,yt=null,Rt=null,at=null,zt=null,Ft=null,Pe=null;return{setTest:function(ve){B||(ve?et(i.STENCIL_TEST):ht(i.STENCIL_TEST))},setMask:function(ve){gt!==ve&&!B&&(i.stencilMask(ve),gt=ve)},setFunc:function(ve,Vn,Wn){(tt!==ve||yt!==Vn||Rt!==Wn)&&(i.stencilFunc(ve,Vn,Wn),tt=ve,yt=Vn,Rt=Wn)},setOp:function(ve,Vn,Wn){(at!==ve||zt!==Vn||Ft!==Wn)&&(i.stencilOp(ve,Vn,Wn),at=ve,zt=Vn,Ft=Wn)},setLocked:function(ve){B=ve},setClear:function(ve){Pe!==ve&&(i.clearStencil(ve),Pe=ve)},reset:function(){B=!1,gt=null,tt=null,yt=null,Rt=null,at=null,zt=null,Ft=null,Pe=null}}}let r=new e,a=new n,o=new s,l=new WeakMap,c=new WeakMap,h={},d={},u={},f=new WeakMap,m=[],v=null,p=!1,g=null,M=null,E=null,_=null,A=null,S=null,w=null,x=new Vt(0,0,0),b=0,R=!1,I=null,P=null,N=null,O=null,D=null,k=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),F=!1,H=0,Y=i.getParameter(i.VERSION);Y.indexOf("WebGL")!==-1?(H=parseFloat(/^WebGL (\d)/.exec(Y)[1]),F=H>=1):Y.indexOf("OpenGL ES")!==-1&&(H=parseFloat(/^OpenGL ES (\d)/.exec(Y)[1]),F=H>=2);let J=null,$={},it=i.getParameter(i.SCISSOR_BOX),st=i.getParameter(i.VIEWPORT),Tt=new we().fromArray(it),vt=new we().fromArray(st);function q(B,gt,tt,yt){let Rt=new Uint8Array(4),at=i.createTexture();i.bindTexture(B,at),i.texParameteri(B,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(B,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let zt=0;zt<tt;zt++)B===i.TEXTURE_3D||B===i.TEXTURE_2D_ARRAY?i.texImage3D(gt,0,i.RGBA,1,1,yt,0,i.RGBA,i.UNSIGNED_BYTE,Rt):i.texImage2D(gt+zt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Rt);return at}let rt={};rt[i.TEXTURE_2D]=q(i.TEXTURE_2D,i.TEXTURE_2D,1),rt[i.TEXTURE_CUBE_MAP]=q(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),rt[i.TEXTURE_2D_ARRAY]=q(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),rt[i.TEXTURE_3D]=q(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),et(i.DEPTH_TEST),a.setFunc(Qi),Et(!1),Mt(yc),et(i.CULL_FACE),ct(Qn);function et(B){h[B]!==!0&&(i.enable(B),h[B]=!0)}function ht(B){h[B]!==!1&&(i.disable(B),h[B]=!1)}function Ot(B,gt){return u[B]!==gt?(i.bindFramebuffer(B,gt),u[B]=gt,B===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=gt),B===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=gt),!0):!1}function Nt(B,gt){let tt=m,yt=!1;if(B){tt=f.get(gt),tt===void 0&&(tt=[],f.set(gt,tt));let Rt=B.textures;if(tt.length!==Rt.length||tt[0]!==i.COLOR_ATTACHMENT0){for(let at=0,zt=Rt.length;at<zt;at++)tt[at]=i.COLOR_ATTACHMENT0+at;tt.length=Rt.length,yt=!0}}else tt[0]!==i.BACK&&(tt[0]=i.BACK,yt=!0);yt&&i.drawBuffers(tt)}function ae(B){return v!==B?(i.useProgram(B),v=B,!0):!1}let It={[Ii]:i.FUNC_ADD,[ou]:i.FUNC_SUBTRACT,[lu]:i.FUNC_REVERSE_SUBTRACT};It[cu]=i.MIN,It[hu]=i.MAX;let j={[uu]:i.ZERO,[du]:i.ONE,[fu]:i.SRC_COLOR,[La]:i.SRC_ALPHA,[yu]:i.SRC_ALPHA_SATURATE,[xu]:i.DST_COLOR,[mu]:i.DST_ALPHA,[pu]:i.ONE_MINUS_SRC_COLOR,[Da]:i.ONE_MINUS_SRC_ALPHA,[_u]:i.ONE_MINUS_DST_COLOR,[gu]:i.ONE_MINUS_DST_ALPHA,[vu]:i.CONSTANT_COLOR,[Mu]:i.ONE_MINUS_CONSTANT_COLOR,[Su]:i.CONSTANT_ALPHA,[bu]:i.ONE_MINUS_CONSTANT_ALPHA};function ct(B,gt,tt,yt,Rt,at,zt,Ft,Pe,ve){if(B===Qn){p===!0&&(ht(i.BLEND),p=!1);return}if(p===!1&&(et(i.BLEND),p=!0),B!==au){if(B!==g||ve!==R){if((M!==Ii||A!==Ii)&&(i.blendEquation(i.FUNC_ADD),M=Ii,A=Ii),ve)switch(B){case Ki:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case vc:i.blendFunc(i.ONE,i.ONE);break;case Mc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Nr:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Jt("WebGLState: Invalid blending: ",B);break}else switch(B){case Ki:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case vc:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Mc:Jt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Nr:Jt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Jt("WebGLState: Invalid blending: ",B);break}E=null,_=null,S=null,w=null,x.set(0,0,0),b=0,g=B,R=ve}return}Rt=Rt||gt,at=at||tt,zt=zt||yt,(gt!==M||Rt!==A)&&(i.blendEquationSeparate(It[gt],It[Rt]),M=gt,A=Rt),(tt!==E||yt!==_||at!==S||zt!==w)&&(i.blendFuncSeparate(j[tt],j[yt],j[at],j[zt]),E=tt,_=yt,S=at,w=zt),(Ft.equals(x)===!1||Pe!==b)&&(i.blendColor(Ft.r,Ft.g,Ft.b,Pe),x.copy(Ft),b=Pe),g=B,R=!1}function lt(B,gt){B.side===Ce?ht(i.CULL_FACE):et(i.CULL_FACE);let tt=B.side===Je;gt&&(tt=!tt),Et(tt),B.blending===Ki&&B.transparent===!1?ct(Qn):ct(B.blending,B.blendEquation,B.blendSrc,B.blendDst,B.blendEquationAlpha,B.blendSrcAlpha,B.blendDstAlpha,B.blendColor,B.blendAlpha,B.premultipliedAlpha),a.setFunc(B.depthFunc),a.setTest(B.depthTest),a.setMask(B.depthWrite),r.setMask(B.colorWrite);let yt=B.stencilWrite;o.setTest(yt),yt&&(o.setMask(B.stencilWriteMask),o.setFunc(B.stencilFunc,B.stencilRef,B.stencilFuncMask),o.setOp(B.stencilFail,B.stencilZFail,B.stencilZPass)),Ht(B.polygonOffset,B.polygonOffsetFactor,B.polygonOffsetUnits),B.alphaToCoverage===!0?et(i.SAMPLE_ALPHA_TO_COVERAGE):ht(i.SAMPLE_ALPHA_TO_COVERAGE)}function Et(B){I!==B&&(B?i.frontFace(i.CW):i.frontFace(i.CCW),I=B)}function Mt(B){B!==su?(et(i.CULL_FACE),B!==P&&(B===yc?i.cullFace(i.BACK):B===ru?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ht(i.CULL_FACE),P=B}function Yt(B){B!==N&&(F&&i.lineWidth(B),N=B)}function Ht(B,gt,tt){B?(et(i.POLYGON_OFFSET_FILL),(O!==gt||D!==tt)&&(O=gt,D=tt,a.getReversed()&&(gt=-gt),i.polygonOffset(gt,tt))):ht(i.POLYGON_OFFSET_FILL)}function Kt(B){B?et(i.SCISSOR_TEST):ht(i.SCISSOR_TEST)}function te(B){B===void 0&&(B=i.TEXTURE0+k-1),J!==B&&(i.activeTexture(B),J=B)}function U(B,gt,tt){tt===void 0&&(J===null?tt=i.TEXTURE0+k-1:tt=J);let yt=$[tt];yt===void 0&&(yt={type:void 0,texture:void 0},$[tt]=yt),(yt.type!==B||yt.texture!==gt)&&(J!==tt&&(i.activeTexture(tt),J=tt),i.bindTexture(B,gt||rt[B]),yt.type=B,yt.texture=gt)}function pe(){let B=$[J];B!==void 0&&B.type!==void 0&&(i.bindTexture(B.type,null),B.type=void 0,B.texture=void 0)}function le(){try{i.compressedTexImage2D(...arguments)}catch(B){Jt("WebGLState:",B)}}function C(){try{i.compressedTexImage3D(...arguments)}catch(B){Jt("WebGLState:",B)}}function y(){try{i.texSubImage2D(...arguments)}catch(B){Jt("WebGLState:",B)}}function G(){try{i.texSubImage3D(...arguments)}catch(B){Jt("WebGLState:",B)}}function X(){try{i.compressedTexSubImage2D(...arguments)}catch(B){Jt("WebGLState:",B)}}function K(){try{i.compressedTexSubImage3D(...arguments)}catch(B){Jt("WebGLState:",B)}}function dt(){try{i.texStorage2D(...arguments)}catch(B){Jt("WebGLState:",B)}}function mt(){try{i.texStorage3D(...arguments)}catch(B){Jt("WebGLState:",B)}}function Q(){try{i.texImage2D(...arguments)}catch(B){Jt("WebGLState:",B)}}function nt(){try{i.texImage3D(...arguments)}catch(B){Jt("WebGLState:",B)}}function xt(B){return d[B]!==void 0?d[B]:i.getParameter(B)}function Gt(B,gt){d[B]!==gt&&(i.pixelStorei(B,gt),d[B]=gt)}function St(B){Tt.equals(B)===!1&&(i.scissor(B.x,B.y,B.z,B.w),Tt.copy(B))}function _t(B){vt.equals(B)===!1&&(i.viewport(B.x,B.y,B.z,B.w),vt.copy(B))}function Xt(B,gt){let tt=c.get(gt);tt===void 0&&(tt=new WeakMap,c.set(gt,tt));let yt=tt.get(B);yt===void 0&&(yt=i.getUniformBlockIndex(gt,B.name),tt.set(B,yt))}function $t(B,gt){let yt=c.get(gt).get(B);l.get(gt)!==yt&&(i.uniformBlockBinding(gt,yt,B.__bindingPointIndex),l.set(gt,yt))}function ee(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},d={},J=null,$={},u={},f=new WeakMap,m=[],v=null,p=!1,g=null,M=null,E=null,_=null,A=null,S=null,w=null,x=new Vt(0,0,0),b=0,R=!1,I=null,P=null,N=null,O=null,D=null,Tt.set(0,0,i.canvas.width,i.canvas.height),vt.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:et,disable:ht,bindFramebuffer:Ot,drawBuffers:Nt,useProgram:ae,setBlending:ct,setMaterial:lt,setFlipSided:Et,setCullFace:Mt,setLineWidth:Yt,setPolygonOffset:Ht,setScissorTest:Kt,activeTexture:te,bindTexture:U,unbindTexture:pe,compressedTexImage2D:le,compressedTexImage3D:C,texImage2D:Q,texImage3D:nt,pixelStorei:Gt,getParameter:xt,updateUBOMapping:Xt,uniformBlockBinding:$t,texStorage2D:dt,texStorage3D:mt,texSubImage2D:y,texSubImage3D:G,compressedTexSubImage2D:X,compressedTexSubImage3D:K,scissor:St,viewport:_t,reset:ee}}function i_(i,t,e,n,s,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new pt,h=new WeakMap,d=new Set,u,f=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(C,y){return m?new OffscreenCanvas(C,y):lr("canvas")}function p(C,y,G){let X=1,K=le(C);if((K.width>G||K.height>G)&&(X=G/Math.max(K.width,K.height)),X<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let dt=Math.floor(X*K.width),mt=Math.floor(X*K.height);u===void 0&&(u=v(dt,mt));let Q=y?v(dt,mt):u;return Q.width=dt,Q.height=mt,Q.getContext("2d").drawImage(C,0,0,dt,mt),Zt("WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+dt+"x"+mt+")."),Q}else return"data"in C&&Zt("WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),C;return C}function g(C){return C.generateMipmaps}function M(C){i.generateMipmap(C)}function E(C){return C.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?i.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function _(C,y,G,X,K,dt=!1){if(C!==null){if(i[C]!==void 0)return i[C];Zt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let mt;X&&(mt=t.get("EXT_texture_norm16"),mt||Zt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Q=y;if(y===i.RED&&(G===i.FLOAT&&(Q=i.R32F),G===i.HALF_FLOAT&&(Q=i.R16F),G===i.UNSIGNED_BYTE&&(Q=i.R8),G===i.UNSIGNED_SHORT&&mt&&(Q=mt.R16_EXT),G===i.SHORT&&mt&&(Q=mt.R16_SNORM_EXT)),y===i.RED_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.R8UI),G===i.UNSIGNED_SHORT&&(Q=i.R16UI),G===i.UNSIGNED_INT&&(Q=i.R32UI),G===i.BYTE&&(Q=i.R8I),G===i.SHORT&&(Q=i.R16I),G===i.INT&&(Q=i.R32I)),y===i.RG&&(G===i.FLOAT&&(Q=i.RG32F),G===i.HALF_FLOAT&&(Q=i.RG16F),G===i.UNSIGNED_BYTE&&(Q=i.RG8),G===i.UNSIGNED_SHORT&&mt&&(Q=mt.RG16_EXT),G===i.SHORT&&mt&&(Q=mt.RG16_SNORM_EXT)),y===i.RG_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.RG8UI),G===i.UNSIGNED_SHORT&&(Q=i.RG16UI),G===i.UNSIGNED_INT&&(Q=i.RG32UI),G===i.BYTE&&(Q=i.RG8I),G===i.SHORT&&(Q=i.RG16I),G===i.INT&&(Q=i.RG32I)),y===i.RGB_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.RGB8UI),G===i.UNSIGNED_SHORT&&(Q=i.RGB16UI),G===i.UNSIGNED_INT&&(Q=i.RGB32UI),G===i.BYTE&&(Q=i.RGB8I),G===i.SHORT&&(Q=i.RGB16I),G===i.INT&&(Q=i.RGB32I)),y===i.RGBA_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.RGBA8UI),G===i.UNSIGNED_SHORT&&(Q=i.RGBA16UI),G===i.UNSIGNED_INT&&(Q=i.RGBA32UI),G===i.BYTE&&(Q=i.RGBA8I),G===i.SHORT&&(Q=i.RGBA16I),G===i.INT&&(Q=i.RGBA32I)),y===i.RGB&&(G===i.UNSIGNED_SHORT&&mt&&(Q=mt.RGB16_EXT),G===i.SHORT&&mt&&(Q=mt.RGB16_SNORM_EXT),G===i.UNSIGNED_INT_5_9_9_9_REV&&(Q=i.RGB9_E5),G===i.UNSIGNED_INT_10F_11F_11F_REV&&(Q=i.R11F_G11F_B10F)),y===i.RGBA){let nt=dt?or:he.getTransfer(K);G===i.FLOAT&&(Q=i.RGBA32F),G===i.HALF_FLOAT&&(Q=i.RGBA16F),G===i.UNSIGNED_BYTE&&(Q=nt===de?i.SRGB8_ALPHA8:i.RGBA8),G===i.UNSIGNED_SHORT&&mt&&(Q=mt.RGBA16_EXT),G===i.SHORT&&mt&&(Q=mt.RGBA16_SNORM_EXT),G===i.UNSIGNED_SHORT_4_4_4_4&&(Q=i.RGBA4),G===i.UNSIGNED_SHORT_5_5_5_1&&(Q=i.RGB5_A1)}return(Q===i.R16F||Q===i.R32F||Q===i.RG16F||Q===i.RG32F||Q===i.RGBA16F||Q===i.RGBA32F)&&t.get("EXT_color_buffer_float"),Q}function A(C,y){let G;return C?y===null||y===Hn||y===Os?G=i.DEPTH24_STENCIL8:y===Cn?G=i.DEPTH32F_STENCIL8:y===Bs&&(G=i.DEPTH24_STENCIL8,Zt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===Hn||y===Os?G=i.DEPTH_COMPONENT24:y===Cn?G=i.DEPTH_COMPONENT32F:y===Bs&&(G=i.DEPTH_COMPONENT16),G}function S(C,y){return g(C)===!0||C.isFramebufferTexture&&C.minFilter!==Xe&&C.minFilter!==$e?Math.log2(Math.max(y.width,y.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?y.mipmaps.length:1}function w(C){let y=C.target;y.removeEventListener("dispose",w),b(y),y.isVideoTexture&&h.delete(y),y.isHTMLTexture&&d.delete(y)}function x(C){let y=C.target;y.removeEventListener("dispose",x),I(y)}function b(C){let y=n.get(C);if(y.__webglInit===void 0)return;let G=C.source,X=f.get(G);if(X){let K=X[y.__cacheKey];K.usedTimes--,K.usedTimes===0&&R(C),Object.keys(X).length===0&&f.delete(G)}n.remove(C)}function R(C){let y=n.get(C);i.deleteTexture(y.__webglTexture);let G=C.source,X=f.get(G);delete X[y.__cacheKey],a.memory.textures--}function I(C){let y=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let X=0;X<6;X++){if(Array.isArray(y.__webglFramebuffer[X]))for(let K=0;K<y.__webglFramebuffer[X].length;K++)i.deleteFramebuffer(y.__webglFramebuffer[X][K]);else i.deleteFramebuffer(y.__webglFramebuffer[X]);y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer[X])}else{if(Array.isArray(y.__webglFramebuffer))for(let X=0;X<y.__webglFramebuffer.length;X++)i.deleteFramebuffer(y.__webglFramebuffer[X]);else i.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&i.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let X=0;X<y.__webglColorRenderbuffer.length;X++)y.__webglColorRenderbuffer[X]&&i.deleteRenderbuffer(y.__webglColorRenderbuffer[X]);y.__webglDepthRenderbuffer&&i.deleteRenderbuffer(y.__webglDepthRenderbuffer)}let G=C.textures;for(let X=0,K=G.length;X<K;X++){let dt=n.get(G[X]);dt.__webglTexture&&(i.deleteTexture(dt.__webglTexture),a.memory.textures--),n.remove(G[X])}n.remove(C)}let P=0;function N(){P=0}function O(){return P}function D(C){P=C}function k(){let C=P;return C>=s.maxTextures&&Zt("WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+s.maxTextures),P+=1,C}function F(C){let y=[];return y.push(C.wrapS),y.push(C.wrapT),y.push(C.wrapR||0),y.push(C.magFilter),y.push(C.minFilter),y.push(C.anisotropy),y.push(C.internalFormat),y.push(C.format),y.push(C.type),y.push(C.generateMipmaps),y.push(C.premultiplyAlpha),y.push(C.flipY),y.push(C.unpackAlignment),y.push(C.colorSpace),y.join()}function H(C,y){let G=n.get(C);if(C.isVideoTexture&&U(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&G.__version!==C.version){let X=C.image;if(X===null)Zt("WebGLRenderer: Texture marked for update but no image data found.");else if(X.complete===!1)Zt("WebGLRenderer: Texture marked for update but image is incomplete");else{ht(G,C,y);return}}else C.isExternalTexture&&(G.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,G.__webglTexture,i.TEXTURE0+y)}function Y(C,y){let G=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&G.__version!==C.version){ht(G,C,y);return}else C.isExternalTexture&&(G.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,G.__webglTexture,i.TEXTURE0+y)}function J(C,y){let G=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&G.__version!==C.version){ht(G,C,y);return}e.bindTexture(i.TEXTURE_3D,G.__webglTexture,i.TEXTURE0+y)}function $(C,y){let G=n.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&G.__version!==C.version){Ot(G,C,y);return}e.bindTexture(i.TEXTURE_CUBE_MAP,G.__webglTexture,i.TEXTURE0+y)}let it={[ws]:i.REPEAT,[Zn]:i.CLAMP_TO_EDGE,[Ga]:i.MIRRORED_REPEAT},st={[Xe]:i.NEAREST,[Tu]:i.NEAREST_MIPMAP_NEAREST,[Or]:i.NEAREST_MIPMAP_LINEAR,[$e]:i.LINEAR,[Mo]:i.LINEAR_MIPMAP_NEAREST,[jn]:i.LINEAR_MIPMAP_LINEAR},Tt={[Cu]:i.NEVER,[Uu]:i.ALWAYS,[Iu]:i.LESS,[rl]:i.LEQUAL,[Pu]:i.EQUAL,[al]:i.GEQUAL,[Lu]:i.GREATER,[Du]:i.NOTEQUAL};function vt(C,y){if(y.type===Cn&&t.has("OES_texture_float_linear")===!1&&(y.magFilter===$e||y.magFilter===Mo||y.magFilter===Or||y.magFilter===jn||y.minFilter===$e||y.minFilter===Mo||y.minFilter===Or||y.minFilter===jn)&&Zt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(C,i.TEXTURE_WRAP_S,it[y.wrapS]),i.texParameteri(C,i.TEXTURE_WRAP_T,it[y.wrapT]),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,it[y.wrapR]),i.texParameteri(C,i.TEXTURE_MAG_FILTER,st[y.magFilter]),i.texParameteri(C,i.TEXTURE_MIN_FILTER,st[y.minFilter]),y.compareFunction&&(i.texParameteri(C,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(C,i.TEXTURE_COMPARE_FUNC,Tt[y.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Xe||y.minFilter!==Or&&y.minFilter!==jn||y.type===Cn&&t.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){let G=t.get("EXT_texture_filter_anisotropic");i.texParameterf(C,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,s.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function q(C,y){let G=!1;C.__webglInit===void 0&&(C.__webglInit=!0,y.addEventListener("dispose",w));let X=y.source,K=f.get(X);K===void 0&&(K={},f.set(X,K));let dt=F(y);if(dt!==C.__cacheKey){K[dt]===void 0&&(K[dt]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,G=!0),K[dt].usedTimes++;let mt=K[C.__cacheKey];mt!==void 0&&(K[C.__cacheKey].usedTimes--,mt.usedTimes===0&&R(y)),C.__cacheKey=dt,C.__webglTexture=K[dt].texture}return G}function rt(C,y,G){return Math.floor(Math.floor(C/G)/y)}function et(C,y,G,X){let dt=C.updateRanges;if(dt.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,y.width,y.height,G,X,y.data);else{dt.sort((Gt,St)=>Gt.start-St.start);let mt=0;for(let Gt=1;Gt<dt.length;Gt++){let St=dt[mt],_t=dt[Gt],Xt=St.start+St.count,$t=rt(_t.start,y.width,4),ee=rt(St.start,y.width,4);_t.start<=Xt+1&&$t===ee&&rt(_t.start+_t.count-1,y.width,4)===$t?St.count=Math.max(St.count,_t.start+_t.count-St.start):(++mt,dt[mt]=_t)}dt.length=mt+1;let Q=e.getParameter(i.UNPACK_ROW_LENGTH),nt=e.getParameter(i.UNPACK_SKIP_PIXELS),xt=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,y.width);for(let Gt=0,St=dt.length;Gt<St;Gt++){let _t=dt[Gt],Xt=Math.floor(_t.start/4),$t=Math.ceil(_t.count/4),ee=Xt%y.width,B=Math.floor(Xt/y.width),gt=$t,tt=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,ee),e.pixelStorei(i.UNPACK_SKIP_ROWS,B),e.texSubImage2D(i.TEXTURE_2D,0,ee,B,gt,tt,G,X,y.data)}C.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,Q),e.pixelStorei(i.UNPACK_SKIP_PIXELS,nt),e.pixelStorei(i.UNPACK_SKIP_ROWS,xt)}}function ht(C,y,G){let X=i.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(X=i.TEXTURE_2D_ARRAY),y.isData3DTexture&&(X=i.TEXTURE_3D);let K=q(C,y),dt=y.source;e.bindTexture(X,C.__webglTexture,i.TEXTURE0+G);let mt=n.get(dt);if(dt.version!==mt.__version||K===!0){if(e.activeTexture(i.TEXTURE0+G),(typeof ImageBitmap<"u"&&y.image instanceof ImageBitmap)===!1){let tt=he.getPrimaries(he.workingColorSpace),yt=y.colorSpace===xi?null:he.getPrimaries(y.colorSpace),Rt=y.colorSpace===xi||tt===yt?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Rt)}e.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment);let nt=p(y.image,!1,s.maxTextureSize);nt=pe(y,nt);let xt=r.convert(y.format,y.colorSpace),Gt=r.convert(y.type),St=_(y.internalFormat,xt,Gt,y.normalized,y.colorSpace,y.isVideoTexture);vt(X,y);let _t,Xt=y.mipmaps,$t=y.isVideoTexture!==!0,ee=mt.__version===void 0||K===!0,B=dt.dataReady,gt=S(y,nt);if(y.isDepthTexture)St=A(y.format===Oi,y.type),ee&&($t?e.texStorage2D(i.TEXTURE_2D,1,St,nt.width,nt.height):e.texImage2D(i.TEXTURE_2D,0,St,nt.width,nt.height,0,xt,Gt,null));else if(y.isDataTexture)if(Xt.length>0){$t&&ee&&e.texStorage2D(i.TEXTURE_2D,gt,St,Xt[0].width,Xt[0].height);for(let tt=0,yt=Xt.length;tt<yt;tt++)_t=Xt[tt],$t?B&&e.texSubImage2D(i.TEXTURE_2D,tt,0,0,_t.width,_t.height,xt,Gt,_t.data):e.texImage2D(i.TEXTURE_2D,tt,St,_t.width,_t.height,0,xt,Gt,_t.data);y.generateMipmaps=!1}else $t?(ee&&e.texStorage2D(i.TEXTURE_2D,gt,St,nt.width,nt.height),B&&et(y,nt,xt,Gt)):e.texImage2D(i.TEXTURE_2D,0,St,nt.width,nt.height,0,xt,Gt,nt.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){$t&&ee&&e.texStorage3D(i.TEXTURE_2D_ARRAY,gt,St,Xt[0].width,Xt[0].height,nt.depth);for(let tt=0,yt=Xt.length;tt<yt;tt++)if(_t=Xt[tt],y.format!==In)if(xt!==null)if($t){if(B)if(y.layerUpdates.size>0){let Rt=Gc(_t.width,_t.height,y.format,y.type);for(let at of y.layerUpdates){let zt=_t.data.subarray(at*Rt/_t.data.BYTES_PER_ELEMENT,(at+1)*Rt/_t.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,tt,0,0,at,_t.width,_t.height,1,xt,zt)}y.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,tt,0,0,0,_t.width,_t.height,nt.depth,xt,_t.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,tt,St,_t.width,_t.height,nt.depth,0,_t.data,0,0);else Zt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else $t?B&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,tt,0,0,0,_t.width,_t.height,nt.depth,xt,Gt,_t.data):e.texImage3D(i.TEXTURE_2D_ARRAY,tt,St,_t.width,_t.height,nt.depth,0,xt,Gt,_t.data)}else{$t&&ee&&e.texStorage2D(i.TEXTURE_2D,gt,St,Xt[0].width,Xt[0].height);for(let tt=0,yt=Xt.length;tt<yt;tt++)_t=Xt[tt],y.format!==In?xt!==null?$t?B&&e.compressedTexSubImage2D(i.TEXTURE_2D,tt,0,0,_t.width,_t.height,xt,_t.data):e.compressedTexImage2D(i.TEXTURE_2D,tt,St,_t.width,_t.height,0,_t.data):Zt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):$t?B&&e.texSubImage2D(i.TEXTURE_2D,tt,0,0,_t.width,_t.height,xt,Gt,_t.data):e.texImage2D(i.TEXTURE_2D,tt,St,_t.width,_t.height,0,xt,Gt,_t.data)}else if(y.isDataArrayTexture)if($t){if(ee&&e.texStorage3D(i.TEXTURE_2D_ARRAY,gt,St,nt.width,nt.height,nt.depth),B)if(y.layerUpdates.size>0){let tt=Gc(nt.width,nt.height,y.format,y.type);for(let yt of y.layerUpdates){let Rt=nt.data.subarray(yt*tt/nt.data.BYTES_PER_ELEMENT,(yt+1)*tt/nt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,yt,nt.width,nt.height,1,xt,Gt,Rt)}y.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,nt.width,nt.height,nt.depth,xt,Gt,nt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,St,nt.width,nt.height,nt.depth,0,xt,Gt,nt.data);else if(y.isData3DTexture)$t?(ee&&e.texStorage3D(i.TEXTURE_3D,gt,St,nt.width,nt.height,nt.depth),B&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,nt.width,nt.height,nt.depth,xt,Gt,nt.data)):e.texImage3D(i.TEXTURE_3D,0,St,nt.width,nt.height,nt.depth,0,xt,Gt,nt.data);else if(y.isFramebufferTexture){if(ee)if($t)e.texStorage2D(i.TEXTURE_2D,gt,St,nt.width,nt.height);else{let tt=nt.width,yt=nt.height;for(let Rt=0;Rt<gt;Rt++)e.texImage2D(i.TEXTURE_2D,Rt,St,tt,yt,0,xt,Gt,null),tt>>=1,yt>>=1}}else if(y.isHTMLTexture){if("texElementImage2D"in i){let tt=i.canvas;if(tt.hasAttribute("layoutsubtree")||tt.setAttribute("layoutsubtree","true"),nt.parentNode!==tt){tt.appendChild(nt),d.add(y),tt.onpaint=yt=>{let Rt=yt.changedElements;for(let at of d)Rt.includes(at.image)&&(at.needsUpdate=!0)},tt.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,nt);else{let Rt=i.RGBA,at=i.RGBA,zt=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Rt,at,zt,nt)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Xt.length>0){if($t&&ee){let tt=le(Xt[0]);e.texStorage2D(i.TEXTURE_2D,gt,St,tt.width,tt.height)}for(let tt=0,yt=Xt.length;tt<yt;tt++)_t=Xt[tt],$t?B&&e.texSubImage2D(i.TEXTURE_2D,tt,0,0,xt,Gt,_t):e.texImage2D(i.TEXTURE_2D,tt,St,xt,Gt,_t);y.generateMipmaps=!1}else if($t){if(ee){let tt=le(nt);e.texStorage2D(i.TEXTURE_2D,gt,St,tt.width,tt.height)}B&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,xt,Gt,nt)}else e.texImage2D(i.TEXTURE_2D,0,St,xt,Gt,nt);g(y)&&M(X),mt.__version=dt.version,y.onUpdate&&y.onUpdate(y)}C.__version=y.version}function Ot(C,y,G){if(y.image.length!==6)return;let X=q(C,y),K=y.source;e.bindTexture(i.TEXTURE_CUBE_MAP,C.__webglTexture,i.TEXTURE0+G);let dt=n.get(K);if(K.version!==dt.__version||X===!0){e.activeTexture(i.TEXTURE0+G);let mt=he.getPrimaries(he.workingColorSpace),Q=y.colorSpace===xi?null:he.getPrimaries(y.colorSpace),nt=y.colorSpace===xi||mt===Q?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,nt);let xt=y.isCompressedTexture||y.image[0].isCompressedTexture,Gt=y.image[0]&&y.image[0].isDataTexture,St=[];for(let at=0;at<6;at++)!xt&&!Gt?St[at]=p(y.image[at],!0,s.maxCubemapSize):St[at]=Gt?y.image[at].image:y.image[at],St[at]=pe(y,St[at]);let _t=St[0],Xt=r.convert(y.format,y.colorSpace),$t=r.convert(y.type),ee=_(y.internalFormat,Xt,$t,y.normalized,y.colorSpace),B=y.isVideoTexture!==!0,gt=dt.__version===void 0||X===!0,tt=K.dataReady,yt=S(y,_t);vt(i.TEXTURE_CUBE_MAP,y);let Rt;if(xt){B&&gt&&e.texStorage2D(i.TEXTURE_CUBE_MAP,yt,ee,_t.width,_t.height);for(let at=0;at<6;at++){Rt=St[at].mipmaps;for(let zt=0;zt<Rt.length;zt++){let Ft=Rt[zt];y.format!==In?Xt!==null?B?tt&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,zt,0,0,Ft.width,Ft.height,Xt,Ft.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,zt,ee,Ft.width,Ft.height,0,Ft.data):Zt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):B?tt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,zt,0,0,Ft.width,Ft.height,Xt,$t,Ft.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,zt,ee,Ft.width,Ft.height,0,Xt,$t,Ft.data)}}}else{if(Rt=y.mipmaps,B&&gt){Rt.length>0&&yt++;let at=le(St[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,yt,ee,at.width,at.height)}for(let at=0;at<6;at++)if(Gt){B?tt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,0,0,St[at].width,St[at].height,Xt,$t,St[at].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,ee,St[at].width,St[at].height,0,Xt,$t,St[at].data);for(let zt=0;zt<Rt.length;zt++){let Pe=Rt[zt].image[at].image;B?tt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,zt+1,0,0,Pe.width,Pe.height,Xt,$t,Pe.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,zt+1,ee,Pe.width,Pe.height,0,Xt,$t,Pe.data)}}else{B?tt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,0,0,Xt,$t,St[at]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,ee,Xt,$t,St[at]);for(let zt=0;zt<Rt.length;zt++){let Ft=Rt[zt];B?tt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,zt+1,0,0,Xt,$t,Ft.image[at]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,zt+1,ee,Xt,$t,Ft.image[at])}}}g(y)&&M(i.TEXTURE_CUBE_MAP),dt.__version=K.version,y.onUpdate&&y.onUpdate(y)}C.__version=y.version}function Nt(C,y,G,X,K,dt){let mt=r.convert(G.format,G.colorSpace),Q=r.convert(G.type),nt=_(G.internalFormat,mt,Q,G.normalized,G.colorSpace),xt=n.get(y),Gt=n.get(G);if(Gt.__renderTarget=y,!xt.__hasExternalTextures){let St=Math.max(1,y.width>>dt),_t=Math.max(1,y.height>>dt);K===i.TEXTURE_3D||K===i.TEXTURE_2D_ARRAY?e.texImage3D(K,dt,nt,St,_t,y.depth,0,mt,Q,null):e.texImage2D(K,dt,nt,St,_t,0,mt,Q,null)}e.bindFramebuffer(i.FRAMEBUFFER,C),te(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,X,K,Gt.__webglTexture,0,Kt(y)):(K===i.TEXTURE_2D||K>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,X,K,Gt.__webglTexture,dt),e.bindFramebuffer(i.FRAMEBUFFER,null)}function ae(C,y,G){if(i.bindRenderbuffer(i.RENDERBUFFER,C),y.depthBuffer){let X=y.depthTexture,K=X&&X.isDepthTexture?X.type:null,dt=A(y.stencilBuffer,K),mt=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;te(y)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Kt(y),dt,y.width,y.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,Kt(y),dt,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,dt,y.width,y.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,mt,i.RENDERBUFFER,C)}else{let X=y.textures;for(let K=0;K<X.length;K++){let dt=X[K],mt=r.convert(dt.format,dt.colorSpace),Q=r.convert(dt.type),nt=_(dt.internalFormat,mt,Q,dt.normalized,dt.colorSpace);te(y)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Kt(y),nt,y.width,y.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,Kt(y),nt,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,nt,y.width,y.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function It(C,y,G){let X=y.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,C),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let K=n.get(y.depthTexture);if(K.__renderTarget=y,(!K.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),X){if(K.__webglInit===void 0&&(K.__webglInit=!0,y.depthTexture.addEventListener("dispose",w)),K.__webglTexture===void 0){K.__webglTexture=i.createTexture(),e.bindTexture(i.TEXTURE_CUBE_MAP,K.__webglTexture),vt(i.TEXTURE_CUBE_MAP,y.depthTexture);let xt=r.convert(y.depthTexture.format),Gt=r.convert(y.depthTexture.type),St;y.depthTexture.format===$n?St=i.DEPTH_COMPONENT24:y.depthTexture.format===Oi&&(St=i.DEPTH24_STENCIL8);for(let _t=0;_t<6;_t++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_t,0,St,y.width,y.height,0,xt,Gt,null)}}else H(y.depthTexture,0);let dt=K.__webglTexture,mt=Kt(y),Q=X?i.TEXTURE_CUBE_MAP_POSITIVE_X+G:i.TEXTURE_2D,nt=y.depthTexture.format===Oi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(y.depthTexture.format===$n)te(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,nt,Q,dt,0,mt):i.framebufferTexture2D(i.FRAMEBUFFER,nt,Q,dt,0);else if(y.depthTexture.format===Oi)te(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,nt,Q,dt,0,mt):i.framebufferTexture2D(i.FRAMEBUFFER,nt,Q,dt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function j(C){let y=n.get(C),G=C.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==C.depthTexture){let X=C.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),X){let K=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,X.removeEventListener("dispose",K)};X.addEventListener("dispose",K),y.__depthDisposeCallback=K}y.__boundDepthTexture=X}if(C.depthTexture&&!y.__autoAllocateDepthBuffer)if(G)for(let X=0;X<6;X++)It(y.__webglFramebuffer[X],C,X);else{let X=C.texture.mipmaps;X&&X.length>0?It(y.__webglFramebuffer[0],C,0):It(y.__webglFramebuffer,C,0)}else if(G){y.__webglDepthbuffer=[];for(let X=0;X<6;X++)if(e.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[X]),y.__webglDepthbuffer[X]===void 0)y.__webglDepthbuffer[X]=i.createRenderbuffer(),ae(y.__webglDepthbuffer[X],C,!1);else{let K=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,dt=y.__webglDepthbuffer[X];i.bindRenderbuffer(i.RENDERBUFFER,dt),i.framebufferRenderbuffer(i.FRAMEBUFFER,K,i.RENDERBUFFER,dt)}}else{let X=C.texture.mipmaps;if(X&&X.length>0?e.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=i.createRenderbuffer(),ae(y.__webglDepthbuffer,C,!1);else{let K=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,dt=y.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,dt),i.framebufferRenderbuffer(i.FRAMEBUFFER,K,i.RENDERBUFFER,dt)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function ct(C,y,G){let X=n.get(C);y!==void 0&&Nt(X.__webglFramebuffer,C,C.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),G!==void 0&&j(C)}function lt(C){let y=C.texture,G=n.get(C),X=n.get(y);C.addEventListener("dispose",x);let K=C.textures,dt=C.isWebGLCubeRenderTarget===!0,mt=K.length>1;if(mt||(X.__webglTexture===void 0&&(X.__webglTexture=i.createTexture()),X.__version=y.version,a.memory.textures++),dt){G.__webglFramebuffer=[];for(let Q=0;Q<6;Q++)if(y.mipmaps&&y.mipmaps.length>0){G.__webglFramebuffer[Q]=[];for(let nt=0;nt<y.mipmaps.length;nt++)G.__webglFramebuffer[Q][nt]=i.createFramebuffer()}else G.__webglFramebuffer[Q]=i.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){G.__webglFramebuffer=[];for(let Q=0;Q<y.mipmaps.length;Q++)G.__webglFramebuffer[Q]=i.createFramebuffer()}else G.__webglFramebuffer=i.createFramebuffer();if(mt)for(let Q=0,nt=K.length;Q<nt;Q++){let xt=n.get(K[Q]);xt.__webglTexture===void 0&&(xt.__webglTexture=i.createTexture(),a.memory.textures++)}if(C.samples>0&&te(C)===!1){G.__webglMultisampledFramebuffer=i.createFramebuffer(),G.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let Q=0;Q<K.length;Q++){let nt=K[Q];G.__webglColorRenderbuffer[Q]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,G.__webglColorRenderbuffer[Q]);let xt=r.convert(nt.format,nt.colorSpace),Gt=r.convert(nt.type),St=_(nt.internalFormat,xt,Gt,nt.normalized,nt.colorSpace,C.isXRRenderTarget===!0),_t=Kt(C);i.renderbufferStorageMultisample(i.RENDERBUFFER,_t,St,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Q,i.RENDERBUFFER,G.__webglColorRenderbuffer[Q])}i.bindRenderbuffer(i.RENDERBUFFER,null),C.depthBuffer&&(G.__webglDepthRenderbuffer=i.createRenderbuffer(),ae(G.__webglDepthRenderbuffer,C,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(dt){e.bindTexture(i.TEXTURE_CUBE_MAP,X.__webglTexture),vt(i.TEXTURE_CUBE_MAP,y);for(let Q=0;Q<6;Q++)if(y.mipmaps&&y.mipmaps.length>0)for(let nt=0;nt<y.mipmaps.length;nt++)Nt(G.__webglFramebuffer[Q][nt],C,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,nt);else Nt(G.__webglFramebuffer[Q],C,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0);g(y)&&M(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(mt){for(let Q=0,nt=K.length;Q<nt;Q++){let xt=K[Q],Gt=n.get(xt),St=i.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(St=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(St,Gt.__webglTexture),vt(St,xt),Nt(G.__webglFramebuffer,C,xt,i.COLOR_ATTACHMENT0+Q,St,0),g(xt)&&M(St)}e.unbindTexture()}else{let Q=i.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(Q=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(Q,X.__webglTexture),vt(Q,y),y.mipmaps&&y.mipmaps.length>0)for(let nt=0;nt<y.mipmaps.length;nt++)Nt(G.__webglFramebuffer[nt],C,y,i.COLOR_ATTACHMENT0,Q,nt);else Nt(G.__webglFramebuffer,C,y,i.COLOR_ATTACHMENT0,Q,0);g(y)&&M(Q),e.unbindTexture()}C.depthBuffer&&j(C)}function Et(C){let y=C.textures;for(let G=0,X=y.length;G<X;G++){let K=y[G];if(g(K)){let dt=E(C),mt=n.get(K).__webglTexture;e.bindTexture(dt,mt),M(dt),e.unbindTexture()}}}let Mt=[],Yt=[];function Ht(C){if(C.samples>0){if(te(C)===!1){let y=C.textures,G=C.width,X=C.height,K=i.COLOR_BUFFER_BIT,dt=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,mt=n.get(C),Q=y.length>1;if(Q)for(let xt=0;xt<y.length;xt++)e.bindFramebuffer(i.FRAMEBUFFER,mt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+xt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,mt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+xt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,mt.__webglMultisampledFramebuffer);let nt=C.texture.mipmaps;nt&&nt.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,mt.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,mt.__webglFramebuffer);for(let xt=0;xt<y.length;xt++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(K|=i.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(K|=i.STENCIL_BUFFER_BIT)),Q){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,mt.__webglColorRenderbuffer[xt]);let Gt=n.get(y[xt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Gt,0)}i.blitFramebuffer(0,0,G,X,0,0,G,X,K,i.NEAREST),l===!0&&(Mt.length=0,Yt.length=0,Mt.push(i.COLOR_ATTACHMENT0+xt),C.depthBuffer&&C.resolveDepthBuffer===!1&&(Mt.push(dt),Yt.push(dt),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Yt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Mt))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Q)for(let xt=0;xt<y.length;xt++){e.bindFramebuffer(i.FRAMEBUFFER,mt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+xt,i.RENDERBUFFER,mt.__webglColorRenderbuffer[xt]);let Gt=n.get(y[xt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,mt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+xt,i.TEXTURE_2D,Gt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,mt.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){let y=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[y])}}}function Kt(C){return Math.min(s.maxSamples,C.samples)}function te(C){let y=n.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function U(C){let y=a.render.frame;h.get(C)!==y&&(h.set(C,y),C.update())}function pe(C,y){let G=C.colorSpace,X=C.format,K=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||G!==ar&&G!==xi&&(he.getTransfer(G)===de?(X!==In||K!==pn)&&Zt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Jt("WebGLTextures: Unsupported texture color space:",G)),y}function le(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=k,this.resetTextureUnits=N,this.getTextureUnits=O,this.setTextureUnits=D,this.setTexture2D=H,this.setTexture2DArray=Y,this.setTexture3D=J,this.setTextureCube=$,this.rebindTextures=ct,this.setupRenderTarget=lt,this.updateRenderTargetMipmap=Et,this.updateMultisampleRenderTarget=Ht,this.setupDepthRenderbuffer=j,this.setupFrameBufferTexture=Nt,this.useMultisampledRTT=te,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function s_(i,t){function e(n,s=xi){let r,a=he.getTransfer(s);if(n===pn)return i.UNSIGNED_BYTE;if(n===bo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Eo)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Pc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Lc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Cc)return i.BYTE;if(n===Ic)return i.SHORT;if(n===Bs)return i.UNSIGNED_SHORT;if(n===So)return i.INT;if(n===Hn)return i.UNSIGNED_INT;if(n===Cn)return i.FLOAT;if(n===ti)return i.HALF_FLOAT;if(n===Dc)return i.ALPHA;if(n===Uc)return i.RGB;if(n===In)return i.RGBA;if(n===$n)return i.DEPTH_COMPONENT;if(n===Oi)return i.DEPTH_STENCIL;if(n===wo)return i.RED;if(n===To)return i.RED_INTEGER;if(n===zi)return i.RG;if(n===Ao)return i.RG_INTEGER;if(n===Ro)return i.RGBA_INTEGER;if(n===zr||n===Hr||n===Gr||n===kr)if(a===de)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===zr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Hr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Gr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===kr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===zr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Hr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Gr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===kr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Co||n===Io||n===Po||n===Lo)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Co)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Io)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Po)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Lo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Do||n===Uo||n===No||n===Fo||n===Bo||n===Vr||n===Oo)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Do||n===Uo)return a===de?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===No)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Fo)return r.COMPRESSED_R11_EAC;if(n===Bo)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Vr)return r.COMPRESSED_RG11_EAC;if(n===Oo)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===zo||n===Ho||n===Go||n===ko||n===Vo||n===Wo||n===Xo||n===qo||n===Yo||n===Zo||n===$o||n===Jo||n===Ko||n===Qo)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===zo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ho)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Go)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===ko)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Vo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Wo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Xo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===qo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Yo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Zo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===$o)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Jo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Ko)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Qo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===jo||n===tl||n===el)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===jo)return a===de?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===tl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===el)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===nl||n===il||n===Wr||n===sl)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===nl)return r.COMPRESSED_RED_RGTC1_EXT;if(n===il)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Wr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===sl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Os?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var r_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,a_=`
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

}`,eh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new _r(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new ln({vertexShader:r_,fragmentShader:a_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new ft(new Ee(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},nh=class extends Jn{constructor(t,e){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,d=null,u=null,f=null,m=null,v=typeof XRWebGLBinding<"u",p=new eh,g={},M=e.getContextAttributes(),E=null,_=null,A=[],S=[],w=new pt,x=null,b=new nn;b.viewport=new we;let R=new nn;R.viewport=new we;let I=[b,R],P=new go,N=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let rt=A[q];return rt===void 0&&(rt=new Cs,A[q]=rt),rt.getTargetRaySpace()},this.getControllerGrip=function(q){let rt=A[q];return rt===void 0&&(rt=new Cs,A[q]=rt),rt.getGripSpace()},this.getHand=function(q){let rt=A[q];return rt===void 0&&(rt=new Cs,A[q]=rt),rt.getHandSpace()};function D(q){let rt=S.indexOf(q.inputSource);if(rt===-1)return;let et=A[rt];et!==void 0&&(et.update(q.inputSource,q.frame,c||a),et.dispatchEvent({type:q.type,data:q.inputSource}))}function k(){s.removeEventListener("select",D),s.removeEventListener("selectstart",D),s.removeEventListener("selectend",D),s.removeEventListener("squeeze",D),s.removeEventListener("squeezestart",D),s.removeEventListener("squeezeend",D),s.removeEventListener("end",k),s.removeEventListener("inputsourceschange",F);for(let q=0;q<A.length;q++){let rt=S[q];rt!==null&&(S[q]=null,A[q].disconnect(rt))}N=null,O=null,p.reset();for(let q in g)delete g[q];t.setRenderTarget(E),f=null,u=null,d=null,s=null,_=null,vt.stop(),n.isPresenting=!1,t.setPixelRatio(x),t.setSize(w.width,w.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){r=q,n.isPresenting===!0&&Zt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){o=q,n.isPresenting===!0&&Zt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return d===null&&v&&(d=new XRWebGLBinding(s,e)),d},this.getFrame=function(){return m},this.getSession=function(){return s},this.setSession=async function(q){if(s=q,s!==null){if(E=t.getRenderTarget(),s.addEventListener("select",D),s.addEventListener("selectstart",D),s.addEventListener("selectend",D),s.addEventListener("squeeze",D),s.addEventListener("squeezestart",D),s.addEventListener("squeezeend",D),s.addEventListener("end",k),s.addEventListener("inputsourceschange",F),M.xrCompatible!==!0&&await e.makeXRCompatible(),x=t.getPixelRatio(),t.getSize(w),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let et=null,ht=null,Ot=null;M.depth&&(Ot=M.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,et=M.stencil?Oi:$n,ht=M.stencil?Os:Hn);let Nt={colorFormat:e.RGBA8,depthFormat:Ot,scaleFactor:r};d=this.getBinding(),u=d.createProjectionLayer(Nt),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),_=new yn(u.textureWidth,u.textureHeight,{format:In,type:pn,depthTexture:new mi(u.textureWidth,u.textureHeight,ht,void 0,void 0,void 0,void 0,void 0,void 0,et),stencilBuffer:M.stencil,colorSpace:t.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}else{let et={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,e,et),s.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),_=new yn(f.framebufferWidth,f.framebufferHeight,{format:In,type:pn,colorSpace:t.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),vt.setContext(s),vt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function F(q){for(let rt=0;rt<q.removed.length;rt++){let et=q.removed[rt],ht=S.indexOf(et);ht>=0&&(S[ht]=null,A[ht].disconnect(et))}for(let rt=0;rt<q.added.length;rt++){let et=q.added[rt],ht=S.indexOf(et);if(ht===-1){for(let Nt=0;Nt<A.length;Nt++)if(Nt>=S.length){S.push(et),ht=Nt;break}else if(S[Nt]===null){S[Nt]=et,ht=Nt;break}if(ht===-1)break}let Ot=A[ht];Ot&&Ot.connect(et)}}let H=new L,Y=new L;function J(q,rt,et){H.setFromMatrixPosition(rt.matrixWorld),Y.setFromMatrixPosition(et.matrixWorld);let ht=H.distanceTo(Y),Ot=rt.projectionMatrix.elements,Nt=et.projectionMatrix.elements,ae=Ot[14]/(Ot[10]-1),It=Ot[14]/(Ot[10]+1),j=(Ot[9]+1)/Ot[5],ct=(Ot[9]-1)/Ot[5],lt=(Ot[8]-1)/Ot[0],Et=(Nt[8]+1)/Nt[0],Mt=ae*lt,Yt=ae*Et,Ht=ht/(-lt+Et),Kt=Ht*-lt;if(rt.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(Kt),q.translateZ(Ht),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),Ot[10]===-1)q.projectionMatrix.copy(rt.projectionMatrix),q.projectionMatrixInverse.copy(rt.projectionMatrixInverse);else{let te=ae+Ht,U=It+Ht,pe=Mt-Kt,le=Yt+(ht-Kt),C=j*It/U*te,y=ct*It/U*te;q.projectionMatrix.makePerspective(pe,le,C,y,te,U),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function $(q,rt){rt===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(rt.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(s===null)return;let rt=q.near,et=q.far;p.texture!==null&&(p.depthNear>0&&(rt=p.depthNear),p.depthFar>0&&(et=p.depthFar)),P.near=R.near=b.near=rt,P.far=R.far=b.far=et,(N!==P.near||O!==P.far)&&(s.updateRenderState({depthNear:P.near,depthFar:P.far}),N=P.near,O=P.far),P.layers.mask=q.layers.mask|6,b.layers.mask=P.layers.mask&-5,R.layers.mask=P.layers.mask&-3;let ht=q.parent,Ot=P.cameras;$(P,ht);for(let Nt=0;Nt<Ot.length;Nt++)$(Ot[Nt],ht);Ot.length===2?J(P,b,R):P.projectionMatrix.copy(b.projectionMatrix),it(q,P,ht)};function it(q,rt,et){et===null?q.matrix.copy(rt.matrixWorld):(q.matrix.copy(et.matrixWorld),q.matrix.invert(),q.matrix.multiply(rt.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(rt.projectionMatrix),q.projectionMatrixInverse.copy(rt.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=Va*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return P},this.getFoveation=function(){if(!(u===null&&f===null))return l},this.setFoveation=function(q){l=q,u!==null&&(u.fixedFoveation=q),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=q)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(P)},this.getCameraTexture=function(q){return g[q]};let st=null;function Tt(q,rt){if(h=rt.getViewerPose(c||a),m=rt,h!==null){let et=h.views;f!==null&&(t.setRenderTargetFramebuffer(_,f.framebuffer),t.setRenderTarget(_));let ht=!1;et.length!==P.cameras.length&&(P.cameras.length=0,ht=!0);for(let It=0;It<et.length;It++){let j=et[It],ct=null;if(f!==null)ct=f.getViewport(j);else{let Et=d.getViewSubImage(u,j);ct=Et.viewport,It===0&&(t.setRenderTargetTextures(_,Et.colorTexture,Et.depthStencilTexture),t.setRenderTarget(_))}let lt=I[It];lt===void 0&&(lt=new nn,lt.layers.enable(It),lt.viewport=new we,I[It]=lt),lt.matrix.fromArray(j.transform.matrix),lt.matrix.decompose(lt.position,lt.quaternion,lt.scale),lt.projectionMatrix.fromArray(j.projectionMatrix),lt.projectionMatrixInverse.copy(lt.projectionMatrix).invert(),lt.viewport.set(ct.x,ct.y,ct.width,ct.height),It===0&&(P.matrix.copy(lt.matrix),P.matrix.decompose(P.position,P.quaternion,P.scale)),ht===!0&&P.cameras.push(lt)}let Ot=s.enabledFeatures;if(Ot&&Ot.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){d=n.getBinding();let It=d.getDepthInformation(et[0]);It&&It.isValid&&It.texture&&p.init(It,s.renderState)}if(Ot&&Ot.includes("camera-access")&&v){t.state.unbindTexture(),d=n.getBinding();for(let It=0;It<et.length;It++){let j=et[It].camera;if(j){let ct=g[j];ct||(ct=new _r,g[j]=ct);let lt=d.getCameraImage(j);ct.sourceTexture=lt}}}}for(let et=0;et<A.length;et++){let ht=S[et],Ot=A[et];ht!==null&&Ot!==void 0&&Ot.update(ht,rt,c||a)}st&&st(q,rt),rt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:rt}),m=null}let vt=new pd;vt.setAnimationLoop(Tt),this.setAnimationLoop=function(q){st=q},this.dispose=function(){}}},o_=new ie,vd=new Qt;vd.set(-1,0,0,0,1,0,0,0,1);function l_(i,t){function e(p,g){p.matrixAutoUpdate===!0&&p.updateMatrix(),g.value.copy(p.matrix)}function n(p,g){g.color.getRGB(p.fogColor.value,Oc(i)),g.isFog?(p.fogNear.value=g.near,p.fogFar.value=g.far):g.isFogExp2&&(p.fogDensity.value=g.density)}function s(p,g,M,E,_){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(p,g):g.isMeshLambertMaterial?(r(p,g),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(p,g),d(p,g)):g.isMeshPhongMaterial?(r(p,g),h(p,g),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(p,g),u(p,g),g.isMeshPhysicalMaterial&&f(p,g,_)):g.isMeshMatcapMaterial?(r(p,g),m(p,g)):g.isMeshDepthMaterial?r(p,g):g.isMeshDistanceMaterial?(r(p,g),v(p,g)):g.isMeshNormalMaterial?r(p,g):g.isLineBasicMaterial?(a(p,g),g.isLineDashedMaterial&&o(p,g)):g.isPointsMaterial?l(p,g,M,E):g.isSpriteMaterial?c(p,g):g.isShadowMaterial?(p.color.value.copy(g.color),p.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(p,g){p.opacity.value=g.opacity,g.color&&p.diffuse.value.copy(g.color),g.emissive&&p.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(p.map.value=g.map,e(g.map,p.mapTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,e(g.alphaMap,p.alphaMapTransform)),g.bumpMap&&(p.bumpMap.value=g.bumpMap,e(g.bumpMap,p.bumpMapTransform),p.bumpScale.value=g.bumpScale,g.side===Je&&(p.bumpScale.value*=-1)),g.normalMap&&(p.normalMap.value=g.normalMap,e(g.normalMap,p.normalMapTransform),p.normalScale.value.copy(g.normalScale),g.side===Je&&p.normalScale.value.negate()),g.displacementMap&&(p.displacementMap.value=g.displacementMap,e(g.displacementMap,p.displacementMapTransform),p.displacementScale.value=g.displacementScale,p.displacementBias.value=g.displacementBias),g.emissiveMap&&(p.emissiveMap.value=g.emissiveMap,e(g.emissiveMap,p.emissiveMapTransform)),g.specularMap&&(p.specularMap.value=g.specularMap,e(g.specularMap,p.specularMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest);let M=t.get(g),E=M.envMap,_=M.envMapRotation;E&&(p.envMap.value=E,p.envMapRotation.value.setFromMatrix4(o_.makeRotationFromEuler(_)).transpose(),E.isCubeTexture&&E.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(vd),p.reflectivity.value=g.reflectivity,p.ior.value=g.ior,p.refractionRatio.value=g.refractionRatio),g.lightMap&&(p.lightMap.value=g.lightMap,p.lightMapIntensity.value=g.lightMapIntensity,e(g.lightMap,p.lightMapTransform)),g.aoMap&&(p.aoMap.value=g.aoMap,p.aoMapIntensity.value=g.aoMapIntensity,e(g.aoMap,p.aoMapTransform))}function a(p,g){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,g.map&&(p.map.value=g.map,e(g.map,p.mapTransform))}function o(p,g){p.dashSize.value=g.dashSize,p.totalSize.value=g.dashSize+g.gapSize,p.scale.value=g.scale}function l(p,g,M,E){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.size.value=g.size*M,p.scale.value=E*.5,g.map&&(p.map.value=g.map,e(g.map,p.uvTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,e(g.alphaMap,p.alphaMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest)}function c(p,g){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.rotation.value=g.rotation,g.map&&(p.map.value=g.map,e(g.map,p.mapTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,e(g.alphaMap,p.alphaMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest)}function h(p,g){p.specular.value.copy(g.specular),p.shininess.value=Math.max(g.shininess,1e-4)}function d(p,g){g.gradientMap&&(p.gradientMap.value=g.gradientMap)}function u(p,g){p.metalness.value=g.metalness,g.metalnessMap&&(p.metalnessMap.value=g.metalnessMap,e(g.metalnessMap,p.metalnessMapTransform)),p.roughness.value=g.roughness,g.roughnessMap&&(p.roughnessMap.value=g.roughnessMap,e(g.roughnessMap,p.roughnessMapTransform)),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)}function f(p,g,M){p.ior.value=g.ior,g.sheen>0&&(p.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),p.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(p.sheenColorMap.value=g.sheenColorMap,e(g.sheenColorMap,p.sheenColorMapTransform)),g.sheenRoughnessMap&&(p.sheenRoughnessMap.value=g.sheenRoughnessMap,e(g.sheenRoughnessMap,p.sheenRoughnessMapTransform))),g.clearcoat>0&&(p.clearcoat.value=g.clearcoat,p.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(p.clearcoatMap.value=g.clearcoatMap,e(g.clearcoatMap,p.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,e(g.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(p.clearcoatNormalMap.value=g.clearcoatNormalMap,e(g.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===Je&&p.clearcoatNormalScale.value.negate())),g.dispersion>0&&(p.dispersion.value=g.dispersion),g.iridescence>0&&(p.iridescence.value=g.iridescence,p.iridescenceIOR.value=g.iridescenceIOR,p.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(p.iridescenceMap.value=g.iridescenceMap,e(g.iridescenceMap,p.iridescenceMapTransform)),g.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=g.iridescenceThicknessMap,e(g.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),g.transmission>0&&(p.transmission.value=g.transmission,p.transmissionSamplerMap.value=M.texture,p.transmissionSamplerSize.value.set(M.width,M.height),g.transmissionMap&&(p.transmissionMap.value=g.transmissionMap,e(g.transmissionMap,p.transmissionMapTransform)),p.thickness.value=g.thickness,g.thicknessMap&&(p.thicknessMap.value=g.thicknessMap,e(g.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=g.attenuationDistance,p.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(p.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(p.anisotropyMap.value=g.anisotropyMap,e(g.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=g.specularIntensity,p.specularColor.value.copy(g.specularColor),g.specularColorMap&&(p.specularColorMap.value=g.specularColorMap,e(g.specularColorMap,p.specularColorMapTransform)),g.specularIntensityMap&&(p.specularIntensityMap.value=g.specularIntensityMap,e(g.specularIntensityMap,p.specularIntensityMapTransform))}function m(p,g){g.matcap&&(p.matcap.value=g.matcap)}function v(p,g){let M=t.get(g).light;p.referencePosition.value.setFromMatrixPosition(M.matrixWorld),p.nearDistance.value=M.shadow.camera.near,p.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function c_(i,t,e,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(_,A){let S=A.program;n.uniformBlockBinding(_,S)}function c(_,A){let S=s[_.id];S===void 0&&(p(_),S=h(_),s[_.id]=S,_.addEventListener("dispose",M));let w=A.program;n.updateUBOMapping(_,w);let x=t.render.frame;r[_.id]!==x&&(u(_),r[_.id]=x)}function h(_){let A=d();_.__bindingPointIndex=A;let S=i.createBuffer(),w=_.__size,x=_.usage;return i.bindBuffer(i.UNIFORM_BUFFER,S),i.bufferData(i.UNIFORM_BUFFER,w,x),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,A,S),S}function d(){for(let _=0;_<o;_++)if(a.indexOf(_)===-1)return a.push(_),_;return Jt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(_){let A=s[_.id],S=_.uniforms,w=_.__cache;i.bindBuffer(i.UNIFORM_BUFFER,A);for(let x=0,b=S.length;x<b;x++){let R=S[x];if(Array.isArray(R))for(let I=0,P=R.length;I<P;I++)f(R[I],x,I,w);else f(R,x,0,w)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(_,A,S,w){if(v(_,A,S,w)===!0){let x=_.__offset,b=_.value;if(Array.isArray(b)){let R=0;for(let I=0;I<b.length;I++){let P=b[I],N=g(P);m(P,_.__data,R),typeof P!="number"&&typeof P!="boolean"&&!P.isMatrix3&&!ArrayBuffer.isView(P)&&(R+=N.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(b,_.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,x,_.__data)}}function m(_,A,S){typeof _=="number"||typeof _=="boolean"?A[0]=_:_.isMatrix3?(A[0]=_.elements[0],A[1]=_.elements[1],A[2]=_.elements[2],A[3]=0,A[4]=_.elements[3],A[5]=_.elements[4],A[6]=_.elements[5],A[7]=0,A[8]=_.elements[6],A[9]=_.elements[7],A[10]=_.elements[8],A[11]=0):ArrayBuffer.isView(_)?A.set(new _.constructor(_.buffer,_.byteOffset,A.length)):_.toArray(A,S)}function v(_,A,S,w){let x=_.value,b=A+"_"+S;if(w[b]===void 0)return typeof x=="number"||typeof x=="boolean"?w[b]=x:ArrayBuffer.isView(x)?w[b]=x.slice():w[b]=x.clone(),!0;{let R=w[b];if(typeof x=="number"||typeof x=="boolean"){if(R!==x)return w[b]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(R.equals(x)===!1)return R.copy(x),!0}}return!1}function p(_){let A=_.uniforms,S=0,w=16;for(let b=0,R=A.length;b<R;b++){let I=Array.isArray(A[b])?A[b]:[A[b]];for(let P=0,N=I.length;P<N;P++){let O=I[P],D=Array.isArray(O.value)?O.value:[O.value];for(let k=0,F=D.length;k<F;k++){let H=D[k],Y=g(H),J=S%w,$=J%Y.boundary,it=J+$;S+=$,it!==0&&w-it<Y.storage&&(S+=w-it),O.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=S,S+=Y.storage}}}let x=S%w;return x>0&&(S+=w-x),_.__size=S,_.__cache={},this}function g(_){let A={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(A.boundary=4,A.storage=4):_.isVector2?(A.boundary=8,A.storage=8):_.isVector3||_.isColor?(A.boundary=16,A.storage=12):_.isVector4?(A.boundary=16,A.storage=16):_.isMatrix3?(A.boundary=48,A.storage=48):_.isMatrix4?(A.boundary=64,A.storage=64):_.isTexture?Zt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(_)?(A.boundary=16,A.storage=_.byteLength):Zt("WebGLRenderer: Unsupported uniform value type.",_),A}function M(_){let A=_.target;A.removeEventListener("dispose",M);let S=a.indexOf(A.__bindingPointIndex);a.splice(S,1),i.deleteBuffer(s[A.id]),delete s[A.id],delete r[A.id]}function E(){for(let _ in s)i.deleteBuffer(s[_]);a=[],s={},r={}}return{bind:l,update:c,dispose:E}}var h_=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),ei=null;function u_(){return ei===null&&(ei=new mr(h_,16,16,zi,ti),ei.name="DFG_LUT",ei.minFilter=$e,ei.magFilter=$e,ei.wrapS=Zn,ei.wrapT=Zn,ei.generateMipmaps=!1,ei.needsUpdate=!0),ei}var hl=class{constructor(t={}){let{canvas:e=Nu(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:f=pn}=t;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=n.getContextAttributes().alpha}else m=a;let v=f,p=new Set([Ro,Ao,To]),g=new Set([pn,Hn,Bs,Os,bo,Eo]),M=new Uint32Array(4),E=new Int32Array(4),_=new L,A=null,S=null,w=[],x=[],b=null;this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=zn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let R=this,I=!1,P=null,N=null,O=null,D=null;this._outputColorSpace=De;let k=0,F=0,H=null,Y=-1,J=null,$=new we,it=new we,st=null,Tt=new Vt(0),vt=0,q=e.width,rt=e.height,et=1,ht=null,Ot=null,Nt=new we(0,0,q,rt),ae=new we(0,0,q,rt),It=!1,j=new Is,ct=!1,lt=!1,Et=new ie,Mt=new L,Yt=new we,Ht={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Kt=!1;function te(){return H===null?et:1}let U=n;function pe(T,z){return e.getContext(T,z)}try{let T={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"185"}`),e.addEventListener("webglcontextlost",Pe,!1),e.addEventListener("webglcontextrestored",ve,!1),e.addEventListener("webglcontextcreationerror",Vn,!1),U===null){let z="webgl2";if(U=pe(z,T),U===null)throw pe(z)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(T){throw Jt("WebGLRenderer: "+T.message),T}let le,C,y,G,X,K,dt,mt,Q,nt,xt,Gt,St,_t,Xt,$t,ee,B,gt,tt,yt,Rt,at;function zt(){le=new _g(U),le.init(),yt=new s_(U,le),C=new hg(U,le,t,yt),y=new n_(U,le),C.reversedDepthBuffer&&u&&y.buffers.depth.setReversed(!0),N=U.createFramebuffer(),O=U.createFramebuffer(),D=U.createFramebuffer(),G=new Mg(U),X=new kx,K=new i_(U,le,y,X,C,yt,G),dt=new xg(R),mt=new wp(U),Rt=new lg(U,mt),Q=new yg(U,mt,G,Rt),nt=new bg(U,Q,mt,Rt,G),B=new Sg(U,C,K),Xt=new ug(X),xt=new Gx(R,dt,le,C,Rt,Xt),Gt=new l_(R,X),St=new Wx,_t=new Jx(le),ee=new og(R,dt,y,nt,m,l),$t=new e_(R,nt,C),at=new c_(U,G,C,y),gt=new cg(U,le,G),tt=new vg(U,le,G),G.programs=xt.programs,R.capabilities=C,R.extensions=le,R.properties=X,R.renderLists=St,R.shadowMap=$t,R.state=y,R.info=G}zt(),v!==pn&&(b=new wg(v,e.width,e.height,o,s,r));let Ft=new nh(R,U);this.xr=Ft,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){let T=le.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=le.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return et},this.setPixelRatio=function(T){T!==void 0&&(et=T,this.setSize(q,rt,!1))},this.getSize=function(T){return T.set(q,rt)},this.setSize=function(T,z,Z=!0){if(Ft.isPresenting){Zt("WebGLRenderer: Can't change size while VR device is presenting.");return}q=T,rt=z,e.width=Math.floor(T*et),e.height=Math.floor(z*et),Z===!0&&(e.style.width=T+"px",e.style.height=z+"px"),b!==null&&b.setSize(e.width,e.height),this.setViewport(0,0,T,z)},this.getDrawingBufferSize=function(T){return T.set(q*et,rt*et).floor()},this.setDrawingBufferSize=function(T,z,Z){q=T,rt=z,et=Z,e.width=Math.floor(T*Z),e.height=Math.floor(z*Z),this.setViewport(0,0,T,z)},this.setEffects=function(T){if(v===pn){Jt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(T){for(let z=0;z<T.length;z++)if(T[z].isOutputPass===!0){Zt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}b.setEffects(T||[])},this.getCurrentViewport=function(T){return T.copy($)},this.getViewport=function(T){return T.copy(Nt)},this.setViewport=function(T,z,Z,V){T.isVector4?Nt.set(T.x,T.y,T.z,T.w):Nt.set(T,z,Z,V),y.viewport($.copy(Nt).multiplyScalar(et).round())},this.getScissor=function(T){return T.copy(ae)},this.setScissor=function(T,z,Z,V){T.isVector4?ae.set(T.x,T.y,T.z,T.w):ae.set(T,z,Z,V),y.scissor(it.copy(ae).multiplyScalar(et).round())},this.getScissorTest=function(){return It},this.setScissorTest=function(T){y.setScissorTest(It=T)},this.setOpaqueSort=function(T){ht=T},this.setTransparentSort=function(T){Ot=T},this.getClearColor=function(T){return T.copy(ee.getClearColor())},this.setClearColor=function(){ee.setClearColor(...arguments)},this.getClearAlpha=function(){return ee.getClearAlpha()},this.setClearAlpha=function(){ee.setClearAlpha(...arguments)},this.clear=function(T=!0,z=!0,Z=!0){let V=0;if(T){let W=!1;if(H!==null){let At=H.texture.format;W=p.has(At)}if(W){let At=H.texture.type,Dt=g.has(At),wt=ee.getClearColor(),Bt=ee.getClearAlpha(),kt=wt.r,ne=wt.g,oe=wt.b;Dt?(M[0]=kt,M[1]=ne,M[2]=oe,M[3]=Bt,U.clearBufferuiv(U.COLOR,0,M)):(E[0]=kt,E[1]=ne,E[2]=oe,E[3]=Bt,U.clearBufferiv(U.COLOR,0,E))}else V|=U.COLOR_BUFFER_BIT}z&&(V|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Z&&(V|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),V!==0&&U.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(T){T.setRenderer(this),P=T},this.dispose=function(){e.removeEventListener("webglcontextlost",Pe,!1),e.removeEventListener("webglcontextrestored",ve,!1),e.removeEventListener("webglcontextcreationerror",Vn,!1),ee.dispose(),St.dispose(),_t.dispose(),X.dispose(),dt.dispose(),nt.dispose(),Rt.dispose(),at.dispose(),xt.dispose(),Ft.dispose(),Ft.removeEventListener("sessionstart",Sh),Ft.removeEventListener("sessionend",bh),Vi.stop()};function Pe(T){T.preventDefault(),Fc("WebGLRenderer: Context Lost."),I=!0}function ve(){Fc("WebGLRenderer: Context Restored."),I=!1;let T=G.autoReset,z=$t.enabled,Z=$t.autoUpdate,V=$t.needsUpdate,W=$t.type;zt(),G.autoReset=T,$t.enabled=z,$t.autoUpdate=Z,$t.needsUpdate=V,$t.type=W}function Vn(T){Jt("WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function Wn(T){let z=T.target;z.removeEventListener("dispose",Wn),uf(z)}function uf(T){df(T),X.remove(T)}function df(T){let z=X.get(T).programs;z!==void 0&&(z.forEach(function(Z){xt.releaseProgram(Z)}),T.isShaderMaterial&&xt.releaseShaderCache(T))}this.renderBufferDirect=function(T,z,Z,V,W,At){z===null&&(z=Ht);let Dt=W.isMesh&&W.matrixWorld.determinantAffine()<0,wt=mf(T,z,Z,V,W);y.setMaterial(V,Dt);let Bt=Z.index,kt=1;if(V.wireframe===!0){if(Bt=Q.getWireframeAttribute(Z),Bt===void 0)return;kt=2}let ne=Z.drawRange,oe=Z.attributes.position,Wt=ne.start*kt,me=(ne.start+ne.count)*kt;At!==null&&(Wt=Math.max(Wt,At.start*kt),me=Math.min(me,(At.start+At.count)*kt)),Bt!==null?(Wt=Math.max(Wt,0),me=Math.min(me,Bt.count)):oe!=null&&(Wt=Math.max(Wt,0),me=Math.min(me,oe.count));let Ne=me-Wt;if(Ne<0||Ne===1/0)return;Rt.setup(W,V,wt,Z,Bt);let Le,_e=gt;if(Bt!==null&&(Le=mt.get(Bt),_e=tt,_e.setIndex(Le)),W.isMesh)V.wireframe===!0?(y.setLineWidth(V.wireframeLinewidth*te()),_e.setMode(U.LINES)):_e.setMode(U.TRIANGLES);else if(W.isLine){let je=V.linewidth;je===void 0&&(je=1),y.setLineWidth(je*te()),W.isLineSegments?_e.setMode(U.LINES):W.isLineLoop?_e.setMode(U.LINE_LOOP):_e.setMode(U.LINE_STRIP)}else W.isPoints?_e.setMode(U.POINTS):W.isSprite&&_e.setMode(U.TRIANGLES);if(W.isBatchedMesh)if(le.get("WEBGL_multi_draw"))_e.renderMultiDraw(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount);else{let je=W._multiDrawStarts,Lt=W._multiDrawCounts,gn=W._multiDrawCount,ue=Bt?mt.get(Bt).bytesPerElement:1,wn=X.get(V).currentProgram.getUniforms();for(let Xn=0;Xn<gn;Xn++)wn.setValue(U,"_gl_DrawID",Xn),_e.render(je[Xn]/ue,Lt[Xn])}else if(W.isInstancedMesh)_e.renderInstances(Wt,Ne,W.count);else if(Z.isInstancedBufferGeometry){let je=Z._maxInstanceCount!==void 0?Z._maxInstanceCount:1/0,Lt=Math.min(Z.instanceCount,je);_e.renderInstances(Wt,Ne,Lt)}else _e.render(Wt,Ne)};function Mh(T,z,Z){T.transparent===!0&&T.side===Ce&&T.forceSinglePass===!1?(T.side=Je,T.needsUpdate=!0,oa(T,z,Z),T.side=fi,T.needsUpdate=!0,oa(T,z,Z),T.side=Ce):oa(T,z,Z)}this.compile=function(T,z,Z=null){Z===null&&(Z=T),S=_t.get(Z),S.init(z),x.push(S),Z.traverseVisible(function(W){W.isLight&&W.layers.test(z.layers)&&(S.pushLight(W),W.castShadow&&S.pushShadow(W))}),T!==Z&&T.traverseVisible(function(W){W.isLight&&W.layers.test(z.layers)&&(S.pushLight(W),W.castShadow&&S.pushShadow(W))}),S.setupLights();let V=new Set;return T.traverse(function(W){if(!(W.isMesh||W.isPoints||W.isLine||W.isSprite))return;let At=W.material;if(At)if(Array.isArray(At))for(let Dt=0;Dt<At.length;Dt++){let wt=At[Dt];Mh(wt,Z,W),V.add(wt)}else Mh(At,Z,W),V.add(At)}),S=x.pop(),V},this.compileAsync=function(T,z,Z=null){let V=this.compile(T,z,Z);return new Promise(W=>{function At(){if(V.forEach(function(Dt){X.get(Dt).currentProgram.isReady()&&V.delete(Dt)}),V.size===0){W(T);return}setTimeout(At,10)}le.get("KHR_parallel_shader_compile")!==null?At():setTimeout(At,10)})};let Il=null;function ff(T){Il&&Il(T)}function Sh(){Vi.stop()}function bh(){Vi.start()}let Vi=new pd;Vi.setAnimationLoop(ff),typeof self<"u"&&Vi.setContext(self),this.setAnimationLoop=function(T){Il=T,Ft.setAnimationLoop(T),T===null?Vi.stop():Vi.start()},Ft.addEventListener("sessionstart",Sh),Ft.addEventListener("sessionend",bh),this.render=function(T,z){if(z!==void 0&&z.isCamera!==!0){Jt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;P!==null&&P.renderStart(T,z);let Z=Ft.enabled===!0&&Ft.isPresenting===!0,V=b!==null&&(H===null||Z)&&b.begin(R,H);if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),z.parent===null&&z.matrixWorldAutoUpdate===!0&&z.updateMatrixWorld(),Ft.enabled===!0&&Ft.isPresenting===!0&&(b===null||b.isCompositing()===!1)&&(Ft.cameraAutoUpdate===!0&&Ft.updateCamera(z),z=Ft.getCamera()),T.isScene===!0&&T.onBeforeRender(R,T,z,H),S=_t.get(T,x.length),S.init(z),S.state.textureUnits=K.getTextureUnits(),x.push(S),Et.multiplyMatrices(z.projectionMatrix,z.matrixWorldInverse),j.setFromProjectionMatrix(Et,On,z.reversedDepth),lt=this.localClippingEnabled,ct=Xt.init(this.clippingPlanes,lt),A=St.get(T,w.length),A.init(),w.push(A),Ft.enabled===!0&&Ft.isPresenting===!0){let Dt=R.xr.getDepthSensingMesh();Dt!==null&&Pl(Dt,z,-1/0,R.sortObjects)}Pl(T,z,0,R.sortObjects),A.finish(),R.sortObjects===!0&&A.sort(ht,Ot,z.reversedDepth),Kt=Ft.enabled===!1||Ft.isPresenting===!1||Ft.hasDepthSensing()===!1,Kt&&ee.addToRenderList(A,T),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ct===!0&&Xt.beginShadows();let W=S.state.shadowsArray;if($t.render(W,T,z),ct===!0&&Xt.endShadows(),(V&&b.hasRenderPass())===!1){let Dt=A.opaque,wt=A.transmissive;if(S.setupLights(),z.isArrayCamera){let Bt=z.cameras;if(wt.length>0)for(let kt=0,ne=Bt.length;kt<ne;kt++){let oe=Bt[kt];wh(Dt,wt,T,oe)}Kt&&ee.render(T);for(let kt=0,ne=Bt.length;kt<ne;kt++){let oe=Bt[kt];Eh(A,T,oe,oe.viewport)}}else wt.length>0&&wh(Dt,wt,T,z),Kt&&ee.render(T),Eh(A,T,z)}H!==null&&F===0&&(K.updateMultisampleRenderTarget(H),K.updateRenderTargetMipmap(H)),V&&b.end(R),T.isScene===!0&&T.onAfterRender(R,T,z),Rt.resetDefaultState(),Y=-1,J=null,x.pop(),x.length>0?(S=x[x.length-1],K.setTextureUnits(S.state.textureUnits),ct===!0&&Xt.setGlobalState(R.clippingPlanes,S.state.camera)):S=null,w.pop(),w.length>0?A=w[w.length-1]:A=null,P!==null&&P.renderEnd()};function Pl(T,z,Z,V){if(T.visible===!1)return;if(T.layers.test(z.layers)){if(T.isGroup)Z=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(z);else if(T.isLightProbeGrid)S.pushLightProbeGrid(T);else if(T.isLight)S.pushLight(T),T.castShadow&&S.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||j.intersectsSprite(T)){V&&Yt.setFromMatrixPosition(T.matrixWorld).applyMatrix4(Et);let Dt=nt.update(T),wt=T.material;wt.visible&&A.push(T,Dt,wt,Z,Yt.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||j.intersectsObject(T))){let Dt=nt.update(T),wt=T.material;if(V&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Yt.copy(T.boundingSphere.center)):(Dt.boundingSphere===null&&Dt.computeBoundingSphere(),Yt.copy(Dt.boundingSphere.center)),Yt.applyMatrix4(T.matrixWorld).applyMatrix4(Et)),Array.isArray(wt)){let Bt=Dt.groups;for(let kt=0,ne=Bt.length;kt<ne;kt++){let oe=Bt[kt],Wt=wt[oe.materialIndex];Wt&&Wt.visible&&A.push(T,Dt,Wt,Z,Yt.z,oe)}}else wt.visible&&A.push(T,Dt,wt,Z,Yt.z,null)}}let At=T.children;for(let Dt=0,wt=At.length;Dt<wt;Dt++)Pl(At[Dt],z,Z,V)}function Eh(T,z,Z,V){let{opaque:W,transmissive:At,transparent:Dt}=T;S.setupLightsView(Z),ct===!0&&Xt.setGlobalState(R.clippingPlanes,Z),V&&y.viewport($.copy(V)),W.length>0&&aa(W,z,Z),At.length>0&&aa(At,z,Z),Dt.length>0&&aa(Dt,z,Z),y.buffers.depth.setTest(!0),y.buffers.depth.setMask(!0),y.buffers.color.setMask(!0),y.setPolygonOffset(!1)}function wh(T,z,Z,V){if((Z.isScene===!0?Z.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[V.id]===void 0){let Wt=le.has("EXT_color_buffer_half_float")||le.has("EXT_color_buffer_float");S.state.transmissionRenderTarget[V.id]=new yn(1,1,{generateMipmaps:!0,type:Wt?ti:pn,minFilter:jn,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:he.workingColorSpace})}let At=S.state.transmissionRenderTarget[V.id],Dt=V.viewport||$;At.setSize(Dt.z*R.transmissionResolutionScale,Dt.w*R.transmissionResolutionScale);let wt=R.getRenderTarget(),Bt=R.getActiveCubeFace(),kt=R.getActiveMipmapLevel();R.setRenderTarget(At),R.getClearColor(Tt),vt=R.getClearAlpha(),vt<1&&R.setClearColor(16777215,.5),R.clear(),Kt&&ee.render(Z);let ne=R.toneMapping;R.toneMapping=zn;let oe=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),S.setupLightsView(V),ct===!0&&Xt.setGlobalState(R.clippingPlanes,V),aa(T,Z,V),K.updateMultisampleRenderTarget(At),K.updateRenderTargetMipmap(At),le.has("WEBGL_multisampled_render_to_texture")===!1){let Wt=!1;for(let me=0,Ne=z.length;me<Ne;me++){let Le=z[me],{object:_e,geometry:je,material:Lt,group:gn}=Le;if(Lt.side===Ce&&_e.layers.test(V.layers)){let ue=Lt.side;Lt.side=Je,Lt.needsUpdate=!0,Th(_e,Z,V,je,Lt,gn),Lt.side=ue,Lt.needsUpdate=!0,Wt=!0}}Wt===!0&&(K.updateMultisampleRenderTarget(At),K.updateRenderTargetMipmap(At))}R.setRenderTarget(wt,Bt,kt),R.setClearColor(Tt,vt),oe!==void 0&&(V.viewport=oe),R.toneMapping=ne}function aa(T,z,Z){let V=z.isScene===!0?z.overrideMaterial:null;for(let W=0,At=T.length;W<At;W++){let Dt=T[W],{object:wt,geometry:Bt,group:kt}=Dt,ne=Dt.material;ne.allowOverride===!0&&V!==null&&(ne=V),wt.layers.test(Z.layers)&&Th(wt,z,Z,Bt,ne,kt)}}function Th(T,z,Z,V,W,At){T.onBeforeRender(R,z,Z,V,W,At),T.modelViewMatrix.multiplyMatrices(Z.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),W.onBeforeRender(R,z,Z,V,T,At),W.transparent===!0&&W.side===Ce&&W.forceSinglePass===!1?(W.side=Je,W.needsUpdate=!0,R.renderBufferDirect(Z,z,V,W,T,At),W.side=fi,W.needsUpdate=!0,R.renderBufferDirect(Z,z,V,W,T,At),W.side=Ce):R.renderBufferDirect(Z,z,V,W,T,At),T.onAfterRender(R,z,Z,V,W,At)}function oa(T,z,Z){z.isScene!==!0&&(z=Ht);let V=X.get(T),W=S.state.lights,At=S.state.shadowsArray,Dt=W.state.version,wt=xt.getParameters(T,W.state,At,z,Z,S.state.lightProbeGridArray),Bt=xt.getProgramCacheKey(wt),kt=V.programs;V.environment=T.isMeshStandardMaterial||T.isMeshLambertMaterial||T.isMeshPhongMaterial?z.environment:null,V.fog=z.fog;let ne=T.isMeshStandardMaterial||T.isMeshLambertMaterial&&!T.envMap||T.isMeshPhongMaterial&&!T.envMap;V.envMap=dt.get(T.envMap||V.environment,ne),V.envMapRotation=V.environment!==null&&T.envMap===null?z.environmentRotation:T.envMapRotation,kt===void 0&&(T.addEventListener("dispose",Wn),kt=new Map,V.programs=kt);let oe=kt.get(Bt);if(oe!==void 0){if(V.currentProgram===oe&&V.lightsStateVersion===Dt)return Rh(T,wt),oe}else wt.uniforms=xt.getUniforms(T),P!==null&&T.isNodeMaterial&&P.build(T,Z,wt),T.onBeforeCompile(wt,R),oe=xt.acquireProgram(wt,Bt),kt.set(Bt,oe),V.uniforms=wt.uniforms;let Wt=V.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Wt.clippingPlanes=Xt.uniform),Rh(T,wt),V.needsLights=xf(T),V.lightsStateVersion=Dt,V.needsLights&&(Wt.ambientLightColor.value=W.state.ambient,Wt.lightProbe.value=W.state.probe,Wt.directionalLights.value=W.state.directional,Wt.directionalLightShadows.value=W.state.directionalShadow,Wt.spotLights.value=W.state.spot,Wt.spotLightShadows.value=W.state.spotShadow,Wt.rectAreaLights.value=W.state.rectArea,Wt.ltc_1.value=W.state.rectAreaLTC1,Wt.ltc_2.value=W.state.rectAreaLTC2,Wt.pointLights.value=W.state.point,Wt.pointLightShadows.value=W.state.pointShadow,Wt.hemisphereLights.value=W.state.hemi,Wt.directionalShadowMatrix.value=W.state.directionalShadowMatrix,Wt.spotLightMatrix.value=W.state.spotLightMatrix,Wt.spotLightMap.value=W.state.spotLightMap,Wt.pointShadowMatrix.value=W.state.pointShadowMatrix),V.lightProbeGrid=S.state.lightProbeGridArray.length>0,V.currentProgram=oe,V.uniformsList=null,oe}function Ah(T){if(T.uniformsList===null){let z=T.currentProgram.getUniforms();T.uniformsList=Gs.seqWithValue(z.seq,T.uniforms)}return T.uniformsList}function Rh(T,z){let Z=X.get(T);Z.outputColorSpace=z.outputColorSpace,Z.batching=z.batching,Z.batchingColor=z.batchingColor,Z.instancing=z.instancing,Z.instancingColor=z.instancingColor,Z.instancingMorph=z.instancingMorph,Z.skinning=z.skinning,Z.morphTargets=z.morphTargets,Z.morphNormals=z.morphNormals,Z.morphColors=z.morphColors,Z.morphTargetsCount=z.morphTargetsCount,Z.numClippingPlanes=z.numClippingPlanes,Z.numIntersection=z.numClipIntersection,Z.vertexAlphas=z.vertexAlphas,Z.vertexTangents=z.vertexTangents,Z.toneMapping=z.toneMapping}function pf(T,z){if(T.length===0)return null;if(T.length===1)return T[0].texture!==null?T[0]:null;_.setFromMatrixPosition(z.matrixWorld);for(let Z=0,V=T.length;Z<V;Z++){let W=T[Z];if(W.texture!==null&&W.boundingBox.containsPoint(_))return W}return null}function mf(T,z,Z,V,W){z.isScene!==!0&&(z=Ht),K.resetTextureUnits();let At=z.fog,Dt=V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial?z.environment:null,wt=H===null?R.outputColorSpace:H.isXRRenderTarget===!0?H.texture.colorSpace:he.workingColorSpace,Bt=V.isMeshStandardMaterial||V.isMeshLambertMaterial&&!V.envMap||V.isMeshPhongMaterial&&!V.envMap,kt=dt.get(V.envMap||Dt,Bt),ne=V.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,oe=!!Z.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Wt=!!Z.morphAttributes.position,me=!!Z.morphAttributes.normal,Ne=!!Z.morphAttributes.color,Le=zn;V.toneMapped&&(H===null||H.isXRRenderTarget===!0)&&(Le=R.toneMapping);let _e=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,je=_e!==void 0?_e.length:0,Lt=X.get(V),gn=S.state.lights;if(ct===!0&&(lt===!0||T!==J)){let Me=T===J&&V.id===Y;Xt.setState(V,T,Me)}let ue=!1;V.version===Lt.__version?(Lt.needsLights&&Lt.lightsStateVersion!==gn.state.version||Lt.outputColorSpace!==wt||W.isBatchedMesh&&Lt.batching===!1||!W.isBatchedMesh&&Lt.batching===!0||W.isBatchedMesh&&Lt.batchingColor===!0&&W.colorTexture===null||W.isBatchedMesh&&Lt.batchingColor===!1&&W.colorTexture!==null||W.isInstancedMesh&&Lt.instancing===!1||!W.isInstancedMesh&&Lt.instancing===!0||W.isSkinnedMesh&&Lt.skinning===!1||!W.isSkinnedMesh&&Lt.skinning===!0||W.isInstancedMesh&&Lt.instancingColor===!0&&W.instanceColor===null||W.isInstancedMesh&&Lt.instancingColor===!1&&W.instanceColor!==null||W.isInstancedMesh&&Lt.instancingMorph===!0&&W.morphTexture===null||W.isInstancedMesh&&Lt.instancingMorph===!1&&W.morphTexture!==null||Lt.envMap!==kt||V.fog===!0&&Lt.fog!==At||Lt.numClippingPlanes!==void 0&&(Lt.numClippingPlanes!==Xt.numPlanes||Lt.numIntersection!==Xt.numIntersection)||Lt.vertexAlphas!==ne||Lt.vertexTangents!==oe||Lt.morphTargets!==Wt||Lt.morphNormals!==me||Lt.morphColors!==Ne||Lt.toneMapping!==Le||Lt.morphTargetsCount!==je||!!Lt.lightProbeGrid!=S.state.lightProbeGridArray.length>0)&&(ue=!0):(ue=!0,Lt.__version=V.version);let wn=Lt.currentProgram;ue===!0&&(wn=oa(V,z,W),P&&V.isNodeMaterial&&P.onUpdateProgram(V,wn,Lt));let Xn=!1,vi=!1,cs=!1,ye=wn.getUniforms(),Fe=Lt.uniforms;if(y.useProgram(wn.program)&&(Xn=!0,vi=!0,cs=!0),V.id!==Y&&(Y=V.id,vi=!0),Lt.needsLights){let Me=pf(S.state.lightProbeGridArray,W);Lt.lightProbeGrid!==Me&&(Lt.lightProbeGrid=Me,vi=!0)}if(Xn||J!==T){y.buffers.depth.getReversed()&&T.reversedDepth!==!0&&(T._reversedDepth=!0,T.updateProjectionMatrix()),ye.setValue(U,"projectionMatrix",T.projectionMatrix),ye.setValue(U,"viewMatrix",T.matrixWorldInverse);let Si=ye.map.cameraPosition;Si!==void 0&&Si.setValue(U,Mt.setFromMatrixPosition(T.matrixWorld)),C.logarithmicDepthBuffer&&ye.setValue(U,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&ye.setValue(U,"isOrthographic",T.isOrthographicCamera===!0),J!==T&&(J=T,vi=!0,cs=!0)}if(Lt.needsLights&&(gn.state.directionalShadowMap.length>0&&ye.setValue(U,"directionalShadowMap",gn.state.directionalShadowMap,K),gn.state.spotShadowMap.length>0&&ye.setValue(U,"spotShadowMap",gn.state.spotShadowMap,K),gn.state.pointShadowMap.length>0&&ye.setValue(U,"pointShadowMap",gn.state.pointShadowMap,K)),W.isSkinnedMesh){ye.setOptional(U,W,"bindMatrix"),ye.setOptional(U,W,"bindMatrixInverse");let Me=W.skeleton;Me&&(Me.boneTexture===null&&Me.computeBoneTexture(),ye.setValue(U,"boneTexture",Me.boneTexture,K))}W.isBatchedMesh&&(ye.setOptional(U,W,"batchingTexture"),ye.setValue(U,"batchingTexture",W._matricesTexture,K),ye.setOptional(U,W,"batchingIdTexture"),ye.setValue(U,"batchingIdTexture",W._indirectTexture,K),ye.setOptional(U,W,"batchingColorTexture"),W._colorsTexture!==null&&ye.setValue(U,"batchingColorTexture",W._colorsTexture,K));let Mi=Z.morphAttributes;if((Mi.position!==void 0||Mi.normal!==void 0||Mi.color!==void 0)&&B.update(W,Z,wn),(vi||Lt.receiveShadow!==W.receiveShadow)&&(Lt.receiveShadow=W.receiveShadow,ye.setValue(U,"receiveShadow",W.receiveShadow)),(V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial)&&V.envMap===null&&z.environment!==null&&(Fe.envMapIntensity.value=z.environmentIntensity),Fe.dfgLUT!==void 0&&(Fe.dfgLUT.value=u_()),vi){if(ye.setValue(U,"toneMappingExposure",R.toneMappingExposure),Lt.needsLights&&gf(Fe,cs),At&&V.fog===!0&&Gt.refreshFogUniforms(Fe,At),Gt.refreshMaterialUniforms(Fe,V,et,rt,S.state.transmissionRenderTarget[T.id]),Lt.needsLights&&Lt.lightProbeGrid){let Me=Lt.lightProbeGrid;Fe.probesSH.value=Me.texture,Fe.probesMin.value.copy(Me.boundingBox.min),Fe.probesMax.value.copy(Me.boundingBox.max),Fe.probesResolution.value.copy(Me.resolution)}Gs.upload(U,Ah(Lt),Fe,K)}if(V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(Gs.upload(U,Ah(Lt),Fe,K),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&ye.setValue(U,"center",W.center),ye.setValue(U,"modelViewMatrix",W.modelViewMatrix),ye.setValue(U,"normalMatrix",W.normalMatrix),ye.setValue(U,"modelMatrix",W.matrixWorld),V.uniformsGroups!==void 0){let Me=V.uniformsGroups;for(let Si=0,hs=Me.length;Si<hs;Si++){let Ch=Me[Si];at.update(Ch,wn),at.bind(Ch,wn)}}return wn}function gf(T,z){T.ambientLightColor.needsUpdate=z,T.lightProbe.needsUpdate=z,T.directionalLights.needsUpdate=z,T.directionalLightShadows.needsUpdate=z,T.pointLights.needsUpdate=z,T.pointLightShadows.needsUpdate=z,T.spotLights.needsUpdate=z,T.spotLightShadows.needsUpdate=z,T.rectAreaLights.needsUpdate=z,T.hemisphereLights.needsUpdate=z}function xf(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return k},this.getActiveMipmapLevel=function(){return F},this.getRenderTarget=function(){return H},this.setRenderTargetTextures=function(T,z,Z){let V=X.get(T);V.__autoAllocateDepthBuffer=T.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),X.get(T.texture).__webglTexture=z,X.get(T.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:Z,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(T,z){let Z=X.get(T);Z.__webglFramebuffer=z,Z.__useDefaultFramebuffer=z===void 0},this.setRenderTarget=function(T,z=0,Z=0){H=T,k=z,F=Z;let V=null,W=!1,At=!1;if(T){let wt=X.get(T);if(wt.__useDefaultFramebuffer!==void 0){y.bindFramebuffer(U.FRAMEBUFFER,wt.__webglFramebuffer),$.copy(T.viewport),it.copy(T.scissor),st=T.scissorTest,y.viewport($),y.scissor(it),y.setScissorTest(st),Y=-1;return}else if(wt.__webglFramebuffer===void 0)K.setupRenderTarget(T);else if(wt.__hasExternalTextures)K.rebindTextures(T,X.get(T.texture).__webglTexture,X.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let ne=T.depthTexture;if(wt.__boundDepthTexture!==ne){if(ne!==null&&X.has(ne)&&(T.width!==ne.image.width||T.height!==ne.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");K.setupDepthRenderbuffer(T)}}let Bt=T.texture;(Bt.isData3DTexture||Bt.isDataArrayTexture||Bt.isCompressedArrayTexture)&&(At=!0);let kt=X.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(kt[z])?V=kt[z][Z]:V=kt[z],W=!0):T.samples>0&&K.useMultisampledRTT(T)===!1?V=X.get(T).__webglMultisampledFramebuffer:Array.isArray(kt)?V=kt[Z]:V=kt,$.copy(T.viewport),it.copy(T.scissor),st=T.scissorTest}else $.copy(Nt).multiplyScalar(et).floor(),it.copy(ae).multiplyScalar(et).floor(),st=It;if(Z!==0&&(V=N),y.bindFramebuffer(U.FRAMEBUFFER,V)&&y.drawBuffers(T,V),y.viewport($),y.scissor(it),y.setScissorTest(st),W){let wt=X.get(T.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+z,wt.__webglTexture,Z)}else if(At){let wt=z;for(let Bt=0;Bt<T.textures.length;Bt++){let kt=X.get(T.textures[Bt]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+Bt,kt.__webglTexture,Z,wt)}}else if(T!==null&&Z!==0){let wt=X.get(T.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,wt.__webglTexture,Z)}Y=-1},this.readRenderTargetPixels=function(T,z,Z,V,W,At,Dt,wt=0){if(!(T&&T.isWebGLRenderTarget)){Jt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Bt=X.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Dt!==void 0&&(Bt=Bt[Dt]),Bt){y.bindFramebuffer(U.FRAMEBUFFER,Bt);try{let kt=T.textures[wt],ne=kt.format,oe=kt.type;if(T.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+wt),!C.textureFormatReadable(ne)){Jt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!C.textureTypeReadable(oe)){Jt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}z>=0&&z<=T.width-V&&Z>=0&&Z<=T.height-W&&U.readPixels(z,Z,V,W,yt.convert(ne),yt.convert(oe),At)}finally{let kt=H!==null?X.get(H).__webglFramebuffer:null;y.bindFramebuffer(U.FRAMEBUFFER,kt)}}},this.readRenderTargetPixelsAsync=async function(T,z,Z,V,W,At,Dt,wt=0){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Bt=X.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Dt!==void 0&&(Bt=Bt[Dt]),Bt)if(z>=0&&z<=T.width-V&&Z>=0&&Z<=T.height-W){y.bindFramebuffer(U.FRAMEBUFFER,Bt);let kt=T.textures[wt],ne=kt.format,oe=kt.type;if(T.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+wt),!C.textureFormatReadable(ne))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!C.textureTypeReadable(oe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Wt=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,Wt),U.bufferData(U.PIXEL_PACK_BUFFER,At.byteLength,U.STREAM_READ),U.readPixels(z,Z,V,W,yt.convert(ne),yt.convert(oe),0);let me=H!==null?X.get(H).__webglFramebuffer:null;y.bindFramebuffer(U.FRAMEBUFFER,me);let Ne=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await Bu(U,Ne,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,Wt),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,At),U.deleteBuffer(Wt),U.deleteSync(Ne),At}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(T,z=null,Z=0){let V=Math.pow(2,-Z),W=Math.floor(T.image.width*V),At=Math.floor(T.image.height*V),Dt=z!==null?z.x:0,wt=z!==null?z.y:0;K.setTexture2D(T,0),U.copyTexSubImage2D(U.TEXTURE_2D,Z,0,0,Dt,wt,W,At),y.unbindTexture()},this.copyTextureToTexture=function(T,z,Z=null,V=null,W=0,At=0){let Dt,wt,Bt,kt,ne,oe,Wt,me,Ne,Le=T.isCompressedTexture?T.mipmaps[At]:T.image;if(Z!==null)Dt=Z.max.x-Z.min.x,wt=Z.max.y-Z.min.y,Bt=Z.isBox3?Z.max.z-Z.min.z:1,kt=Z.min.x,ne=Z.min.y,oe=Z.isBox3?Z.min.z:0;else{let Fe=Math.pow(2,-W);Dt=Math.floor(Le.width*Fe),wt=Math.floor(Le.height*Fe),T.isDataArrayTexture?Bt=Le.depth:T.isData3DTexture?Bt=Math.floor(Le.depth*Fe):Bt=1,kt=0,ne=0,oe=0}V!==null?(Wt=V.x,me=V.y,Ne=V.z):(Wt=0,me=0,Ne=0);let _e=yt.convert(z.format),je=yt.convert(z.type),Lt;z.isData3DTexture?(K.setTexture3D(z,0),Lt=U.TEXTURE_3D):z.isDataArrayTexture||z.isCompressedArrayTexture?(K.setTexture2DArray(z,0),Lt=U.TEXTURE_2D_ARRAY):(K.setTexture2D(z,0),Lt=U.TEXTURE_2D),y.activeTexture(U.TEXTURE0),y.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,z.flipY),y.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,z.premultiplyAlpha),y.pixelStorei(U.UNPACK_ALIGNMENT,z.unpackAlignment);let gn=y.getParameter(U.UNPACK_ROW_LENGTH),ue=y.getParameter(U.UNPACK_IMAGE_HEIGHT),wn=y.getParameter(U.UNPACK_SKIP_PIXELS),Xn=y.getParameter(U.UNPACK_SKIP_ROWS),vi=y.getParameter(U.UNPACK_SKIP_IMAGES);y.pixelStorei(U.UNPACK_ROW_LENGTH,Le.width),y.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Le.height),y.pixelStorei(U.UNPACK_SKIP_PIXELS,kt),y.pixelStorei(U.UNPACK_SKIP_ROWS,ne),y.pixelStorei(U.UNPACK_SKIP_IMAGES,oe);let cs=T.isDataArrayTexture||T.isData3DTexture,ye=z.isDataArrayTexture||z.isData3DTexture;if(T.isDepthTexture){let Fe=X.get(T),Mi=X.get(z),Me=X.get(Fe.__renderTarget),Si=X.get(Mi.__renderTarget);y.bindFramebuffer(U.READ_FRAMEBUFFER,Me.__webglFramebuffer),y.bindFramebuffer(U.DRAW_FRAMEBUFFER,Si.__webglFramebuffer);for(let hs=0;hs<Bt;hs++)cs&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,X.get(T).__webglTexture,W,oe+hs),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,X.get(z).__webglTexture,At,Ne+hs)),U.blitFramebuffer(kt,ne,Dt,wt,Wt,me,Dt,wt,U.DEPTH_BUFFER_BIT,U.NEAREST);y.bindFramebuffer(U.READ_FRAMEBUFFER,null),y.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(W!==0||T.isRenderTargetTexture||X.has(T)){let Fe=X.get(T),Mi=X.get(z);y.bindFramebuffer(U.READ_FRAMEBUFFER,O),y.bindFramebuffer(U.DRAW_FRAMEBUFFER,D);for(let Me=0;Me<Bt;Me++)cs?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Fe.__webglTexture,W,oe+Me):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Fe.__webglTexture,W),ye?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Mi.__webglTexture,At,Ne+Me):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Mi.__webglTexture,At),W!==0?U.blitFramebuffer(kt,ne,Dt,wt,Wt,me,Dt,wt,U.COLOR_BUFFER_BIT,U.NEAREST):ye?U.copyTexSubImage3D(Lt,At,Wt,me,Ne+Me,kt,ne,Dt,wt):U.copyTexSubImage2D(Lt,At,Wt,me,kt,ne,Dt,wt);y.bindFramebuffer(U.READ_FRAMEBUFFER,null),y.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else ye?T.isDataTexture||T.isData3DTexture?U.texSubImage3D(Lt,At,Wt,me,Ne,Dt,wt,Bt,_e,je,Le.data):z.isCompressedArrayTexture?U.compressedTexSubImage3D(Lt,At,Wt,me,Ne,Dt,wt,Bt,_e,Le.data):U.texSubImage3D(Lt,At,Wt,me,Ne,Dt,wt,Bt,_e,je,Le):T.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,At,Wt,me,Dt,wt,_e,je,Le.data):T.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,At,Wt,me,Le.width,Le.height,_e,Le.data):U.texSubImage2D(U.TEXTURE_2D,At,Wt,me,Dt,wt,_e,je,Le);y.pixelStorei(U.UNPACK_ROW_LENGTH,gn),y.pixelStorei(U.UNPACK_IMAGE_HEIGHT,ue),y.pixelStorei(U.UNPACK_SKIP_PIXELS,wn),y.pixelStorei(U.UNPACK_SKIP_ROWS,Xn),y.pixelStorei(U.UNPACK_SKIP_IMAGES,vi),At===0&&z.generateMipmaps&&U.generateMipmap(Lt),y.unbindTexture()},this.initRenderTarget=function(T){X.get(T).__webglFramebuffer===void 0&&K.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?K.setTextureCube(T,0):T.isData3DTexture?K.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?K.setTexture2DArray(T,0):K.setTexture2D(T,0),y.unbindTexture()},this.resetState=function(){k=0,F=0,H=null,y.reset(),Rt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return On}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=he._getDrawingBufferColorSpace(t),e.unpackColorSpace=he._getUnpackColorSpace()}};function d_(i){let t=i>>>0;return()=>{t+=1831565813;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var cn=d_(19870219),ot=(i,t)=>i+cn()*(t-i),ze=i=>i[cn()*i.length|0],si=i=>cn()<i,ii=i=>"#"+i.toString(16).padStart(6,"0"),qe={sun:16766116,skyTop:4159147,skyMid:9681362,skyHaze:14472125,cloud:16774112,asphalt:5066580,paver:11577496,kerb:11907236,conc:11052187,trim:14209731,glassBlue:6058371,glassGrey:6976122,leafDark:2833697,leafMid:4875312,leafLight:7768383,trunk:5457981,yellow:14201930};function Pn(i){let t=document.createElement("canvas");return t.width=t.height=i,[t,t.getContext("2d")]}function Ln(i,t,e=!0){let n=new Kn(i);return n.wrapS=n.wrapT=ws,t&&n.repeat.set(t[0],t[1]),e&&(n.colorSpace=De),n.anisotropy=4,n}function Ws(i,t,e,n){for(let s=0;s<t;s++){let r=(cn()*2-1)*e;i.fillStyle=`rgba(${r>0?255:0},${r>0?255:0},${r>0?255:0},${Math.abs(r)/255})`,i.fillRect(cn()*n|0,cn()*n|0,1+(cn()*2|0),1+(cn()*2|0))}}function Md(){let[t,e]=Pn(256);e.fillStyle=ii(qe.asphalt),e.fillRect(0,0,256,256);for(let n=0;n<5200;n++){let s=ot(-24,24);e.fillStyle=`rgba(${128+s},${128+s},${130+s},${ot(.05,.24)})`,e.fillRect(ot(0,256),ot(0,256),ot(1,2.6),ot(1,2.6))}for(let n=0;n<8;n++){e.strokeStyle=`rgba(28,28,30,${ot(.15,.4)})`,e.lineWidth=ot(.8,2.4),e.beginPath();let s=ot(0,256),r=ot(0,256);e.moveTo(s,r);for(let a=0;a<6;a++)s+=ot(-40,40),r+=ot(-40,40),e.lineTo(s,r);e.stroke()}return Ln(t,[30,30])}function Sd(){let[t,e]=Pn(256);e.fillStyle=ii(qe.paver),e.fillRect(0,0,256,256);let n=3,s=256/n;for(let r=0;r<n;r++)for(let a=0;a<n;a++){let o=ot(-13,11);e.fillStyle=`rgb(${178+o},${170+o},${154+o})`,e.fillRect(a*s+1.6,r*s+1.6,s-3.2,s-3.2);for(let l=0;l<260;l++){let c=ot(-30,26);e.fillStyle=`rgba(${170+c},${163+c},${148+c},${ot(.2,.6)})`,e.fillRect(a*s+ot(2,s-3),r*s+ot(2,s-3),ot(1,2.4),ot(1,2.4))}}return Ws(e,2600,18,256),Ln(t,[1,1])}function Gi(i,t=.55){let[n,s]=Pn(256);s.fillStyle=ii(i),s.fillRect(0,0,256,256);for(let r=0;r<24;r++){let a=ot(0,256),o=ot(0,256),l=ot(18,70),c=s.createRadialGradient(a,o,0,a,o,l);c.addColorStop(0,`rgba(0,0,0,${ot(.02,.07)*t})`),c.addColorStop(1,"rgba(0,0,0,0)"),s.fillStyle=c,s.fillRect(0,0,256,256)}for(let r=0;r<34;r++){let a=ot(.6,2.6),o=ot(30,170),l=ot(0,256),c=ot(0,256*.5),h=s.createLinearGradient(0,c,0,c+o);h.addColorStop(0,`rgba(54,48,40,${ot(.05,.15)*t})`),h.addColorStop(1,"rgba(54,48,40,0)"),s.fillStyle=h,s.fillRect(l,c,a,o)}return Ws(s,4800,24,256),Ln(n,[1,1])}function Xs(i,t,e=8){let[s,r]=Pn(256),a=256/e;r.fillStyle=ii(i),r.fillRect(0,0,256,256);for(let o=0;o<e;o++){for(let c=0;c<8;c++){let h=ot(-26,30);r.fillStyle=`rgba(${118+h},${138+h},${156+h},${ot(.25,.75)})`,r.fillRect(c*(256/8)+1,o*a+2,256/8-2,a*.62)}r.fillStyle=ii(t),r.fillRect(0,o*a+a*.66,256,a*.3);let l=r.createLinearGradient(0,o*a,0,o*a+a*.62);l.addColorStop(0,"rgba(232,243,251,0.52)"),l.addColorStop(1,"rgba(232,243,251,0.06)"),r.fillStyle=l,r.fillRect(0,o*a+2,256,a*.6)}r.fillStyle=ii(t);for(let o=0;o<=8;o++)r.fillRect(o*(256/8)-1.2,0,2.4,256);return Ln(s,[1,1])}function fl(){let[t,e]=Pn(256);e.fillStyle="#2f3438",e.fillRect(0,0,256,256);let n=6,s=256/n;for(let r=0;r<n;r++){let a=ot(0,1),o=a>.72?[232,214,178]:a>.4?[206,200,190]:[176,182,186];e.fillStyle=`rgb(${o[0]},${o[1]},${o[2]})`,e.fillRect(r*s+3,16,s-6,194),e.fillStyle=`rgba(40,38,34,${ot(.18,.4)})`,e.fillRect(r*s+3,16,s-6,ot(20,60));let l=e.createLinearGradient(r*s,0,r*s+s,256);l.addColorStop(0,"rgba(255,255,255,0.22)"),l.addColorStop(.5,"rgba(255,255,255,0.02)"),l.addColorStop(1,"rgba(255,255,255,0.14)"),e.fillStyle=l,e.fillRect(r*s+3,16,s-6,194),e.fillStyle="#23272a",e.fillRect(r*s-2,0,4,256)}return e.fillStyle="#3a3f43",e.fillRect(0,0,256,16),e.fillStyle="#5b5554",e.fillRect(0,210,256,46),Ws(e,1800,16,256),Ln(t,[1,1])}function bd(){let[t,e]=Pn(256);e.fillStyle="#7d4f42",e.fillRect(0,0,256,256);for(let r=0;r<4200;r++){let a=ot(-20,22);e.fillStyle=`rgba(${142+a},${94+a},${78+a},${ot(.15,.5)})`,e.fillRect(ot(0,256),ot(0,256),ot(1,2.4),ot(1,2.4))}let n=9,s=256/n;for(let r=0;r<n;r++){e.fillStyle="rgba(38,44,50,0.86)",e.fillRect(r*s+s*.3,0,s*.4,256);let a=e.createLinearGradient(r*s,0,r*s+s,0);a.addColorStop(0,"rgba(198,214,226,0.16)"),a.addColorStop(1,"rgba(198,214,226,0)"),e.fillStyle=a,e.fillRect(r*s+s*.3,0,s*.4,256)}for(let r=0;r<8;r++)e.fillStyle="rgba(104,68,58,0.9)",e.fillRect(0,r*(256/8)-2,256,4);return Ln(t,[1,1])}function ih(){let[t,e]=Pn(256);e.fillStyle="#8ea6b8",e.fillRect(0,0,256,256);let n=12,s=256/n;for(let r=0;r<n;r++){for(let o=0;o<10;o++){let l=ot(-24,26);e.fillStyle=`rgba(${132+l},${154+l},${172+l},${ot(.3,.8)})`,e.fillRect(o*(256/10)+1,r*s+1,256/10-2,s*.72)}e.fillStyle="#6b757e",e.fillRect(0,r*s+s*.76,256,s*.22);let a=e.createLinearGradient(0,r*s,0,r*s+s*.72);a.addColorStop(0,"rgba(236,245,252,0.42)"),a.addColorStop(1,"rgba(236,245,252,0.04)"),e.fillStyle=a,e.fillRect(0,r*s+1,256,s*.7)}for(let r=0;r<=10;r++)e.fillStyle="#767f88",e.fillRect(r*(256/10)-1,0,2,256);return Ln(t,[1,1])}function pl(i){let[e,n]=Pn(256);n.fillStyle=ii(i),n.fillRect(0,0,256,256);for(let l=0;l<3600;l++){let c=ot(-18,16);n.fillStyle=`rgba(${168+c},${160+c},${146+c},${ot(.12,.4)})`,n.fillRect(ot(0,256),ot(0,256),ot(1,2.2),ot(1,2.2))}let s=7,r=8,a=256/s,o=256/r;for(let l=0;l<r;l++){for(let c=0;c<s;c++){let h=ot(0,1);n.fillStyle=h>.8?"#8d9aa2":h>.45?"#4d565e":"#39424a",n.fillRect(c*a+a*.22,l*o+o*.22,a*.56,o*.46),n.fillStyle="rgba(24,26,28,0.42)",n.fillRect(c*a+a*.22,l*o+o*.22,a*.56,o*.09)}n.fillStyle="rgba(150,142,128,0.55)",n.fillRect(0,l*o+o*.74,256,o*.16)}return Ws(n,2400,18,256),Ln(e,[1,1])}function sh(i){let[e,n]=Pn(256);n.fillStyle=ii(i),n.fillRect(0,0,256,256);let s=9,r=256/s,a=5,o=256/a;for(let l=0;l<s;l++){for(let c=0;c<a;c++)n.fillStyle="rgba(46,52,58,0.72)",n.fillRect(c*o+o*.14,l*r+r*.16,o*.72,r*.5),n.fillStyle="rgba(226,222,210,0.9)",n.fillRect(c*o+o*.14,l*r+r*.52,o*.72,r*.1);n.fillStyle="rgba(206,200,186,0.85)",n.fillRect(0,l*r+r*.66,256,r*.2)}return Ws(n,2e3,16,256),Ln(e,[1,1])}function Ed(i){let[e,n]=Pn(256);n.fillStyle=ii(i),n.fillRect(0,0,256,256);for(let l=0;l<2600;l++){let c=ot(-14,12);n.fillStyle=`rgba(${210+c},${204+c},${190+c},${ot(.08,.3)})`,n.fillRect(ot(0,256),ot(0,256),ot(1,2.4),ot(1,2.4))}let s=3,r=256/s,a=3,o=256/a;for(let l=0;l<s;l++){for(let c=0;c<a;c++)n.fillStyle="#3b4148",n.fillRect(c*o+o*.3,l*r+r*.18,o*.4,r*.5),n.fillStyle="rgba(86,104,74,0.92)",n.fillRect(c*o+o*.19,l*r+r*.18,o*.1,r*.5),n.fillRect(c*o+o*.71,l*r+r*.18,o*.1,r*.5),n.fillStyle="rgba(246,242,232,0.85)",n.fillRect(c*o+o*.16,l*r+r*.12,o*.68,r*.06);n.fillStyle="rgba(248,244,234,0.8)",n.fillRect(0,l*r+r*.78,256,r*.09),n.fillStyle="rgba(150,142,128,0.35)",n.fillRect(0,l*r+r*.87,256,r*.03)}return Ws(n,1500,14,256),Ln(e,[1,1])}function wd(){let[t,e]=Pn(128);e.clearRect(0,0,128,128);let n=e.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);n.addColorStop(0,"rgba(34,50,25,0.85)"),n.addColorStop(.7,"rgba(34,50,25,0.34)"),n.addColorStop(1,"rgba(34,50,25,0)"),e.fillStyle=n,e.fillRect(0,0,128,128);let s=[qe.leafDark,qe.leafDark,qe.leafMid,qe.leafMid,qe.leafLight];for(let r=0;r<460;r++){let a=ot(0,128),o=ot(0,128),l=Math.hypot(a-128/2,o-128/2)/(128/2);l>.99||cn()<l*l*.9||(e.save(),e.translate(a,o),e.rotate(ot(0,Math.PI*2)),e.fillStyle=ii(ze(s)),e.globalAlpha=ot(.5,1),e.beginPath(),e.ellipse(0,0,ot(2.6,7),ot(1,2.1),0,0,Math.PI*2),e.fill(),e.restore())}return Ln(t,null)}function Td(){let[t,e]=Pn(128),n=e.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);return n.addColorStop(0,"rgba(0,0,0,0.52)"),n.addColorStop(.55,"rgba(0,0,0,0.2)"),n.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=n,e.fillRect(0,0,128,128),Ln(t,null,!1)}function ri(i){let t=0,e=0;for(let[f,m]of i)t+=f,e+=m;t/=i.length,e/=i.length;let n=0,s=0,r=0;for(let[f,m]of i){let v=f-t,p=m-e;n+=v*v,s+=v*p,r+=p*p}let a=.5*Math.atan2(2*s,n-r),o=Math.cos(a),l=Math.sin(a),c=1e9,h=-1e9,d=1e9,u=-1e9;for(let[f,m]of i){let v=f-t,p=m-e,g=v*o+p*l,M=-v*l+p*o;c=Math.min(c,g),h=Math.max(h,g),d=Math.min(d,M),u=Math.max(u,M)}return{cx:t,cz:e,ux:o,uz:l,ang:a,halfLong:(h-c)/2,halfShort:(u-d)/2,midU:(h+c)/2,midV:(u+d)/2}}function mn(i,t,e,n,s,r,a,o,l,c=0){let h=new ft(new ut(s,o,r),l),d=t.cx+t.ux*e-t.uz*n,u=t.cz+t.uz*e+t.ux*n;return h.position.set(d,a+o/2,u),h.rotation.y=-t.ang+c,h.castShadow=!0,h.receiveShadow=!0,i.world.add(h),h}function qs(i,t,e,n,s,r,a,o){mn(i,t,e,n,s*1.06,r*1.06,a,1.2,o),mn(i,t,e,n,s*.55,r*.55,a+1.2,3,o)}function is(i,t){if(!i.axis)return{nx:0,nz:1,dist:30};let e=0,n=0,s=1/0;for(let[l,c]of i.axis.p){let h=(l-t.cx)**2+(c-t.cz)**2;h<s&&(s=h,e=l,n=c)}let r=e-t.cx,a=n-t.cz,o=Math.hypot(r,a)||1;return{nx:r/o,nz:a/o,dist:o}}function f_(i,t){let e=ri(t.p),n=i.mat.granite,s=i.mat.towerGlass,r=i.mat.paleStone;i.world.add(i.extrude(t.p,30,n)),i.world.add(i.extrude(i.grow(t.p,1.004),1.6,r,30));let a=Math.min(38,e.halfShort*1.05);for(let u of[-1,1]){let f=e.midU+u*e.halfLong*.4;mn(i,e,f,e.midV,a,a,31.6,107,n);for(let m of[-1,1])mn(i,e,f,e.midV+m*(a/2+.15),a*.82,.4,34,100,s);qs(i,e,f,e.midV,a,a,138.6,r)}let o=is(i,e),l=e.cx+o.nx*(e.halfShort+17),c=e.cz+o.nz*(e.halfShort+17),h=Math.atan2(o.nx,o.nz),d=new ft(new ut(62,.5,34),i.mat.paving);d.position.set(l,.25,c),d.rotation.y=h,d.receiveShadow=!0,i.world.add(d);for(let u=0;u<3;u++){let f=new ft(new ut(62,.18,1.1),i.mat.paleStone);f.position.set(l+o.nx*(17+u*1.1),.42-u*.16,c+o.nz*(17+u*1.1)),f.rotation.y=h,f.receiveShadow=!0,f.castShadow=!0,i.world.add(f)}for(let u of[-1,1]){let f=new ft(new ut(2.2,.85,30),n);f.position.set(l-o.nz*u*29,.68,c+o.nx*u*29),f.rotation.y=h,f.castShadow=!0,f.receiveShadow=!0,i.world.add(f)}}function p_(i,t){let e=ri(t.p),n=i.mat.towerGlass,s=i.mat.paleStone;i.world.add(i.extrude(t.p,34,n)),i.world.add(i.extrude(i.grow(t.p,1.05),1.1,s,20.5)),i.world.add(i.extrude(i.grow(t.p,1.02),1.4,s,34));let r=Math.min(30,e.halfShort*.75);mn(i,e,e.midU-e.halfLong*.12,e.midV,r,r*.78,35.4,176,n),qs(i,e,e.midU-e.halfLong*.12,e.midV,r,r*.78,211,s);let a=is(i,e),o=Math.atan2(a.nx,a.nz),l=e.cx+a.nx*(e.halfShort+4),c=e.cz+a.nz*(e.halfShort+4),h=new Ct({color:12174537,roughness:.28,metalness:.45,side:Ce}),d=new ft(new qt(17,17,Math.min(74,e.halfLong*1.9),22,1,!0,Math.PI*.06,Math.PI*.62),h);d.rotation.z=Math.PI/2,d.rotation.y=o,d.position.set(l,20.5,c),d.castShadow=!0,i.world.add(d);for(let f of[-1,1]){let m=new ft(new qt(.75,1.9,20,10),h);m.position.set(l-a.nz*f*17,10,c+a.nx*f*17),m.castShadow=!0,i.world.add(m)}let u=new ft(new Ee(Math.min(58,e.halfLong*1.5),13),new Ct({color:1119772,roughness:.25,emissive:3108776,emissiveIntensity:.85}));u.position.set(e.cx+a.nx*(e.halfShort+.4),12.5,e.cz+a.nz*(e.halfShort+.4)),u.rotation.y=o,i.world.add(u)}function m_(i,t){let e=ri(t.p),n=i.mat.jadeRoof,s=i.mat.warmStone,r=i.mat.towerGlass;i.world.add(i.extrude(t.p,19,s));let a=e.halfShort*2*.98,o=e.halfLong*2*.98,l=new ft(new gi(Math.max(a,o)*.62,9.5,4),n);l.position.set(e.cx,23.6,e.cz),l.rotation.y=-e.ang+Math.PI/4,l.castShadow=!0,i.world.add(l);let c=Math.min(26,e.halfShort*.9),h=e.midU+e.halfLong*.42;mn(i,e,h,e.midV,c,c*.72,19,121,s);for(let v=0;v<30;v++)mn(i,e,h,e.midV-c*.36,c*.9,.25,22+v*3.9,2.3,r);let d=new ft(new fe(1.05,10,8),n);d.position.set(e.cx,28.9,e.cz),d.castShadow=!0,i.world.add(d);let u=new ft(new gi(.42,3.4,8),n);u.position.set(e.cx,31,e.cz),u.castShadow=!0,i.world.add(u);let f=new ft(new gi(Math.max(a,o)*.4,6,4),n);f.position.set(e.cx,27.2,e.cz),f.rotation.y=-e.ang+Math.PI/4,f.castShadow=!0,i.world.add(f);let m=new ft(new gi(c*.75,7,4),n);m.position.set(e.cx+e.ux*h-e.uz*e.midV,143.5,e.cz+e.uz*h+e.ux*e.midV),m.rotation.y=-e.ang+Math.PI/4,m.castShadow=!0,i.world.add(m)}function g_(i,t){let e=ri(t.p),n=i.mat.paleStone,s=i.mat.towerGlass;i.world.add(i.extrude(t.p,26,s));for(let a=0;a<7;a++)i.world.add(i.extrude(i.grow(t.p,1.008),.32,i.mat.trim,4+a*3.4));let r=Math.min(30,e.halfShort*.95);mn(i,e,e.midU+e.halfLong*.25,e.midV,r,r*.8,26,44,s),qs(i,e,e.midU+e.halfLong*.25,e.midV,r,r*.8,70,n)}function x_(i,t){let e=ri(t.p),n=i.mat.towerGlass,s=i.mat.paleStone;/wisma atria/i.test(t.n||"")&&(n=i.mat.blueGlass);let r=Math.min(30,t.h*.42);if(i.world.add(i.extrude(t.p,r,n)),i.world.add(i.extrude(i.grow(t.p,1.03),1,s,r-1)),t.h>r+12){let a=Math.min(28,e.halfShort*.85);mn(i,e,e.midU,e.midV,a,a*.8,r,t.h-r,n),qs(i,e,e.midU,e.midV,a,a*.8,t.h,s)}}function __(i,t){let e=ri(t.p);i.world.add(i.extrude(t.p,t.h,i.mat.warmStone));let n=is(i,e),s=n.nx*-Math.sin(e.ang)+n.nz*Math.cos(e.ang)>=0?1:-1,r=Math.max(5,Math.round(e.halfLong*2/6));for(let a=0;a<=r;a++){let o=e.midU-e.halfLong+a/r*e.halfLong*2;mn(i,e,o,e.midV+s*(e.halfShort+.2),.5,.9,5,t.h-6,i.mat.paleStone)}i.world.add(i.extrude(i.grow(t.p,1.02),1.1,i.mat.trim,t.h))}function y_(i,t){let e=ri(t.p),n=i.mat.towerGlass,s=i.mat.paleStone;i.world.add(i.extrude(t.p,22,n));let r=Math.min(26,e.halfShort*.9);mn(i,e,e.midU,e.midV,r,r*.82,22,66,n),qs(i,e,e.midU,e.midV,r,r*.82,88,s);let a=is(i,e),o=e.cx+a.nx*(e.halfShort*.62),l=e.cz+a.nz*(e.halfShort*.62),c=new Ct({color:10467014,roughness:.12,metalness:.25,transparent:!0,opacity:.72,side:Ce}),h=new ft(new gi(11.5,27,18,6,!0),c);h.position.set(o,13.5,l),h.castShadow=!0,i.world.add(h);for(let d=0;d<12;d++){let u=d/12*Math.PI*2,f=new ft(new ut(.22,27.4,.22),i.mat.metal);f.position.set(o+Math.cos(u)*5.6,13.6,l+Math.sin(u)*5.6),f.rotation.z=Math.cos(u)*.2,f.rotation.x=-Math.sin(u)*.2,f.castShadow=!0,i.world.add(f)}}function v_(i,t){let e=ri(t.p),n=i.mat.towerGlass,s=i.mat.paleStone;i.world.add(i.extrude(t.p,t.h,n));let r=is(i,e);for(let a=0;a<5;a++){let o=12+a*9.5;if(o>t.h-8)break;let l=new ft(new ut(Math.min(20,e.halfLong*.9),4.2,3.4),new Ct({color:2896697,roughness:.6}));l.position.set(e.cx+r.nx*(e.halfShort-.6),o,e.cz+r.nz*(e.halfShort-.6)),l.rotation.y=Math.atan2(r.nx,r.nz),i.world.add(l);let c=new ft(new ut(Math.min(20,e.halfLong*.9),.35,4.6),s);c.position.set(e.cx+r.nx*(e.halfShort+.9),o-2,e.cz+r.nz*(e.halfShort+.9)),c.rotation.y=Math.atan2(r.nx,r.nz),c.castShadow=!0,i.world.add(c)}i.world.add(i.extrude(i.grow(t.p,1.02),1,s,t.h));for(let a=0;a<7;a++){let o=new ft(new fe(1.5,8,6),new Ue({color:4152371}));o.position.set(e.cx+ot(-e.halfLong*.6,e.halfLong*.6),t.h+2,e.cz+ot(-e.halfShort*.6,e.halfShort*.6)),o.scale.y=.7,o.castShadow=!0,i.world.add(o)}}function M_(i,t){let e=ri(t.p),n=i.mat.paleStone,s=i.mat.warmStone,r=i.mat.towerGlass,a=Math.min(14,t.h*.24);i.world.add(i.extrude(t.p,a,s)),i.world.add(i.extrude(i.grow(t.p,1.03),.9,n,a-.9));let o=Math.min(20,e.halfShort*.78),l=Math.min(e.halfLong*1.5,54),c=Math.max(12,t.h-a);mn(i,e,e.midU,e.midV,l,o,a,c,s);let h=Math.max(4,Math.round(c/3.3));for(let g=1;g<h;g+=2){let M=a+g*(c/h);if(M>a+c-2)break;for(let E of[-1,1])mn(i,e,e.midU,e.midV+E*(o/2+.18),l*.96,.42,M-.2,.28,n)}for(let g of[-1,1])mn(i,e,e.midU,e.midV+g*(o/2+.06),l*.94,.1,a+1.2,c-2.4,r);qs(i,e,e.midU,e.midV,l,o,a+c,n);let d=is(i,e),u=Math.atan2(d.nx,d.nz),f=e.cx+d.nx*(e.halfShort+7),m=e.cz+d.nz*(e.halfShort+7),v=new ft(new ut(22,.6,13),n);v.position.set(f,6,m),v.rotation.y=u,v.castShadow=!0,i.world.add(v);for(let g of[-9,9])for(let M of[-5,5]){let E=new ft(new qt(.45,.55,6,10),n);E.position.set(f-d.nz*g+d.nx*M,3,m+d.nx*g+d.nz*M),E.castShadow=!0,i.world.add(E)}let p=new ft(new ut(24,.12,15),i.mat.paving);p.position.set(f,.2,m),p.rotation.y=u,p.receiveShadow=!0,i.world.add(p)}function Ad(i,t){let e=ri(t.p),n=i.mat.shophouse(t),s=i.mat.trim,r=i.mat.clayTile,a=4.2,o=Math.max(3.4,t.h-a),l=e.cx,c=e.cz,h=is(i,e);i.merge(i.extrudeGeo(i.grow(t.p,.86),a),i.mat.warmStone,l,c),i.merge(i.scaleUV(i.extrudeGeo(t.p,o,a),Math.max(1,e.halfLong/4),Math.max(1,o/11)),n,l,c),i.merge(i.extrudeGeo(i.grow(t.p,1.03),.34,a-.34),s,l,c),i.merge(i.extrudeGeo(i.grow(t.p,1.04),.5,t.h),s,l,c);let d=Math.atan2(h.nx,h.nz),u=e.halfLong*2,f=Math.max(2,Math.round(u/3.6));for(let p=0;p<=f;p++){let g=e.midU-e.halfLong+p/f*u,M=e.cx+e.ux*g-e.uz*(e.midV+h.dist*0),E=e.cz+e.uz*g+e.ux*e.midV,_=new ut(.34,a,.34);_.translate(M+h.nx*(e.halfShort*.94),a/2,E+h.nz*(e.halfShort*.94)),i.merge(_,s,l,c)}let m=Math.min(3.4,e.halfShort*.62),v=new qt(m,m,u*1.02,3,1,!1);v.rotateZ(Math.PI/2),v.rotateY(-e.ang),v.translate(e.cx,t.h+m*.3,e.cz),i.merge(v,r,l,c)}var S_=[[/ngee ann city|takashimaya/i,f_],[/ion orchard|orchard residences/i,p_],[/tang plaza|singapore marriott|^tangs/i,m_],[/paragon/i,g_],[/wheelock/i,y_],[/orchard central/i,v_],[/wisma atria|313|orchard gateway|shaw (house|centre)|mandarin gallery|the heeren/i,x_],[/hotel|hyatt|hilton|marriott|four seasons|pullman|voco|royal plaza|pan pacific|regent|shangri|holiday inn|ibis|orchard rendezvous|concorde|mandarin orchard/i,M_],[/lucky plaza|far east plaza|orchard towers|midpoint|palais|delfi|orchard plaza|cairnhill|tripleone|far east shopping|international building|liat|pacific plaza|scotts square|orchard building|forum the shopping|268 orchard|scape|design orchard|cathay cineleisure/i,__]];function Rd(i){if(!i)return null;for(let[t,e]of S_)if(t.test(i))return e;return null}var ml={asphalt:Md(),paving:Sd(),leaf:wd(),ao:Td()},Cd=[Xs(8230054,5989742,8),Xs(9148578,7041656,7),Xs(7311242,5070684,9),Xs(10130308,7170658,6),Xs(8688543,4147024,10)],b_=[fl(),fl(),fl()],Ud=[Gi(11774618,.5),Gi(10261642,.6),Gi(12760480,.45),Gi(9276038,.7)],E_=[pl(11051153),pl(12432288),pl(9669762)],w_=[sh(13024681),sh(11380118)];function T_(i){let t=0;for(let[n,s]of i.p)t=t*31+(n*7|0)+(s*13|0)|0;if(t=Math.abs(t),i.a>1400||i.k)return{pool:Cd,rough:.34,metal:.08};let e=t%100;return e<34?{pool:E_,rough:.86,metal:0}:e<52?{pool:w_,rough:.8,metal:0}:e<74?{pool:Ud,rough:.88,metal:0}:{pool:Cd,rough:.36,metal:.06}}var Ut={asphalt:new Ct({map:ml.asphalt,roughness:.95}),paving:new Ct({map:ml.paving,roughness:.9}),kerb:new Ct({color:qe.kerb,roughness:.86}),conc:new Ct({map:Gi(qe.conc,.7),roughness:.92}),trim:new Ct({color:qe.trim,roughness:.8}),white:new Ct({color:14605008,roughness:.85}),yellow:new Ct({color:qe.yellow,roughness:.85}),metal:new Ct({color:9146259,roughness:.5,metalness:.4}),darkMetal:new Ct({color:3882820,roughness:.6,metalness:.3}),glass:new Ct({color:5464429,roughness:.14,metalness:.18}),leaf:new Ue({map:ml.leaf,transparent:!1,alphaTest:.42,side:Ce}),canopy:new Ue({color:2371866}),trunk:new Ct({color:qe.trunk,roughness:.95}),ao:new Rn({map:ml.ao,transparent:!0,blending:Nr,premultipliedAlpha:!0,depthWrite:!1})},Id=[14207924,12571332,14271386,13226973,14071464,14735037,12175805],rh=new Map,A_={granite:new Ct({map:bd(),roughness:.3,metalness:.12}),towerGlass:new Ct({map:ih(),roughness:.22,metalness:.16}),blueGlass:new Ct({map:ih(),color:10470621,roughness:.18,metalness:.2}),paleStone:new Ct({map:Gi(12893614,.35),roughness:.78}),warmStone:new Ct({map:Gi(11707535,.5),roughness:.85}),jadeRoof:new Ct({color:3104586,roughness:.45,metalness:.2}),clayTile:new Ct({color:10246724,roughness:.82}),shophouse(i){let t=0;for(let[n,s]of i.p)t=t*31+(n*5|0)+(s*11|0)|0;let e=Id[Math.abs(t)%Id.length];return rh.has(e)||rh.set(e,new Ct({map:Ed(e),roughness:.88})),rh.get(e)}},bS=new L(0,1,0),Pd=110,oh=class{constructor(){this.groups=new Map,this.mats=new Map}add(t,e,n=0,s=0){let r=`${Math.floor(n/Pd)},${Math.floor(s/Pd)}|${this.matKey(e)}`;this.groups.has(r)||(this.groups.set(r,[]),this.mats.set(r,e)),this.groups.get(r).push(t.index?t.toNonIndexed():t)}matKey(t){return this._ids||(this._ids=new Map,this._next=0),this._ids.has(t)||this._ids.set(t,this._next++),this._ids.get(t)}flush(t){let e=0;for(let[n,s]of this.groups){let r=this.mats.get(n),a=0;for(let m of s)a+=m.attributes.position.count;let o=new Float32Array(a*3),l=new Float32Array(a*3),c=new Float32Array(a*2),h=0,d=0;for(let m of s)o.set(m.attributes.position.array,h),m.attributes.normal&&l.set(m.attributes.normal.array,h),m.attributes.uv&&c.set(m.attributes.uv.array,d),h+=m.attributes.position.count*3,d+=m.attributes.position.count*2,m.dispose();let u=new Be;u.setAttribute("position",new se(o,3)),u.setAttribute("normal",new se(l,3)),u.setAttribute("uv",new se(c,2)),u.computeBoundingSphere();let f=new ft(u,r);f.castShadow=!0,f.receiveShadow=!0,t.add(f),e++}return this.groups.clear(),this.mats.clear(),e}};function lh(i,t,e){let n=i.attributes.uv;if(!n)return i;for(let s=0;s<n.count;s++)n.setXY(s,n.getX(s)*t,n.getY(s)*e);return n.needsUpdate=!0,i}var ah=new Map;function Nd(i,t,e){return ah.has(i)||ah.set(i,new Ct({map:i,roughness:t,metalness:e})),ah.get(i)}function Jr(i,t,e=0){let n=new Us(Fd(i),{depth:t,bevelEnabled:!1,curveSegments:1});return n.rotateX(Math.PI/2),n.translate(0,e+t,0),n}function R_(i){let t=0;for(let e=0;e<i.length;e++){let[n,s]=i[e],[r,a]=i[(e+1)%i.length];t+=n*a-r*s}return t/2}function Fd(i){let t=R_(i)<0?[...i].reverse():i,e=new Ls;e.moveTo(t[0][0],t[0][1]);for(let n=1;n<t.length;n++)e.lineTo(t[n][0],t[n][1]);return e.closePath(),e}function ss(i){let t=0,e=0;for(let n of i)t+=n[0],e+=n[1];return[t/i.length,e/i.length]}function Ld(i){let t=0;for(let e=0;e<i.length;e++){let n=i[e],s=i[(e+1)%i.length];t+=Math.hypot(s[0]-n[0],s[1]-n[1])}return t}function Kr(i,t,e,n=0){let s=new Us(Fd(i),{depth:t,bevelEnabled:!1,curveSegments:1});s.rotateX(Math.PI/2),s.translate(0,n+t,0);let r=new ft(s,e);return r.castShadow=!0,r.receiveShadow=!0,r}function $r(i,t){let e=ss(i);return i.map(([n,s])=>[e[0]+(n-e[0])*t,e[1]+(s-e[1])*t])}function Bd(i,t){let e={count:0,tall:0,bespoke:0},n=new oh,s={world:i,extrude:Kr,grow:$r,axis:t.axis||null,extrudeGeo:Jr,scaleUV:lh,merge:(r,a,o,l)=>n.add(r,a,o,l),mat:{...A_,trim:Ut.trim,conc:Ut.conc,paving:Ut.paving,metal:Ut.metal}};for(let r of t.buildings){let a=r.p;if(a.length<3)continue;if(!r.k&&r.a<520&&r.h<=20&&r.p.length<=12){Ad(s,r),e.count++,e.shophouses=(e.shophouses||0)+1;continue}let o=Rd(r.n);if(o){o(s,r),Dd(i,r,Ld(a),n),e.count++,e.bespoke++;continue}let l=T_(r),c=ze(l.pool),h=Nd(c,l.rough,l.metal),d=Ld(a),u=r.h;if(r.k&&u>70){let f=Math.min(34,u*.28);i.add(Kr(a,f,new Ct({map:ze(Ud),roughness:.8})));let m=ss(a),v=a.map(([p,g])=>[m[0]+(p-m[0])*.62,m[1]+(g-m[1])*.62]);i.add(Kr(v,u-f,h,f)),e.tall++}else{let f=ss(a);if(n.add(lh(Jr(a,u),Math.max(1,d/26),Math.max(1,u/28)),h,f[0],f[1]),u>8){let m=ss(a),v=a.map(([p,g])=>[m[0]+(p-m[0])*1.008,m[1]+(g-m[1])*1.008]);n.add(Jr(v,.7,u),Ut.trim,m[0],m[1])}}if(Dd(i,r,d,n),r.a>900&&u>12){let f=ss(a);for(let m=0;m<3;m++){let v=new ut(ot(3,7),ot(1.6,3.4),ot(3,6));v.translate(f[0]+ot(-8,8),u+ot(1,1.8),f[1]+ot(-8,8)),n.add(v,Ut.conc,f[0],f[1])}}e.count++}return e.mergedMeshes=n.flush(i),e}function Dd(i,t,e,n){if(t.a<=600||t.h<=7)return;let s=t.p,r=ze(b_),a=Nd(r,.32,.05);if(n){let c=ss(s);n.add(lh(Jr($r(s,1.012),5.4),Math.max(2,e/15),1),a,c[0],c[1]),n.add(Jr($r(s,1.055),.42,5.3),Ut.trim,c[0],c[1])}else i.add(Kr($r(s,1.012),5.4,a)),i.add(Kr($r(s,1.055),.42,Ut.trim,5.3));let o=0,l=0;for(let c=0;c<s.length;c++){let h=s[c],d=s[(c+1)%s.length],u=Math.hypot(d[0]-h[0],d[1]-h[1]);u>l&&(l=u,o=c)}if(l>16){let c=s[o],h=s[(o+1)%s.length],d=(c[0]+h[0])/2,u=(c[1]+h[1])/2,f=Math.atan2(h[0]-c[0],h[1]-c[1]),m=ss(s),v=d-m[0],p=u-m[1],g=Math.hypot(v,p)||1,M=v/g,E=p/g;if(t.a>1200){let S=Math.min(14,l*.3),w=new ft(new Ee(S,4.4),new Ct({color:2827808,roughness:.7,emissive:14267511,emissiveIntensity:.55}));w.position.set(d-M*5.2,2.5,u-E*5.2),w.rotation.y=f+Math.PI/2,i.add(w);for(let R of[-1,1]){let I=new ft(new Ee(5.6,4.4),new Ct({color:3814187,roughness:.8,side:Ce}));I.position.set(d-M*2.5+Math.sin(f)*R*S/2,2.5,u-E*2.5+Math.cos(f)*R*S/2),I.rotation.y=f,i.add(I)}let x=new ft(new Ee(S,5.6),new Ct({color:4866618,roughness:.8,side:Ce}));x.rotation.x=Math.PI/2,x.rotation.z=-f,x.position.set(d-M*2.5,4.7,u-E*2.5),i.add(x);let b=new ft(new Ee(S,4.2),new Ct({color:12374234,roughness:.08,metalness:.2,transparent:!0,opacity:.34,side:Ce}));b.position.set(d+M*.35,2.4,u+E*.35),b.rotation.y=f+Math.PI/2,i.add(b)}let _=Math.min(18,l*.34),A=new ft(new ut(_,.5,4.4),Ut.trim);A.position.set(d+v/g*1.9,6.1,u+p/g*1.9),A.rotation.y=f+Math.PI/2,A.castShadow=!0,i.add(A);for(let S of[-1,1]){let w=new ft(new qt(.12,.12,6,8),Ut.metal);w.position.set(d+v/g*3.6+Math.sin(f)*S*_*.42,3,u+p/g*3.6+Math.cos(f)*S*_*.42),w.castShadow=!0,i.add(w)}}}function C_(i,t,e){let n=new Be,s=[],r=[],a=0;for(let o=0;o<i.length-1;o++){let[l,c]=i[o],[h,d]=i[o+1],u=h-l,f=d-c,m=Math.hypot(u,f);if(m<.01)continue;let v=-f/m*t/2,p=u/m*t/2,g=[l-v,e,c-p],M=[l+v,e,c+p],E=[h+v,e,d+p],_=[h-v,e,d-p];s.push(...g,...M,...E,...g,...E,..._);let A=a/t,S=(a+m)/t;r.push(0,A,1,A,1,S,0,A,1,S,0,S),a+=m}return n.setAttribute("position",new se(s,3)),n.setAttribute("uv",new se(r,2)),n.computeVertexNormals(),n}function I_(i){let t=0;for(let e=0;e<i.length-1;e++)t+=Math.hypot(i[e+1][0]-i[e][0],i[e+1][1]-i[e][1]);return t}function Od(i,t){let e=[],n=[],s=null,r=1/0;for(let o of t.roads){let l=o.k==="footway"||o.k==="pedestrian",c=l?.02:.055,h=C_(o.p,o.w,c);if(!(!h.attributes.position||h.attributes.position.count===0)&&((l?n:e).push(h),/orchard road/i.test(o.n||"")&&I_(o.p)>120)){let d=1/0;for(let[u,f]of o.p)d=Math.min(d,u*u+f*f);d<r&&(r=d,s=o)}}let a=(o,l)=>{if(!o.length)return;let c=0;for(let p of o)c+=p.attributes.position.count;let h=new Float32Array(c*3),d=new Float32Array(c*2),u=0,f=0;for(let p of o)h.set(p.attributes.position.array,u),u+=p.attributes.position.array.length,d.set(p.attributes.uv.array,f),f+=p.attributes.uv.array.length;let m=new Be;m.setAttribute("position",new se(h,3)),m.setAttribute("uv",new se(d,2)),m.computeVertexNormals();let v=new ft(m,l);v.receiveShadow=!0,i.add(v)};return a(e,Ut.asphalt),a(n,Ut.paving),s}var Qr=class{constructor(){this.items=[]}add(t,e,n=1){this.items.push([t,e,n])}build(t){let e=this.items.length;if(!e)return 0;let n=30,s=3,r=4,a=new Oe(new qt(.24,.52,1,8),Ut.trunk,e),o=new Oe(new qt(.07,.2,1,5),Ut.trunk,e*r),l=new Oe(new Ar(1,0),Ut.canopy,e*s),c=new Oe(new Ee(1,.55),Ut.leaf,e*n);a.castShadow=o.castShadow=l.castShadow=c.castShadow=!0;let h=new ie,d=new Te,u=new Se,f=new L,m=new L,v=0,p=0,g=0;return this.items.forEach(([M,E,_],A)=>{let S=ot(8.5,12.5)*_,w=ot(5.2,7.2)*_;f.set(M,S/2,E),u.identity(),m.set(_,S,_),h.compose(f,u,m),a.setMatrixAt(A,h);for(let x=0;x<r;x++){let b=x/r*Math.PI*2+ot(-.3,.3),R=ot(1.8,3)*_;f.set(M+Math.cos(b)*R*.22,S*ot(.8,.96),E+Math.sin(b)*R*.22),d.set(Math.cos(b)*.55,0,-Math.sin(b)*.55),u.setFromEuler(d),m.set(_,R,_),h.compose(f,u,m),o.setMatrixAt(v++,h)}for(let x=0;x<s;x++){let b=w*ot(.16,.24);f.set(M+ot(-.45,.45)*w,S*ot(.94,1.06),E+ot(-.45,.45)*w),u.identity(),m.set(b,b*.5,b),h.compose(f,u,m),l.setMatrixAt(p++,h)}for(let x=0;x<n;x++){let b=cn()*Math.PI*2,R=w*Math.sqrt(cn())*1.12;f.set(M+Math.cos(b)*R,S*ot(.92,1.06)-R*.13+ot(-.4,.4),E+Math.sin(b)*R),d.set(ot(-1.5,-.7),b+ot(-.7,.7),ot(-.4,.4)),u.setFromEuler(d);let I=w*ot(.45,.8);m.set(I,I,I),h.compose(f,u,m),c.setMatrixAt(g++,h)}}),o.count=v,l.count=p,c.count=g,t.add(a,o,l,c),e}};var an={vMax:11.6,vReverse:2.4,accel:5,reverseAccel:2.6,brake:11,coast:1.35,drag:.016,wheelbase:1.32,steerMax:.62,steerFalloff:.045,leanMax:.62,leanRate:5};function gl(i=0,t=0,e=0){return{x:i,z:t,heading:e,speed:0,lean:0,yaw:0,wheel:0,revHold:0,reversing:!1}}function ch(i,t,e,n,s){e>0?(i.revHold=0,i.reversing=!1):n>0&&i.speed<=.03?i.revHold+=t:n===0&&(i.revHold=0,i.speed>=-.02&&(i.reversing=!1)),i.revHold>.35&&(i.reversing=!0);let r;if(i.reversing?r=-n*an.reverseAccel:r=e*an.accel-n*an.brake*(i.speed>0?1:0),Math.abs(i.speed)>.05){let h=Math.sign(i.speed);r-=h*(an.coast+an.drag*i.speed*i.speed)}i.speed=Math.max(-an.vReverse,Math.min(an.vMax,i.speed+r*t)),!i.reversing&&e===0&&Math.abs(i.speed)<.12&&(i.speed=0),i.reversing&&n===0&&Math.abs(i.speed)<.12&&(i.speed=0,i.reversing=!1);let a=1/(1+an.steerFalloff*i.speed*i.speed),o=s*an.steerMax*a,l=i.speed/an.wheelbase*Math.tan(o);i.yaw=l,i.heading-=l*t;let c=Math.max(-an.leanMax,Math.min(an.leanMax,l*i.speed*.11));return i.lean+=(c-i.lean)*Math.min(1,an.leanRate*t),i.x+=Math.sin(i.heading)*i.speed*t,i.z+=Math.cos(i.heading)*i.speed*t,i.wheel+=i.speed/.21*t,i}var P_=10470584,L_=15262418,D_=13028046;function xe(i,t,e,n,s,r=0,a=0,o=0){let l=new ft(i,t);return l.position.set(e,n,s),l.rotation.set(r,a,o),l.castShadow=!0,l}function zd(){let i=new ge,t=new Ct({color:P_,roughness:.35,metalness:.25}),e=new Ct({color:L_,roughness:.5}),n=new Ct({color:D_,roughness:.22,metalness:.85}),s=new Ct({color:2435116,roughness:.85}),r=new Ct({color:5522223,roughness:.62}),a=new Ct({color:14214378,roughness:.1,metalness:.1,transparent:!0,opacity:.55}),o=new fe(.3,14,12);i.add(xe(o,t,.26,.52,-.3)),i.add(xe(o,t,-.26,.52,-.3));let l=i.children[i.children.length-1],c=i.children[i.children.length-2];l.scale.set(.72,.95,1.55),c.scale.set(.72,.95,1.55),i.add(xe(new ut(.42,.3,.86),t,0,.56,-.26)),i.add(xe(new ut(.46,.055,.62),e,0,.3,.28)),i.add(xe(new ut(.5,.62,.1),t,0,.62,.6,-.3)),i.add(xe(new ut(.44,.3,.09),e,0,.4,.66,-.3));let h=xe(new Re(.13,.42,4,8),r,0,.79,-.16,0,0,Math.PI/2);h.scale.set(1,1,1.15),i.add(h),i.add(xe(new qt(.055,.055,.62,8),n,0,.86,.66,-.28)),i.add(xe(new qt(.028,.028,.66,6),n,0,1.09,.6,0,0,Math.PI/2));for(let v of[-.3,.3])i.add(xe(new qt(.035,.035,.14,6),s,v,1.09,.6,0,0,Math.PI/2)),i.add(xe(new qt(.012,.012,.2,5),n,v*.9,1.2,.6)),i.add(xe(new Li(.055,10),n,v*.9,1.3,.6,0,v>0?.5:-.5,0));let d=xe(new fe(.115,12,10),n,0,.99,.74);d.scale.set(1,1,.62),i.add(d),i.add(xe(new Li(.095,12),new Ct({color:16774360,roughness:.2,emissive:16771504,emissiveIntensity:.35}),0,.99,.8)),i.add(xe(new ut(.44,.34,.02),a,0,1.32,.66,-.24));let u=new qt(.205,.205,.115,16),f=new qt(.115,.115,.12,12),m=[];for(let[v,p]of[[.62,!0],[-.52,!1]]){let g=new ge;g.add(xe(u,s,0,0,0,0,0,Math.PI/2)),g.add(xe(f,e,0,0,0,0,0,Math.PI/2)),g.position.set(0,.205,v),i.add(g),m.push(g),p&&(i.add(xe(new ut(.07,.44,.07),n,.1,.42,v,-.16)),i.add(xe(new ut(.28,.05,.34),t,0,.45,v+.02)))}return i.add(xe(new qt(.045,.055,.42,8),n,.24,.3,-.44,0,0,Math.PI/2.4)),{group:i,wheels:m}}function Hd(){let i=new ge,t=new Ue({color:13194559}),e=new Ue({color:3686735}),n=new Ue({color:9071186}),s=new Ct({color:15131352,roughness:.3,metalness:.1}),r=new Ct({color:2765112,roughness:.1,metalness:.3}),a=xe(new Re(.17,.4,4,10),t,0,1.16,-.1,-.22);i.add(a);let o=xe(new fe(.135,14,12),s,0,1.55,-.02);i.add(o),i.add(xe(new fe(.118,12,10),r,0,1.545,.055));for(let l of[-.13,.13])i.add(xe(new Re(.085,.3,4,8),e,l,.9,.1,Math.PI/2.3)),i.add(xe(new Re(.072,.28,4,8),e,l,.58,.3,.22)),i.add(xe(new fe(.062,8,7),e,l,.36,.34)),i.add(xe(new Re(.055,.4,4,8),t,l*1.7,1.2,.26,Math.PI/2.6)),i.add(xe(new fe(.05,8,7),n,l*2.3,1.09,.56));return i}var U_=new URLSearchParams(location.search),dh=U_.has("touch")||matchMedia("(pointer: coarse)").matches||navigator.maxTouchPoints>0,Ie={steer:0,throttle:0,brake:0,moveX:0,moveY:0,run:!1,toggleMode:!1,stickActive:!1,stickDX:0,stickDY:0},jr={x:92,yFromBottom:92,radius:54};function N_(){return{cx:jr.x,cy:innerHeight-jr.yFromBottom}}var hh=0,uh=0,He=new Set;addEventListener("keydown",i=>{He.add(i.code),(i.code==="KeyE"||i.code==="KeyF")&&(Ie.toggleMode=!0),["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(i.code)&&i.preventDefault()});addEventListener("keyup",i=>He.delete(i.code));var ta=new Map;function F_(i){return i<innerWidth*.5?"power":"steer"}function Gd(i){let t=s=>{window.__touchFired=(window.__touchFired||0)+1;for(let r of s.changedTouches)ta.set(r.identifier,{startX:r.clientX,startY:r.clientY,x:r.clientX,y:r.clientY,px:r.clientX,py:r.clientY,side:F_(r.clientX)});s.preventDefault()},e=s=>{for(let r of s.changedTouches){let a=ta.get(r.identifier);a&&(a.x=r.clientX,a.y=r.clientY)}s.preventDefault()},n=s=>{for(let r of s.changedTouches)ta.delete(r.identifier)};i.addEventListener("touchstart",t,{passive:!1}),i.addEventListener("touchmove",e,{passive:!1}),i.addEventListener("touchend",n,{passive:!0}),i.addEventListener("touchcancel",n,{passive:!0})}function kd(i){let t=!1,e=0,n=0;i.addEventListener("mousedown",s=>{t=!0,e=s.clientX,n=s.clientY}),addEventListener("mouseup",()=>{t=!1}),addEventListener("mousemove",s=>{t&&(hh+=s.clientX-e,uh+=s.clientY-n,e=s.clientX,n=s.clientY)})}function Vd(i){let t=0,e=0,n=0;Ie.stickActive=!1;let s=0,r=0,a=hh,o=uh;hh=0,uh=0;for(let l of ta.values()){if(l.side==="power")if(i==="walk"){let{cx:c,cy:h}=N_(),d=l.x-c,u=l.y-h,f=Math.hypot(d,u)||1,m=Math.min(f,jr.radius);d=d/f*m,u=u/f*m,s=d/jr.radius,r=u/jr.radius,Ie.stickActive=!0,Ie.stickDX=d,Ie.stickDY=u}else l.y<innerHeight*.62?e=1:n=1;else i==="walk"?(a+=l.x-l.px,o+=l.y-l.py):t=Math.max(-1,Math.min(1,(l.x-l.startX)/(innerWidth*.14)));l.px=l.x,l.py=l.y}return Ie.stickActive||(Ie.stickDX=0,Ie.stickDY=0),i==="walk"?((He.has("KeyA")||He.has("ArrowLeft"))&&(s=-1),(He.has("KeyD")||He.has("ArrowRight"))&&(s=1),(He.has("KeyW")||He.has("ArrowUp"))&&(r=-1),(He.has("KeyS")||He.has("ArrowDown"))&&(r=1)):((He.has("KeyA")||He.has("ArrowLeft"))&&(t=-1),(He.has("KeyD")||He.has("ArrowRight"))&&(t=1),(He.has("KeyW")||He.has("ArrowUp"))&&(e=1),(He.has("KeyS")||He.has("ArrowDown")||He.has("Space"))&&(n=1)),Ie.steer=t,Ie.throttle=e,Ie.brake=n,Ie.moveX=s,Ie.moveY=r,Ie.run=He.has("ShiftLeft")||He.has("ShiftRight"),{steer:t,throttle:e,brake:n,moveX:s,moveY:r,lookDX:a,lookDY:o,run:Ie.run}}function Wd(){return[...ta.values()].map(i=>`${i.side}@${i.x|0},${i.y|0}`).join(" ")}var xl={speed:1.85,runSpeed:4.1,accel:9,turnRate:9};function Xd(i=0,t=0,e=0){return{x:i,z:t,heading:e,speed:0,phase:0}}function qd(i,t,e,n,s){let r=Math.min(1,Math.hypot(e,n)),a=r*(s?xl.runSpeed:xl.speed);if(i.speed+=(a-i.speed)*Math.min(1,xl.accel*t),r>.05){let l=Math.atan2(e,n)-i.heading;for(;l>Math.PI;)l-=Math.PI*2;for(;l<-Math.PI;)l+=Math.PI*2;i.heading+=l*Math.min(1,xl.turnRate*t)}return i.phase+=i.speed*t*2.4,i.x+=Math.sin(i.heading)*i.speed*t,i.z+=Math.cos(i.heading)*i.speed*t,i}function Yd(){let i=new ge,t=new Ue({color:13194559}),e=new Ue({color:3686735}),n=new Ue({color:9071186}),s=new Ue({color:2366486}),r=new Ue({color:2828067}),a=(M,E,_,A,S)=>{let w=new ft(M,E);return w.position.set(_,A,S),w.castShadow=!0,i.add(w),w},o=a(new Re(.135,.36,4,10),t,0,1.24,0),l=a(new Re(.125,.1,3,8),e,0,.95,0),c=a(new fe(.112,14,12),n,0,1.62,0);a(new fe(.119,14,10,0,Math.PI*2,0,Math.PI*.6),s,0,1.64,0),a(new qt(.055,.062,.1,8),n,0,1.47,0);let h=a(new Re(.048,.42,3,8),t,-.2,1.22,0),d=a(new Re(.048,.42,3,8),t,.2,1.22,0),u=a(new fe(.055,8,7),n,-.205,.99,0),f=a(new fe(.055,8,7),n,.205,.99,0),m=a(new Re(.062,.46,3,8),e,-.09,.53,0),v=a(new Re(.062,.46,3,8),e,.09,.53,0),p=a(new ut(.115,.075,.26),r,-.09,.06,.03),g=a(new ut(.115,.075,.26),r,.09,.06,.03);return{group:i,pose(M,E){let _=E>.1?Math.sin(M*2.4):0;h.rotation.x=_*.7,d.rotation.x=-_*.7,m.rotation.x=-_*.8,v.rotation.x=_*.8,u.position.z=_*.28,f.position.z=-_*.28,p.position.z=.03-_*.32,g.position.z=.03+_*.32;let A=E>.1?Math.abs(Math.cos(M*2.4))*.03:0;o.position.y=1.24+A,c.position.y=1.62+A,l.position.y=.95+A}}}var ea=new Ct({color:14605008,roughness:.86}),B_=new Ct({color:14069316,roughness:.86});function Ys(i,t,e,n,s){if(!t.length)return 0;let r=new Ee(e,n),a=new Oe(r,s,t.length),o=new ie,l=new Se,c=new Te,h=new L,d=new L(1,1,1);return t.forEach((u,f)=>{h.set(u[0],u[1],u[2]),c.set(-Math.PI/2,u[3],0,"YXZ"),l.setFromEuler(c),o.compose(h,l,d),a.setMatrixAt(f,o)}),a.receiveShadow=!0,i.add(a),t.length}function Zd(i,t){let e=t.p,n=t.w/2,s=[],r=[],a=[],o=[],l=[],c=[],h=0;for(let u=0;u<e.length-1;u++){let[f,m]=e[u],[v,p]=e[u+1],g=v-f,M=p-m,E=Math.hypot(g,M);if(E<.5)continue;let _=g/E,A=M/E,S=-A,w=_,x=Math.atan2(_,A);for(let b=0;b<E;b+=1,h++){let R=f+_*b,I=m+A*b;if(h%9<3)for(let P of[-3.6,3.6])s.push([R+S*P,.075,I+w*P,x]);if(h%2===0)for(let P of[-1,1])r.push([R+S*(n-.55)*P,.075,I+w*(n-.55)*P,x]);if(h%2===0)for(let P of[-1,1])a.push([R+S*(n-.12)*P,.078,I+w*(n-.12)*P,x]),a.push([R+S*(n-.34)*P,.078,I+w*(n-.34)*P,x]);if(h%190===24)for(let P of[-1,1])o.push([R+S*(n*.5)*P,.08,I+w*(n*.5)*P,x+Math.PI/2]);if(h%190===60||h%190===140)for(let P of[-5.4,-1.9,1.9,5.4])l.push([R+S*P,.08,I+w*P,x]),c.push([R+S*P+_*1.9,.08,I+w*P+A*1.9,x])}}let d=0;return d+=Ys(i,s,.14,1,ea),d+=Ys(i,r,.12,2,ea),d+=Ys(i,a,.1,2,B_),d+=Ys(i,o,.42,n*.92,ea),d+=Ys(i,l,.28,3.2,ea),d+=Ys(i,c,.92,.9,ea),d}function $d(i,t,e,n,s){let r=new s,a=[],o=[],l=[],c=0;for(let M of t.roads){if(!M.n||/orchard road/i.test(M.n)||M.k==="footway"||M.k==="pedestrian"||M.k==="service")continue;let E=M.p,_=M.w/2,A=0;for(let w=0;w<E.length-1;w++)A+=Math.hypot(E[w+1][0]-E[w][0],E[w+1][1]-E[w][1]);if(A<45)continue;c++;let S=0;for(let w=0;w<E.length-1;w++){let[x,b]=E[w],[R,I]=E[w+1],P=R-x,N=I-b,O=Math.hypot(P,N);if(O<.5)continue;let D=P/O,k=N/O,F=-k,H=D,Y=Math.atan2(D,k);for(let J=0;J<O;J+=4,S+=4){let $=x+D*J,it=b+k*J;for(let st of[-1,1]){let Tt=$+F*(_+.4)*st,vt=it+H*(_+.4)*st;if(n(Tt,vt)||a.push([Tt,.15,vt,Y]),S%44===0){let q=$+F*(_+2.8)*st,rt=it+H*(_+2.8)*st;n(q,rt)||r.add(q,rt,ot(.6,.9))}S%96===0&&!n(Tt,vt)&&(o.push([Tt,3.6,vt,Y]),l.push([Tt-F*.9*st,7,vt-H*.9*st,Y,st]))}}}}let h=new ie,d=new Se,u=new Te,f=new L,m=new L(1,1,1),v=(M,E,_,A)=>{if(!_.length)return;let S=new Oe(M,E,_.length);_.forEach((w,x)=>{A(w),h.compose(f,d,m),S.setMatrixAt(x,h)}),S.castShadow=!1,S.receiveShadow=!0,i.add(S)},p=M=>{f.set(M[0],M[1],M[2]),u.set(0,M[3],0),d.setFromEuler(u)};v(new ut(.38,.3,4),Ut.kerb,a,p),v(new qt(.09,.13,7.2,8),Ut.metal,o,p),v(new ut(.9,.16,.4),Ut.trim,l,M=>{f.set(M[0],M[1],M[2]),u.set(0,M[3],0),d.setFromEuler(u)});let g=r.build(i);return{sideRoads:c,sideTrees:g,sideKerbs:a.length}}var fh=[11876142,2051962,14067004,3107663,8011629,13593402,2830131,11022927,4026255],O_=[11680302,3107727,13672506,3504725,9060208],ph=new Map;function z_(i,t,e){let n=i+t+e;if(ph.has(n))return ph.get(n);let s=512,r=128,a=document.createElement("canvas");a.width=s,a.height=r;let o=a.getContext("2d");o.fillStyle=t,o.fillRect(0,0,s,r),o.fillStyle="rgba(255,255,255,0.10)",o.fillRect(0,0,s,5),o.fillStyle=e,o.textAlign="center",o.textBaseline="middle";let l=62,c=i.toUpperCase();do o.font=`600 ${l}px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial`,l-=3;while(o.measureText(c).width>s-44&&l>16);o.fillText(c,s/2,r/2+3);let h=new Kn(a);return h.colorSpace=De,h.anisotropy=4,ph.set(n,h),h}function Ye(i,t,e,n,s,r){let a=new ft(i,t);return a.position.set(e,n,s),a.rotation.y=r,a.castShadow=!0,a.receiveShadow=!0,a}function Jd(i,t,e,n,s){let r=new ge,a=Ut.metal,o=Ut.darkMetal,l=s/2+1.2;for(let d of[-1,1])r.add(Ye(new qt(.22,.28,7.4,10),a,d*l,3.7,0,0)),r.add(Ye(new ut(1.2,.35,1.2),Ut.conc,d*l,.18,0,0));r.add(Ye(new ut(s+2.8,.85,.55),a,0,7.2,0,0)),r.add(Ye(new ut(s+2.8,.28,.32),a,0,6.4,0,0));let c=Math.max(3,Math.round(s/3.4));for(let d=0;d<c;d++){let u=-s/2+(d+.5)*(s/c),f=Ye(new ut(.62,.3,.85),o,u,6.75,.5,0);f.rotation.x=.42,r.add(f)}for(let d of[-1,1])r.add(Ye(new ut(.4,.4,.75),o,d*(l-1.4),6.9,-.5,0));let h=Ye(new ut(2.4,.9,.12),new Ct({color:1842978,emissive:13208094,emissiveIntensity:.55}),0,8.1,.1,0);r.add(h),r.position.set(t,0,e),r.rotation.y=n,i.add(r)}function H_(i,t,e,n,s){let r=new ge,a=Ut.metal,o=Ut.conc,l=s+14;r.add(Ye(new ut(l,.42,2.6),o,0,6,0,0)),r.add(Ye(new ut(l,.16,3),Ut.trim,0,8.6,0,0));for(let c of[-1,1]){r.add(Ye(new ut(l,1.05,.1),a,0,6.75,c*1.3,0));for(let h=0;h<=10;h++){let d=-l/2+h/10*l;r.add(Ye(new qt(.055,.055,2.4,6),a,d,7.4,c*1.3,0))}}for(let c of[-1,1]){let h=c*(l/2-1);r.add(Ye(new ut(2.6,6,2.8),o,h,3,c*3.2,0));for(let d=0;d<12;d++)r.add(Ye(new ut(2.2,.16,.34),o,h,.5+d*.46,c*(1.9+d*.2),0))}r.position.set(t,0,e),r.rotation.y=n,i.add(r)}function Kd(i,t,e,n,s){let r=new ge,a=Ut.metal,o=Ut.conc,l=new Ct({color:11059407,roughness:.12,metalness:.25,transparent:!0,opacity:.62,side:Ce});r.add(Ye(new ut(7.4,.4,5.2),o,0,-.2,0,0));for(let u=0;u<9;u++){let f=new ft(new ut(4.6,.17,.42),o);f.position.set(0,-.28-u*.17,-1.6+u*.42),f.receiveShadow=!0,r.add(f)}r.add(Ye(new ut(4.8,.1,3.2),new Rn({color:856340}),0,-1.9,1.4,0));for(let u of[-1,1]){r.add(Ye(new ut(.07,.05,5),a,u*2.6,1.05,0,0)),r.add(Ye(new ut(.06,.04,5),a,u*2.6,.66,0,0));for(let f=0;f<4;f++)r.add(Ye(new qt(.03,.03,1.05,6),a,u*2.6,.52,-2.2+f*1.5,0))}let c=new ft(new qt(3.5,3.5,6.6,16,1,!0,Math.PI*.08,Math.PI*.84),l);c.rotation.z=Math.PI/2,c.position.set(0,2.5,0),c.castShadow=!0,r.add(c);for(let u=0;u<=5;u++){let f=new ft(new Rr(3.5,.05,5,12,Math.PI*.84),a);f.rotation.y=Math.PI/2,f.rotation.z=Math.PI*.08,f.position.set(-3.3+u*1.32,2.5,0),r.add(f)}let h=new ft(new ut(.34,3.3,1.05),Ut.darkMetal);h.position.set(4.3,1.65,0),h.castShadow=!0,r.add(h);let d=(()=>{let u=document.createElement("canvas");u.width=128,u.height=400;let f=u.getContext("2d");f.fillStyle="#c8102e",f.fillRect(0,0,128,130),f.fillStyle="#00358e",f.fillRect(0,130,128,270),f.fillStyle="#ffffff",f.font="700 30px ui-sans-serif, system-ui, Helvetica, Arial",f.textAlign="center",f.fillText("MRT",64,82),f.save(),f.translate(64,265),f.rotate(-Math.PI/2);let m=30;do f.font=`600 ${m}px ui-sans-serif, system-ui, Helvetica, Arial`,m-=2;while(f.measureText(s.toUpperCase()).width>230&&m>12);f.fillText(s.toUpperCase(),0,8),f.restore();let v=new Kn(u);return v.colorSpace=De,v})();for(let u of[-1,1]){let f=new ft(new Ee(1,3.15),new Ct({map:d,roughness:.5}));f.position.set(4.3+u*.18,1.65,0),f.rotation.y=u>0?Math.PI/2:-Math.PI/2,r.add(f)}r.position.set(t,0,e),r.rotation.y=n,i.add(r)}function Qd(i,t,e,n){let s=t.p,r=t.w/2,a={erp:0,bridges:0,banners:0,medianPlants:0,roofSigns:0,banners2:0},o=[],l=[],c=[],h=[],d=0;for(let w=0;w<s.length-1;w++){let[x,b]=s[w],[R,I]=s[w+1],P=R-x,N=I-b,O=Math.hypot(P,N);if(O<.5)continue;let D=P/O,k=N/O,F=-k,H=D,Y=Math.atan2(D,k);for(let J=0;J<O;J+=1,d++){let $=x+D*J,it=b+k*J;if(d%3===0&&l.push([$,.14,it,Y]),d%7===0&&c.push([$+F*ot(-.45,.45),.72,it+H*ot(-.45,.45),Y]),d%46===0&&h.push([$,0,it,Y]),d%34===8)for(let st of[-1,1]){let Tt=$+F*(r+.4)*st,vt=it+H*(r+.4)*st;n(Tt,vt)||o.push([Tt+F*.28*st,5.4,vt+H*.28*st,Y])}if(d===520||d===560)for(let st of[-1,1]){let Tt=$+F*(r+7.5)*st,vt=it+H*(r+7.5)*st;(!n(Tt,vt)&&d===520?st>0:st<0)&&(Kd(i,Tt,vt,Y+(st>0?0:Math.PI),d===520?"Orchard":"Somerset"),a.mrt=(a.mrt||0)+1)}if(d===1e3){let st=$+F*(r+7.5),Tt=it+H*(r+7.5);n(st,Tt)||(Kd(i,st,Tt,Y,"Somerset"),a.mrt=(a.mrt||0)+1)}d===300&&(Jd(i,$,it,Y,t.w),a.erp++),d===700&&(Jd(i,$,it,Y,t.w),a.erp++),(d===470||d===940)&&(H_(i,$,it,Y,t.w),a.bridges++)}}let u=new ie,f=new Se,m=new Te,v=new L,p=new L(1,1,1),g=new Vt,M=(w,x,b,R,I)=>{if(!b.length)return;let P=new Oe(w,x,b.length);b.forEach((N,O)=>{R(N),u.compose(v,f,p),P.setMatrixAt(O,u),I&&P.setColorAt(O,I())}),P.instanceColor&&(P.instanceColor.needsUpdate=!0),P.castShadow=!1,P.receiveShadow=!0,i.add(P)},E=w=>{v.set(w[0],w[1],w[2]),m.set(0,w[3],0),f.setFromEuler(m)};M(new ut(2.1,.34,3),Ut.kerb,l,E),M(new fe(.66,7,5),new Ue({color:4152371}),c,w=>{v.set(w[0],.72,w[2]),f.identity(),p.set(1,.78,1)}),p.set(1,1,1),a.medianPlants=c.length,M(new qt(.14,.2,6.4,7),Ut.trunk,h,w=>{v.set(w[0],3.2,w[2]),f.identity()});let _=[];for(let[w,,x]of h)for(let b=0;b<7;b++)_.push([w,6.3,x,b/7*Math.PI*2]);M(new Ee(3.2,.8),Ut.leaf,_,w=>{v.set(w[0]+Math.sin(w[3])*1.4,w[1]-.35,w[2]+Math.cos(w[3])*1.4),m.set(-.95,w[3]+Math.PI/2,0,"YXZ"),f.setFromEuler(m)}),M(new ut(.06,1.6,.62),new Ct({roughness:.8,side:Ce}),o,E,()=>g.setHex(ze(O_))),a.banners=o.length;let A=[],S=[];for(let w of e.buildings){if(w.a<700)continue;let x=0,b=0;for(let J of w.p)x+=J[0],b+=J[1];x/=w.p.length,b/=w.p.length;let R=0,I=0;for(let J=0;J<w.p.length;J++){let $=w.p[J],it=w.p[(J+1)%w.p.length],st=Math.hypot(it[0]-$[0],it[1]-$[1]);st>I&&(I=st,R=J)}let P=w.p[R],N=w.p[(R+1)%w.p.length],O=(P[0]+N[0])/2,D=(P[1]+N[1])/2,k=Math.atan2(N[0]-P[0],N[1]-P[1]),F=O-x,H=D-b,Y=Math.hypot(F,H)||1;if(w.n&&I>14){let J=ze(fh),$=Math.min(26,I*.55),it=new ft(new Ee($,$*.25),new Ct({map:z_(w.n,"#"+J.toString(16).padStart(6,"0"),"#f4f1ea"),roughness:.5,emissive:1381653,emissiveIntensity:.35})),st=Math.min(w.h-2.2,7.4);it.position.set(O+F/Y*1.05,st,D+H/Y*1.05),it.rotation.y=k+Math.PI/2,i.add(it);let Tt=new ft(new ut($+.5,$*.25+.5,.3),Ut.darkMetal);Tt.position.set(O+F/Y*.85,st,D+H/Y*.85),Tt.rotation.y=k+Math.PI/2,Tt.castShadow=!0,i.add(Tt),a.nameSigns=(a.nameSigns||0)+1}w.h>34&&si(.55)&&A.push([O+F/Y*.6,w.h+2.2,D+H/Y*.6,k+Math.PI/2,Math.min(16,I*.4)]),w.h>14&&I>12&&si(.7)&&S.push([O+F/Y*1.1,9.5,D+H/Y*1.1,k+Math.PI/2])}if(A.length){let w=new Oe(new ut(1,3.2,.5),new Ct({roughness:.6}),A.length);A.forEach((x,b)=>{v.set(x[0],x[1],x[2]),m.set(0,x[3],0),f.setFromEuler(m),p.set(x[4],1,1),u.compose(v,f,p),w.setMatrixAt(b,u),w.setColorAt(b,g.setHex(ze(fh)))}),w.instanceColor&&(w.instanceColor.needsUpdate=!0),w.castShadow=!0,i.add(w),p.set(1,1,1)}return M(new ut(.9,7.5,.35),new Ct({roughness:.55}),S,E,()=>g.setHex(ze(fh))),a.roofSigns=A.length,a.banners2=S.length,a}var G_=[14172207,14723634,4637802],k_=[0,0,0],_l=class{constructor(t){this.list=t||[]}stateAt(t,e){let n=(e+t.phase)%26;return n<15?0:n<15+2.5?1:2}update(t){for(let e of this.list){let n=this.stateAt(e,t);for(let s of e.lenses)for(let r=0;r<3;r++){let a=r===0&&n===2||r===1&&n===1||r===2&&n===0;s[r].material.emissive.setHex(a?G_[r]:k_[r]),s[r].material.emissiveIntensity=a?1.1:0}}}nextStop(t,e,n,s=30){let r=null;for(let a of this.list){let o=e>0?a.s-t:t-a.s;o<-2||o>s||this.stateAt(a,n)!==0&&(r===null||o<r)&&(r=o)}return r}};var yl=class{constructor(){this.ready=!1,this.muted=!1,this._lastStep=0}start(){if(this.ready)return;let t=window.AudioContext||window.webkitAudioContext;if(!t)return;let e=new t;this.ctx=e,e.state==="suspended"&&e.resume();try{let c=e.createBuffer(1,1,e.sampleRate),h=e.createBufferSource();h.buffer=c,h.connect(e.destination),h.start(0)}catch{}this.master=e.createGain(),this.master.gain.value=0,this.master.connect(e.destination),this.engineGain=e.createGain(),this.engineGain.gain.value=0,this.engineFilter=e.createBiquadFilter(),this.engineFilter.type="lowpass",this.engineFilter.frequency.value=420,this.engineFilter.Q.value=3.2,this.engineFilter.connect(this.engineGain),this.engineGain.connect(this.master),this.osc1=e.createOscillator(),this.osc1.type="sawtooth",this.osc1.frequency.value=46,this.osc2=e.createOscillator(),this.osc2.type="sawtooth",this.osc2.frequency.value=46*2.01,this.osc3=e.createOscillator(),this.osc3.type="square",this.osc3.frequency.value=46*.5;let n=e.createGain();n.gain.value=.45;let s=e.createGain();s.gain.value=.3,this.osc1.connect(this.engineFilter),this.osc2.connect(n),n.connect(this.engineFilter),this.osc3.connect(s),s.connect(this.engineFilter),this.lfo=e.createOscillator(),this.lfo.frequency.value=5.5,this.lfoGain=e.createGain(),this.lfoGain.gain.value=1.6,this.lfo.connect(this.lfoGain),this.lfoGain.connect(this.osc1.frequency);let r=e.sampleRate*2,a=e.createBuffer(1,r,e.sampleRate),o=a.getChannelData(0),l=0;for(let c=0;c<r;c++){let h=Math.random()*2-1;l=(l+.02*h)/1.02,o[c]=l*3.2}this.noiseBuf=a,this.wind=e.createBufferSource(),this.wind.buffer=a,this.wind.loop=!0,this.windFilter=e.createBiquadFilter(),this.windFilter.type="bandpass",this.windFilter.frequency.value=700,this.windFilter.Q.value=.7,this.windGain=e.createGain(),this.windGain.gain.value=0,this.wind.connect(this.windFilter),this.windFilter.connect(this.windGain),this.windGain.connect(this.master),this.amb=e.createBufferSource(),this.amb.buffer=a,this.amb.loop=!0,this.ambFilter=e.createBiquadFilter(),this.ambFilter.type="lowpass",this.ambFilter.frequency.value=320,this.ambGain=e.createGain(),this.ambGain.gain.value=.16,this.amb.connect(this.ambFilter),this.ambFilter.connect(this.ambGain),this.ambGain.connect(this.master),this.traffic=e.createBufferSource(),this.traffic.buffer=a,this.traffic.loop=!0,this.trafficFilter=e.createBiquadFilter(),this.trafficFilter.type="bandpass",this.trafficFilter.frequency.value=240,this.trafficFilter.Q.value=.9,this.trafficGain=e.createGain(),this.trafficGain.gain.value=0,this.traffic.connect(this.trafficFilter),this.trafficFilter.connect(this.trafficGain),this.trafficGain.connect(this.master),this.traffic.start(),this.osc1.start(),this.osc2.start(),this.osc3.start(),this.lfo.start(),this.wind.start(),this.amb.start(),this.master.gain.setTargetAtTime(this.muted?0:.55,e.currentTime,.4),this.ready=!0,document.addEventListener("visibilitychange",()=>{!document.hidden&&this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume()})}poke(){this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume()}setMuted(t){this.muted=t,this.ready&&this.master.gain.setTargetAtTime(t?0:.55,this.ctx.currentTime,.15)}update(t,e,n,s,r=999){if(!this.ready||this.muted)return;let a=this.ctx.currentTime,o=Math.abs(t),l=Math.max(0,1-r/42);if(this.trafficGain.gain.setTargetAtTime(.02+l*l*.16,a,.35),this.trafficFilter.frequency.setTargetAtTime(210+l*220,a,.4),e==="ride"){let c=44+Math.pow(o,.86)*9.4;this.osc1.frequency.setTargetAtTime(c,a,.06),this.osc2.frequency.setTargetAtTime(c*2.01,a,.06),this.osc3.frequency.setTargetAtTime(c*.5,a,.06),this.engineFilter.frequency.setTargetAtTime(380+o*165,a,.1),this.engineGain.gain.setTargetAtTime(.1+Math.min(.3,o*.028),a,.12),this.windGain.gain.setTargetAtTime(Math.min(.3,o*o*.0022),a,.2),this.windFilter.frequency.setTargetAtTime(520+o*60,a,.2)}else if(this.engineGain.gain.setTargetAtTime(0,a,.25),this.windGain.gain.setTargetAtTime(0,a,.3),n>.3){let c=Math.floor(s*2.4/Math.PI);c!==this._lastStep&&(this._lastStep=c,this._footstep(n))}}_footstep(t){let e=this.ctx,n=e.currentTime,s=e.createBufferSource();s.buffer=this.noiseBuf,s.playbackRate.value=1.6;let r=e.createBiquadFilter();r.type="bandpass",r.frequency.value=1150,r.Q.value=1.1;let a=e.createGain();a.gain.setValueAtTime(0,n),a.gain.linearRampToValueAtTime(.055*Math.min(1,t/2),n+.008),a.gain.exponentialRampToValueAtTime(1e-4,n+.13),s.connect(r),r.connect(a),a.connect(this.master),s.start(n,Math.random()*1.5),s.stop(n+.16)}};var vl=class{constructor(t){this.pts=t,this.cum=[0];for(let e=0;e<t.length-1;e++)this.cum.push(this.cum[e]+Math.hypot(t[e+1][0]-t[e][0],t[e+1][1]-t[e][1]));this.len=this.cum[this.cum.length-1]}nearestS(t,e){let n=0,s=1/0;for(let r=0;r<this.pts.length;r++){let a=(this.pts[r][0]-t)**2+(this.pts[r][1]-e)**2;a<s&&(s=a,n=this.cum[r])}return n}at(t,e){let n=(t%this.len+this.len)%this.len,s=0,r=this.cum.length-1;for(;s<r-1;){let u=s+r>>1;this.cum[u]<=n?s=u:r=u}let a=this.pts[s],o=this.pts[Math.min(s+1,this.pts.length-1)],l=Math.max(1e-4,this.cum[s+1]-this.cum[s]),c=(n-this.cum[s])/l,h=(o[0]-a[0])/l,d=(o[1]-a[1])/l;return e[0]=a[0]+(o[0]-a[0])*c,e[1]=a[1]+(o[1]-a[1])*c,e[2]=h,e[3]=d,e}},V_=[9268046,11043422,7295288,12819058,8215616],W_=[1840914,2760986,1183500,4009762,5588024],X_=[13194559,15262420,3100014,14271625,9080726,7176026,11903172,3885650,13994602,4878196,14734008,9194069],q_=[3356735,2831168,4867904,5854044,7498334,2040875],Ml=class{constructor(t,e,n=150){this.path=new vl(t.p),this.half=t.w/2,this.isBlocked=e,this.count=n,this.people=[],this.crossings=[]}setCrossings(t){this.crossings=t||[]}_nearCrossing(t){for(let e of this.crossings){let n=e-(t%this.path.len+this.path.len)%this.path.len;if(Math.abs(n)<2)return e}return null}_pedGreen(t,e,n){if(!n)return!0;for(let s of n.list)if(Math.abs(s.s-t)<70)return n.stateAt(s,e)===2;return!0}build(t){let e=this.count,n=(c,h)=>{let d=new Oe(c,h,e);return d.castShadow=!0,d.frustumCulled=!1,t.add(d),d},s=c=>new Ue(c?{color:c}:{});this.head=n(new fe(.105,12,10),s()),this.hair=n(new fe(.112,12,8,0,Math.PI*2,0,Math.PI*.62),s()),this.torso=n(new Re(.125,.34,4,10),s()),this.hips=n(new Re(.115,.1,3,8),s()),this.armL=n(new Re(.045,.4,3,7),s()),this.armR=n(new Re(.045,.4,3,7),s()),this.legL=n(new Re(.058,.44,3,7),s()),this.legR=n(new Re(.058,.44,3,7),s()),this.bag=n(new ut(.22,.26,.1),s()),this.shoeL=n(new ut(.11,.07,.25),s(2828067)),this.shoeR=n(new ut(.11,.07,.25),s(2828067)),this.handL=n(new fe(.052,7,6),s()),this.handR=n(new fe(.052,7,6),s()),this.neck=n(new qt(.052,.06,.1,7),s());let r=new Vt,a=new Vt,o=new Vt,l=new Vt;for(let c=0;c<e;c++){let h=si(.5)?1:-1,d=si(.5)?1:-1,u={s:cn()*this.path.len,off:h*(this.half+ot(3.2,10.5)),dir:d,speed:ot(.95,1.65)*(si(.12)?0:1),phase:cn()*Math.PI*2,scale:ot(.92,1.08),hasBag:si(.38),bagSide:si(.5)?1:-1,crosser:si(.34),crossing:!1,crossT:0,crossFrom:0,crossTo:0};u.cTop=ze(X_),u.cBot=ze(q_),u.cSkin=ze(V_),u.cHair=ze(W_),this.people.push(u),r.setHex(u.cTop),a.setHex(u.cBot),o.setHex(u.cSkin),l.setHex(u.cHair),this.torso.setColorAt(c,r),this.armL.setColorAt(c,r),this.armR.setColorAt(c,r),this.hips.setColorAt(c,a),this.legL.setColorAt(c,a),this.legR.setColorAt(c,a),this.head.setColorAt(c,o),this.hair.setColorAt(c,l),this.bag.setColorAt(c,a),this.handL.setColorAt(c,o),this.handR.setColorAt(c,o),this.neck.setColorAt(c,o)}for(let c of[this.torso,this.armL,this.armR,this.hips,this.legL,this.legR,this.head,this.hair,this.bag,this.handL,this.handR,this.neck])c.instanceColor&&(c.instanceColor.needsUpdate=!0);return this._m=new ie,this._q=new Se,this._e=new Te,this._p=new L,this._s=new L(1,1,1),this._tmp=[0,0,0,0],this.update(0,0),e}update(t,e,n=1e9,s=1e9,r=null){let{_m:a,_q:o,_e:l,_p:c,_s:h,_tmp:d}=this,u=this._hidden||(this._hidden=new ie().makeTranslation(0,-9999,0)),f=0,m=this._parts||(this._parts=[this.head,this.hair,this.torso,this.hips,this.armL,this.armR,this.legL,this.legR,this.bag,this.shoeL,this.shoeR,this.handL,this.handR,this.neck]);for(let v=0;v<this.people.length;v++){let p=this.people[v];if(p.crossing){p.crossT+=e/5.2;let q=p.crossT<.5?2*p.crossT*p.crossT:1-2*(1-p.crossT)*(1-p.crossT);p.off=p.crossFrom+(p.crossTo-p.crossFrom)*Math.min(1,q),p.crossT>=1&&(p.crossing=!1,p.off=p.crossTo,p.waited=0)}else if(p.crosser&&p.speed>.1){let q=this._nearCrossing(p.s);q!==null&&this._pedGreen(q,t,r)?(p.crossing=!0,p.crossT=0,p.crossFrom=p.off,p.crossTo=-p.off):p.s+=p.dir*p.speed*e}else p.s+=p.dir*p.speed*e;this.path.at(p.s,d);let[g,M,E,_]=d,A=-_,S=E,w=g+A*p.off,x=M+S*p.off,b=w-n,R=x-s,I=Math.hypot(b,R);if(I<2.6){let q=(2.6-I)/2.6;p.dodge=(p.dodge||0)+(q*1.5-(p.dodge||0))*Math.min(1,e*5)}else p.dodge&&(p.dodge+=(0-p.dodge)*Math.min(1,e*2.2),Math.abs(p.dodge)<.01&&(p.dodge=0));let P=p.off>=0?1:-1,N=w+A*(p.dodge||0)*P,O=x+S*(p.dodge||0)*P;if(this.isBlocked(N,O))continue;let D=N-n,k=O-s;if(D*D+k*k>11025)continue;let F=f++,H=Math.atan2(E*p.dir,_*p.dir),Y=p.scale,J=p.crossing||p.speed>.1,$=J?Math.sin(t*5.2*(p.speed/1.3)+p.phase):0,it=J?Math.abs(Math.cos(t*5.2+p.phase))*.022:0,st=(q,rt,et,ht,Ot,Nt)=>{let ae=N+(A*rt+E*ht),It=O+(S*rt+_*ht);c.set(ae,et*Y+it,It),l.set(Ot||0,H,Nt||0,"YXZ"),o.setFromEuler(l),h.set(Y,Y,Y),a.compose(c,o,h),q.setMatrixAt(F,a)};st(this.neck,0,1.47,.005),st(this.head,0,1.615,.01),st(this.hair,0,1.635,.005),st(this.torso,0,1.22,0),st(this.hips,0,.94,0),st(this.armL,-.19,1.2,0,$*.62),st(this.armR,.19,1.2,0,-$*.62),st(this.legL,-.085,.52,0,-$*.72),st(this.legR,.085,.52,0,$*.72),st(this.shoeL,-.085,.06,.02-$*.3),st(this.shoeR,.085,.06,.02+$*.3),st(this.handL,-.205,.99,$*.27),st(this.handR,.205,.99,-$*.27),p.hasBag?st(this.bag,p.bagSide*.26,1.02,-.06):this.bag.setMatrixAt(F,u);let Tt=this._cc||(this._cc=new Vt),vt=(q,rt)=>{q.instanceColor&&(Tt.setHex(rt),q.setColorAt(F,Tt))};vt(this.torso,p.cTop),vt(this.armL,p.cTop),vt(this.armR,p.cTop),vt(this.hips,p.cBot),vt(this.legL,p.cBot),vt(this.legR,p.cBot),vt(this.bag,p.cBot),vt(this.head,p.cSkin),vt(this.handL,p.cSkin),vt(this.handR,p.cSkin),vt(this.neck,p.cSkin),vt(this.hair,p.cHair)}for(let v of m)v.count=f,v.instanceMatrix.needsUpdate=!0,v.instanceColor&&(v.instanceColor.needsUpdate=!0)}},Y_=[14211806,2830392,9409948,8007466,2572382,12172480,4016703],Sl=class{constructor(t,e=16,n=3){this.path=new vl(t.p),this.half=t.w/2,this.nCars=e,this.nBuses=n,this.items=[]}build(t,e=0){let n=this.nCars,s=this.nBuses,r=(u,f,m)=>{let v=new Oe(u,f,m);return v.castShadow=!0,v.receiveShadow=!0,v.frustumCulled=!1,t.add(v),v},a=new Ct({roughness:.38,metalness:.3}),o=new Ct({color:2765370,roughness:.12,metalness:.2}),l=new Ct({color:2369323,roughness:.85});this.body=r(new ut(1.78,.62,4.32),a,n),this.roof=r(new ut(1.64,.5,2.1),a,n),this.glaze=r(new ut(1.69,.38,2),o,n),this.wheel=r(new qt(.31,.31,.2,10),l,n*4),this.busBody=r(new ut(2.5,2.5,11.8),new Ct({roughness:.5}),s),this.busSkirt=r(new ut(2.54,.62,11.7),new Ct({color:15790057,roughness:.6}),s),this.busGlaze=r(new ut(2.54,.95,10.4),o,s),this.busBlind=r(new ut(1.65,.42,.08),new Ct({color:1711392,emissive:14197308,emissiveIntensity:.5}),s),this.busWheel=r(new qt(.48,.48,.28,10),l,s*4);let c=new Vt;for(let u=0;u<n;u++){let f=u%2===0?1:-1,m=ot(7,12);this.items.push({kind:"car",i:u,s:e+55+(this.path.len-110)/n*u+ot(-6,6),lane:f*(1.9+(u%4<2?0:3.4)),dir:f,speed:m,base:m}),c.setHex(ze(Y_)),this.body.setColorAt(u,c),this.roof.setColorAt(u,c)}this.body.instanceColor&&(this.body.instanceColor.needsUpdate=!0),this.roof.instanceColor&&(this.roof.instanceColor.needsUpdate=!0);let h=[4160838,4160838,12858415],d=new Vt;for(let u=0;u<s;u++){let f=u%2===0?1:-1;d.setHex(h[u%h.length]),this.busBody.setColorAt(u,d);let m=ot(6,9);this.items.push({kind:"bus",i:u,s:e+140+(this.path.len-200)/s*u+ot(-15,15),lane:f*5.4,dir:f,speed:m,base:m})}return this.busBody.instanceColor&&(this.busBody.instanceColor.needsUpdate=!0),this._m=new ie,this._q=new Se,this._e=new Te,this._p=new L,this._s=new L(1,1,1),this._tmp=[0,0,0,0],this.update(0,0),n+s}nearest(t,e){let n=1e9;for(let s of this.items){if(!s.wx)continue;let r=(t-s.wx)**2+(e-s.wz)**2;r<n&&(n=r)}return Math.sqrt(n)}hits(t,e,n=.85){for(let s of this.items){if(!s.wx)continue;let r=t-s.wx,a=e-s.wz;if(r*r+a*a>60)continue;let o=Math.cos(-s.heading),l=Math.sin(-s.heading),c=r*o-a*l,h=r*l+a*o,d=(s.kind==="bus"?1.35:.95)+n,u=(s.kind==="bus"?6:2.25)+n;if(Math.abs(c)<d&&Math.abs(h)<u)return s}return null}update(t,e,n){let{_m:s,_q:r,_e:a,_p:o,_s:l,_tmp:c}=this;for(let h of this.items){let d=h.base;if(n){let S=n.nextStop(h.s,h.dir,t,34);S!==null&&(d=S<=3?0:h.base*Math.min(1,(S-3)/22))}for(let S of this.items){if(S===h||S.dir!==h.dir||Math.abs(S.lane-h.lane)>1.6)continue;let w=(S.s-h.s)*h.dir,x=h.kind==="bus"||S.kind==="bus"?15:9;w>0&&w<x&&(d=Math.min(d,h.base*Math.max(0,(w-4.5)/(x-4.5))))}let u=d<h.speed?7:2.2;h.speed+=(d-h.speed)*Math.min(1,u*e),h.s+=h.dir*h.speed*e,this.path.at(h.s,c);let[f,m,v,p]=c,g=-p,M=v,E=f+g*h.lane,_=m+M*h.lane,A=Math.atan2(v*h.dir,p*h.dir);if(h.wx=E,h.wz=_,h.heading=A,a.set(0,A,0),r.setFromEuler(a),h.kind==="car"){o.set(E,.62,_),s.compose(o,r,l),this.body.setMatrixAt(h.i,s),o.set(E-v*.35*h.dir,1.14,_-p*.35*h.dir),s.compose(o,r,l),this.roof.setMatrixAt(h.i,s),s.compose(o,r,l),this.glaze.setMatrixAt(h.i,s);for(let S=0;S<4;S++){let w=(S<2?1.4:-1.4)*h.dir,x=S%2?.86:-.86;o.set(E+v*w+g*x,.31,_+p*w+M*x),a.set(0,A,Math.PI/2,"YXZ"),this._q2=this._q2||new Se,this._q2.setFromEuler(a),s.compose(o,this._q2,l),this.wheel.setMatrixAt(h.i*4+S,s)}}else{o.set(E,1.55,_),s.compose(o,r,l),this.busBody.setMatrixAt(h.i,s),o.set(E,.62,_),s.compose(o,r,l),this.busSkirt.setMatrixAt(h.i,s),o.set(E,2.05,_),s.compose(o,r,l),this.busGlaze.setMatrixAt(h.i,s),o.set(E+v*5.95*h.dir,2.42,_+p*5.95*h.dir),s.compose(o,r,l),this.busBlind.setMatrixAt(h.i,s);for(let S=0;S<4;S++){let w=(S<2?3.6:-3.6)*h.dir,x=S%2?1.2:-1.2;o.set(E+v*w+g*x,.48,_+p*w+M*x),a.set(0,A,Math.PI/2,"YXZ"),this._q2=this._q2||new Se,this._q2.setFromEuler(a),s.compose(o,this._q2,l),this.busWheel.setMatrixAt(h.i*4+S,s)}}}for(let h of[this.body,this.roof,this.glaze,this.wheel,this.busBody,this.busSkirt,this.busGlaze,this.busBlind,this.busWheel])h.instanceMatrix.needsUpdate=!0}};var Z_=[11876142,2051962,14067004,3107663,8011629,13593402,2830131];function jd(i,t,e){let n=t.p,s=t.w/2,r=[],a=[],o=[],l=[],c=[],h=[],d=[],u=[],f=[],m=0;for(let N=0;N<n.length-1;N++){let[O,D]=n[N],[k,F]=n[N+1],H=k-O,Y=F-D,J=Math.hypot(H,Y);if(J<.5)continue;let $=H/J,it=Y/J,st=-it,Tt=$,vt=Math.atan2($,it);for(let q=0;q<J;q+=1,m++){let rt=O+$*q,et=D+it*q;for(let ht of[-1,1]){let Ot=(s+1.1)*ht,Nt=rt+st*Ot,ae=et+Tt*Ot;if(m%2===0&&!e(Nt,ae)&&(r.push([Nt,1,ae,vt]),m%4===0&&a.push([Nt,.55,ae,vt])),m%260===8){let It=rt+st*(s+3)*ht,j=et+Tt*(s+3)*ht;e(It,j)||f.push([It,j,vt,ht])}if(m%260===120){let It=rt+st*(s+5.6)*ht,j=et+Tt*(s+5.6)*ht;e(It,j)||o.push([It,j,vt,ht])}if(m%190===30){let It=rt+st*(s+1.6)*ht,j=et+Tt*(s+1.6)*ht;e(It,j)||l.push([It,j,vt,ht,m])}if(m%46===12){let It=rt+st*(s+6.4)*ht,j=et+Tt*(s+6.4)*ht;e(It,j)||h.push([It,.32,j,vt])}if(m%120===60){let It=rt+st*(s+4.2)*ht,j=et+Tt*(s+4.2)*ht;e(It,j)||d.push([It,.46,j,vt])}if(m%26===8){let It=rt+st*(s+12.5)*ht,j=et+Tt*(s+12.5)*ht;e(It,j)&&c.push([rt+st*(s+11.4)*ht,ot(6.2,7.6),et+Tt*(s+11.4)*ht,vt,ht])}}}}let v=new ie,p=new Se,g=new Te,M=new L,E=new L(1,1,1),_=(N,O,D,k,F)=>{if(!D.length)return null;let H=new Oe(N,O,D.length);return D.forEach((Y,J)=>{k(Y),v.compose(M,p,E),H.setMatrixAt(J,v),F&&H.setColorAt(J,F(Y,J))}),H.instanceColor&&(H.instanceColor.needsUpdate=!0),H.castShadow=!1,H.receiveShadow=!0,i.add(H),H},A=N=>{M.set(N[0],N[1],N[2]),g.set(0,N[3],0),p.setFromEuler(g)};_(new ut(.06,.05,2),Ut.metal,r,A),_(new ut(.05,.04,2),Ut.metal,r,N=>{M.set(N[0],.62,N[2]),g.set(0,N[3],0),p.setFromEuler(g)}),_(new qt(.035,.035,1,6),Ut.metal,a,A),_(new qt(.55,.46,.64,10),Ut.conc,h,A),_(new fe(.52,8,6),Ut.canopy,h,N=>{M.set(N[0],.86,N[2]),p.identity()}),_(new qt(.24,.2,.9,8),Ut.darkMetal,d,A);let S=new Vt;_(new ut(.28,1.05,2.6),new Ct({roughness:.55}),c,N=>{M.set(N[0],N[1],N[2]),g.set(0,N[3],0),p.setFromEuler(g)},()=>S.setHex(ze(Z_)));for(let[N,O,D,k]of o){let F=new ge,H=new ft(new ut(9.2,.16,3.1),Ut.trim);H.position.y=3,H.castShadow=!0,F.add(H);for(let it=0;it<4;it++){let st=new ft(new qt(.07,.07,3,8),Ut.metal);st.position.set(-4.1+it*2.7,1.5,1.35),st.castShadow=!0,F.add(st)}let Y=new ft(new ut(8.8,1.7,.08),Ut.glass);Y.position.set(0,1.95,-1.4),F.add(Y);let J=new ft(new ut(7.4,.09,.46),Ut.metal);J.position.set(0,.62,-1.1),J.castShadow=!0,F.add(J);let $=new ft(new ut(.9,1.5,.1),new Ct({color:2568506,roughness:.3}));$.position.set(4.4,1.7,-1),F.add($),F.position.set(N,0,O),F.rotation.y=D,i.add(F)}let w=new Map;for(let[N,O,D,k,F]of l){let H=new ge,Y=new ft(new qt(.09,.11,5.4,8),Ut.darkMetal);Y.position.y=2.7,Y.castShadow=!0,H.add(Y);let J=new ft(new qt(.06,.06,3,6),Ut.darkMetal);J.position.set(-1.5*k,5.2,0),J.rotation.z=Math.PI/2,J.castShadow=!0,H.add(J);let $=new ft(new ut(.32,.86,.3),Ut.darkMetal);$.position.set(-2.9*k,4.9,0),$.castShadow=!0,H.add($);let it=[];for(let st=0;st<3;st++){let Tt=new ft(new Li(.1,10),new Ct({color:[5906200,5915674,1785639][st],emissive:0,emissiveIntensity:1}));Tt.position.set(-2.9*k,5.18-st*.27,.16),H.add(Tt),it.push(Tt)}H.position.set(N,0,O),H.rotation.y=D,i.add(H),w.has(F)||w.set(F,{s:F,lenses:[],phase:w.size*5.5}),w.get(F).lenses.push(it)}for(let[N,O,D,k]of f){let F=new ge,H=new ft(new qt(.06,.06,3,8),Ut.metal);H.position.y=1.5,H.castShadow=!0,F.add(H);let Y=new ft(new ut(1,.5,.08),new Ct({color:14201916,roughness:.55}));Y.position.set(0,2.9,0),Y.castShadow=!0,F.add(Y);for(let q=0;q<5;q++){let rt=new ft(new ut(.05,.04,1.4),Ut.metal);rt.position.set(-.9,1,1+q*1.4),F.add(rt);let et=new ft(new qt(.03,.03,1,6),Ut.metal);et.position.set(-.9,.5,.4+q*1.4),F.add(et)}let J=Math.random()<.5?3104670:2040357,$=new ge,it=new Ct({color:J,roughness:.4,metalness:.3}),st=new Ct({color:2765370,roughness:.12,metalness:.2}),Tt=(q,rt,et,ht,Ot,Nt,ae)=>{let It=new ft(new ut(q,rt,et),ht);It.position.set(Ot,Nt,ae),It.castShadow=!0,$.add(It)};Tt(1.78,.62,4.4,it,0,.6,0),Tt(1.64,.52,2.1,it,0,1.12,-.25),Tt(1.69,.4,2,st,0,1.1,-.25),Tt(.62,.2,.5,new Ct({color:15786672,emissive:14198844,emissiveIntensity:.5}),0,1.48,-.25);let vt=new qt(.31,.31,.22,10);for(let[q,rt]of[[.86,1.45],[-.86,1.45],[.86,-1.45],[-.86,-1.45]]){let et=new ft(vt,Ut.darkMetal);et.rotation.x=Math.PI/2,et.position.set(q,.31,rt),et.castShadow=!0,$.add(et)}$.position.set(-2.6*k,0,2),F.add($),F.position.set(N,0,O),F.rotation.y=D,i.add(F)}let x=[],b=[],R=[],I=0;for(let N=0;N<n.length-1;N++){let[O,D]=n[N],[k,F]=n[N+1],H=k-O,Y=F-D,J=Math.hypot(H,Y);if(J<.5)continue;let $=H/J,it=Y/J,st=-it,Tt=$,vt=Math.atan2($,it);for(let q=0;q<J;q+=1,I++){if(I%4!==0)continue;let rt=O+$*q,et=D+it*q;for(let ht of[-1,1]){let Ot=rt+st*(s+9)*ht,Nt=et+Tt*(s+9)*ht;e(rt+st*(s+13.5)*ht,et+Tt*(s+13.5)*ht)&&(b.push([Ot,3.35,Nt,vt]),R.push([Ot,3.12,Nt,vt]),x.push([Ot+st*1.5*ht,1.6,Nt+Tt*1.5*ht,vt]),x.push([Ot-st*1.5*ht,1.6,Nt-Tt*1.5*ht,vt]))}}}return _(new ut(3.4,.13,4.1),Ut.trim,b,A),_(new ut(.18,.22,4.1),Ut.metal,R,A),_(new qt(.075,.075,3.2,8),Ut.metal,x,A),{signals:[...w.values()],taxiStands:f.length,linkway:b.length,rails:r.length,shelters:o.length,lights:l.length,signs:c.length,planters:h.length}}function tf(i,t,e){let n=document.createElement("canvas");n.width=i,n.height=t,e(n.getContext("2d"),i,t);let s=new Kn(n);return s.colorSpace=De,s.anisotropy=4,s}function $_(i){return tf(512,192,(t,e,n)=>{t.fillStyle="#0f6b3f",t.fillRect(0,0,e,n),t.strokeStyle="#f2f4f0",t.lineWidth=5,t.strokeRect(9,9,e-18,n-18),t.fillStyle="#f2f4f0",t.font="600 44px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial",t.textBaseline="middle",i.forEach((s,r)=>{let a=i.length===1?n/2:58+r*62;t.fillText(s.text,34,a),t.save(),t.translate(e-66,a),s.dir==="left"&&t.rotate(Math.PI),t.beginPath(),t.moveTo(-20,0),t.lineTo(14,0),t.moveTo(2,-12),t.lineTo(14,0),t.lineTo(2,12),t.lineWidth=7,t.strokeStyle="#f2f4f0",t.lineJoin="round",t.stroke(),t.restore()})})}function J_(i){return tf(512,128,(t,e,n)=>{t.fillStyle="#f4f4f1",t.fillRect(0,0,e,n),t.fillStyle="#20477e",t.fillRect(0,0,e,22),t.fillStyle="#1b1d1f",t.font="700 52px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial",t.textBaseline="middle",t.textAlign="center";let s=52;for(;t.measureText(i.toUpperCase()).width>e-46&&s>22;)s-=2,t.font=`700 ${s}px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial`;t.fillText(i.toUpperCase(),e/2,n/2+10)})}function ef(i,t,e,n){let s=t.p,r=t.w/2,a={gantries:0,plates:0},o=[...new Set(e.roads.map(c=>c.n).filter(c=>c&&!/orchard road/i.test(c)))],l=0;for(let c=0;c<s.length-1;c++){let[h,d]=s[c],[u,f]=s[c+1],m=u-h,v=f-d,p=Math.hypot(m,v);if(p<.5)continue;let g=m/p,M=v/p,E=-M,_=g,A=Math.atan2(g,M);for(let S=0;S<p;S+=1,l++){let w=h+g*S,x=d+M*S;if(l%230===90){let b=new ge,R=new ft(new qt(.13,.16,7.2,8),Ut.darkMetal);R.position.set(E*(r+1),3.6,_*(r+1)),R.castShadow=!0,b.add(R);let I=new ft(new ut(r*1.1,.16,.16),Ut.darkMetal);I.position.set(E*(r*.45),7,_*(r*.45)),I.rotation.y=A,I.castShadow=!0,b.add(I);let P=ze(o)||"Scotts Road",N=ze(o)||"Paterson Road",O=new ft(new Ee(4.6,1.72),new Rn({map:$_([{text:P.slice(0,16),dir:"left"},{text:N.slice(0,16),dir:"right"}])}));O.position.set(E*(r*.42),5.9,_*(r*.42)),O.rotation.y=A+Math.PI,b.add(O);let D=new ft(new ut(4.6,1.72,.09),Ut.darkMetal);D.position.copy(O.position),D.position.y-=0,D.rotation.y=A,D.castShadow=!0,b.add(D),b.position.set(w,0,x),i.add(b),a.gantries++}if(l%150===40)for(let b of[-1,1]){let R=w+E*(r+2.4)*b,I=x+_*(r+2.4)*b;if(n(R,I))continue;let P=new ge,N=new ft(new qt(.05,.05,2.6,6),Ut.metal);N.position.y=1.3,N.castShadow=!0,P.add(N);let O=new ft(new Ee(1.5,.38),new Rn({map:J_("Orchard Road"),side:Ce}));O.position.y=2.5,P.add(O),P.position.set(R,0,I),P.rotation.y=A+Math.PI/2,i.add(P),a.plates++}}}return a}var bl=class{constructor(t,e){this.places=[];for(let n of t.buildings){if(!n.n)continue;let s=0,r=0;for(let a of n.p)s+=a[0],r+=a[1];this.places.push({n:n.n,x:s/n.p.length,z:r/n.p.length,a:n.a})}this.axis=e,this.current="",this.el=document.getElementById("place"),this.map=document.getElementById("map"),this.mapCtx=this.map?this.map.getContext("2d"):null,this.bounds=this._bounds(t),this.base=this._renderBase(t),this._t=0}_bounds(t){let e=1e9,n=-1e9,s=1e9,r=-1e9;for(let a of t.buildings)for(let[o,l]of a.p)o<e&&(e=o),o>n&&(n=o),l<s&&(s=l),l>r&&(r=l);return{mnx:e,mxx:n,mnz:s,mxz:r}}_renderBase(t){if(!this.map)return null;let e=this.map.width,n=document.createElement("canvas");n.width=n.height=e;let s=n.getContext("2d"),{mnx:r,mxx:a,mnz:o,mxz:l}=this.bounds,c=Math.max(a-r,l-o)||1,h=u=>(u-r)/c*e*.94+e*.03,d=u=>(u-o)/c*e*.94+e*.03;this.px=h,this.pz=d,s.fillStyle="rgba(12,16,20,0.72)",s.fillRect(0,0,e,e),s.fillStyle="rgba(198,205,212,0.30)";for(let u of t.buildings)s.beginPath(),u.p.forEach(([f,m],v)=>v?s.lineTo(h(f),d(m)):s.moveTo(h(f),d(m))),s.closePath(),s.fill();return s.strokeStyle="rgba(255,214,150,0.95)",s.lineWidth=2.2,s.beginPath(),this.axis.p.forEach(([u,f],m)=>m?s.lineTo(h(u),d(f)):s.moveTo(h(u),d(f))),s.stroke(),n}update(t,e){if(this._t+=e,this._t<.25)return;this._t=0;let n=null,s=1/0;for(let r of this.places){let a=Math.hypot(r.x-t.x,r.z-t.z)-Math.min(60,Math.sqrt(r.a)*.5);a<s&&(s=a,n=r)}if(this.el){let r=n&&s<90?n.n:"Orchard Road";r!==this.current&&(this.current=r,this.el.textContent=r)}if(this.mapCtx&&this.base){let r=this.map.width,a=this.mapCtx;a.clearRect(0,0,r,r),a.drawImage(this.base,0,0);let o=this.px(t.x),l=this.pz(t.z);a.save(),a.translate(o,l),a.rotate(-t.heading),a.fillStyle="rgba(255,214,150,0.28)",a.beginPath(),a.moveTo(0,0),a.arc(0,0,16,-Math.PI/2-.5,-Math.PI/2+.5),a.closePath(),a.fill(),a.restore(),a.fillStyle="#ffd696",a.beginPath(),a.arc(o,l,3.4,0,Math.PI*2),a.fill()}}};var Sn=new URLSearchParams(location.search),of=document.getElementById("hud"),ls=document.getElementById("c"),un=new hl({canvas:ls,antialias:!0,powerPreference:"high-performance"});un.outputColorSpace=De;un.toneMapping=Fr;un.toneMappingExposure=1;un.shadowMap.enabled=!Sn.has("noshadow");un.shadowMap.type=xo;var En=new dr;En.fog=new ur(13222834,.0021);var Qe=new nn(58,1,.3,1400),rs=new L(-.52,.8,-.3).normalize();En.add(new ft(new fe(900,40,24),new ln({side:Je,depthWrite:!1,fog:!1,uniforms:{top:{value:new Vt(qe.skyTop)},mid:{value:new Vt(qe.skyMid)},haze:{value:new Vt(qe.skyHaze)},cloud:{value:new Vt(qe.cloud)},sun:{value:rs.clone()}},vertexShader:`varying vec3 vW;
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
      }`})));var Ze=new Dr(16773334,2.6);Ze.castShadow=!0;Ze.shadow.mapSize.set(2048,2048);Ze.shadow.camera.left=-95;Ze.shadow.camera.right=95;Ze.shadow.camera.top=95;Ze.shadow.camera.bottom=-95;Ze.shadow.camera.near=1;Ze.shadow.camera.far=460;Ze.shadow.bias=-5e-4;Ze.shadow.normalBias=.05;En.add(Ze,Ze.target);En.add(new Pr(10930402,9733487,1.35));var hn=new ge;En.add(hn);var Zs=12,El=new Map;function K_(i){for(let t of i.buildings){let e=1e9,n=-1e9,s=1e9,r=-1e9;for(let[a,o]of t.p)e=Math.min(e,a),n=Math.max(n,a),s=Math.min(s,o),r=Math.max(r,o);for(let a=Math.floor(e/Zs);a<=Math.floor(n/Zs);a++)for(let o=Math.floor(s/Zs);o<=Math.floor(r/Zs);o++){let l=a+","+o;El.has(l)||El.set(l,[]),El.get(l).push(t.p)}}}function Q_(i,t,e){let n=!1;for(let s=0,r=i.length-1;s<i.length;r=s++){let a=i[s][0],o=i[s][1],l=i[r][0],c=i[r][1];o>e!=c>e&&t<(l-a)*(e-o)/(c-o)+a&&(n=!n)}return n}function bn(i,t){let e=El.get(Math.floor(i/Zs)+","+Math.floor(t/Zs));if(!e)return!1;for(let n of e)if(Q_(n,i,t))return!0;return!1}function j_(i,t){if(!t)return 0;let e=t.p,n=t.w/2,s=new Qr,r=[],a=[],o=[],l=[],c=[],h=[],d=0;for(let M=0;M<e.length-1;M++){let[E,_]=e[M],[A,S]=e[M+1],w=A-E,x=S-_,b=Math.hypot(w,x);if(b<.5)continue;let R=w/b,I=x/b,P=-I,N=R,O=Math.atan2(R,I);for(let D=0;D<b;D+=1,d++){let k=E+R*D,F=_+I*D;for(let H of[-1,1]){let Y=k+P*(n+.4)*H,J=F+N*(n+.4)*H;if(d%13===(H>0?0:6))for(let $ of[3.2,2.2,4.4]){let it=k+P*(n+$)*H,st=F+N*(n+$)*H;if(!bn(it,st)){s.add(it,st,ot(.85,1.15));break}}d%34===0&&(a.push([Y,4.5,J,0]),o.push([Y-P*1.1*H,8.9,J-N*1.1*H,O,H]),l.push([Y-P*2.3*H,8.75,J-N*2.3*H,O])),d%2===0&&r.push([Y,.15,J,O])}if(d%190===0&&d>40){h.push(d);for(let H=-3;H<=3;H++)c.push([k+P*H*1.3,.035,F+N*H*1.3,O])}}}let u=new ie,f=new Se,m=new Te,v=new L,p=new L(1,1,1),g=(M,E,_,A)=>{if(!_.length)return;let S=new Oe(M,E,_.length);_.forEach((w,x)=>{A(w),u.compose(v,f,p),S.setMatrixAt(x,u)}),S.castShadow=!1,S.receiveShadow=!0,hn.add(S)};return g(new ut(.42,.3,2),Ut.kerb,r,M=>{v.set(M[0],M[1],M[2]),m.set(0,M[3],0),f.setFromEuler(m)}),g(new qt(.11,.16,9,8),Ut.metal,a,M=>{v.set(M[0],M[1],M[2]),f.identity()}),g(new qt(.07,.07,2.4,6),Ut.metal,o,M=>{v.set(M[0],M[1],M[2]),m.set(0,M[3],Math.PI/2-.2*M[4]),f.setFromEuler(m)}),g(new ut(1,.2,.44),Ut.trim,l,M=>{v.set(M[0],M[1],M[2]),m.set(0,M[3],0),f.setFromEuler(m)}),g(new Ee(.62,t.w),Ut.white,c,M=>{v.set(M[0],M[1],M[2]),m.set(-Math.PI/2,M[3]+Math.PI/2,0,"YXZ"),f.setFromEuler(m)}),window.__crossings=h,s.build(hn)}var ia=zd(),_h=Hd();ia.group.add(_h);var Tl=new ge;Tl.add(ia.group);En.add(Tl);var Pt=gl(0,0,0),lf=!1,sa={},kn=null,Ke=null,na=null,Dn=null,Un="ride",yi=new yl;for(let i of["touchstart","touchend","pointerdown","mousedown","keydown","click"])addEventListener(i,()=>{yi.start(),yi.poke()},{passive:!0});var as=0,ra=.16,jt=Xd(),os=Yd();os.group.visible=!1;En.add(os.group);var _i=0;fetch("./data/orchard.json").then(i=>i.json()).then(i=>{K_(i);let t=Sn.has("nobuild")?{count:0,tall:0}:Bd(hn,i),e=Od(hn,i),n=i.axis||e,s=new ft(new Ee(2600,2600),new Ct({color:10130308,roughness:.95}));s.rotation.x=-Math.PI/2,s.position.y=-.05,s.receiveShadow=!0,hn.add(s);let r=Sn.has("nofoliage")?0:j_(i,n);!Sn.has("nopeople")&&n&&(kn=new Ml(n,bn,260),kn.build(hn),window.__crossings&&kn.setCrossings(window.__crossings)),!Sn.has("notraffic")&&n&&(Ke=new Sl(n,18,3),Ke.build(hn,Ke.path.nearestS(Pt.x,Pt.z)));let a=!Sn.has("nofurniture")&&n?jd(hn,n,bn):{};Dn=new _l(a.signals||[]);let o=!Sn.has("nosigns")&&n?ef(hn,n,i,bn):{},l=!Sn.has("nomarks")&&n?Zd(hn,n):0,c=!Sn.has("noside")&&n?$d(hn,i,n,bn,Qr):{},h=!Sn.has("nosg")&&n?Qd(hn,n,i,bn):{};n&&(na=new bl(i,n)),window.__axis=n;let d=kn?kn.people.length:0;if(n){let u=0,f=1/0;for(let A=0;A<n.p.length-1;A++){let S=n.p[A][0]*n.p[A][0]+n.p[A][1]*n.p[A][1];S<f&&(f=S,u=A)}let m=n.p[u],v=n.p[Math.min(u+1,n.p.length-1)],p=v[0]-m[0],g=v[1]-m[1],M=Math.hypot(p,g)||1,E=-g/M,_=p/M;Pt=gl(m[0]+E*-3.4,m[1]+_*-3.4,Math.atan2(p,g))}ty(),sa={marks:l,...c,...h,merged:t.mergedMeshes,shophouses:t.shophouses,junctions:(a.signals||[]).length,buildings:t.count,bespoke:t.bespoke,towers:t.tall,roads:i.roads.length,people:d,trees:r,...a,...o},lf=!0,window.__ready=!0,window.__stats=sa}).catch(i=>{of.textContent="data load failed: "+i.message});dh&&Gd(ls);kd(ls);{let i=document.getElementById("soundbtn");if(i){let t=e=>{e.preventDefault(),e.stopPropagation(),yi.start(),yi.setMuted(!yi.muted),i.textContent=yi.muted?"Sound off":"Sound on"};i.addEventListener("click",t),i.addEventListener("touchstart",t,{passive:!1})}}{let i=document.getElementById("modebtn");if(i){let t=e=>{e.preventDefault(),e.stopPropagation(),vh()};i.addEventListener("click",t),i.addEventListener("touchstart",t,{passive:!1})}}function ty(){let i=new ks(256,{generateMipmaps:!0,minFilter:jn}),t=new Ns(1,900,i);t.position.set(0,34,0),En.add(t),t.update(un,En),En.remove(t);let e=0;En.traverse(n=>{let s=n.material;if(s)for(let r of Array.isArray(s)?s:[s])r.isMeshStandardMaterial&&(r.roughness>.45||(r.envMap=i.texture,r.envMapIntensity=r.roughness<.25?.95:.5,r.needsUpdate=!0,e++))}),window.__envMats=e}var cf=Sn.get("cam")||"ride",ai=new Fi(-260,260,260,-260,1,2e3);ai.up.set(0,0,-1);ai.position.set(0,900,0);ai.lookAt(0,0,0);function vh(){if(Un==="ride"){let i=Math.cos(Pt.heading),t=-Math.sin(Pt.heading),e=Pt.x+i*1.2,n=Pt.z+t*1.2;bn(e,n)&&(e=Pt.x-i*1.2,n=Pt.z-t*1.2),jt.x=e,jt.z=n,jt.heading=Pt.heading,jt.speed=0,Pt.speed=0,Pt.reversing=!1,as=Pt.heading,ra=.16,os.group.visible=!0,_h.visible=!1,Un="walk"}else{if(Math.hypot(jt.x-Pt.x,jt.z-Pt.z)>6)return;os.group.visible=!1,_h.visible=!0,Al=!1,Un="ride"}ey()}var nf=document.getElementById("stick"),sf=document.getElementById("knob"),rf=document.getElementById("lookhint");function ey(){nf&&nf.classList.toggle("on",Un==="walk"),rf&&rf.classList.toggle("on",Un==="walk");let i=document.getElementById("help");if(!i)return;i.innerHTML=Un==="ride"?'<b>hold left side</b> throttle<br><b>hold lower left</b> brake<br><b>hold brake stopped</b> reverse<br><b>drag right side</b> steer<br><span style="opacity:.65">keys: A/D \xB7 W \xB7 S \xB7 E to get off</span>':'<b>drag left side</b> walk<br><b>drag right side</b> look around<br><span style="opacity:.65">keys: WASD \xB7 shift to run \xB7 E to ride</span>';let t=document.getElementById("modebtn");t&&(t.textContent=Un==="ride"?"Get off":"Ride")}function ny(i){let s=Math.sin(as),r=Math.cos(as),a=-r,o=s,l=Math.sin(ra),c=Math.cos(ra);Qe.position.set(jt.x-s*2.15*c+a*.66,1.78+2.15*l*.75,jt.z-r*2.15*c+o*.66);let h=12;Qe.lookAt(jt.x+s*h*c+a*.66,1.78-l*h,jt.z+r*h*c+o*.66),Qe.fov=65,Qe.updateProjectionMatrix()}var mh=new L,gh=new L,Al=!1,ki=(Sn.get("spec")||"").split(",").map(Number),iy=ki.length===6&&ki.every(i=>Number.isFinite(i));function sy(i){if(iy){Qe.position.set(ki[0],ki[1],ki[2]),Qe.lookAt(ki[3],ki[4],ki[5]),Qe.fov=46,Qe.updateProjectionMatrix();return}let t=new L(Math.sin(Pt.heading),0,Math.cos(Pt.heading)),e=new L(Pt.x,0,Pt.z).addScaledVector(t,-5.8).add(new L(0,3.05,0)),n=new L(Pt.x,1.35,Pt.z).addScaledVector(t,7.5);Al||(mh.copy(e),gh.copy(n),Al=!0),mh.lerp(e,Math.min(1,i*4.2)),gh.lerp(n,Math.min(1,i*6)),Qe.position.copy(mh),Qe.lookAt(gh),Qe.fov=58+Pt.speed/an.vMax*12,Qe.updateProjectionMatrix()}var ry=parseFloat(Sn.get("dpr")||"0");function hf(){let i=ls.clientWidth,t=ls.clientHeight;un.setPixelRatio(ry||Math.min(devicePixelRatio||1,2)),un.setSize(i,t,!1),Qe.aspect=i/t,Qe.updateProjectionMatrix();let e=i/t,n=440;ai.left=-n*e,ai.right=n*e,ai.top=n,ai.bottom=-n,ai.updateProjectionMatrix()}addEventListener("resize",hf);hf();var yh=performance.now(),Rl=0,Cl=yh,xh=0;function wl(i){let t=Math.min(.05,(i-yh)/1e3);if(yh=i,document.hidden){requestAnimationFrame(wl);return}if(lf){let e=Vd(Un);if(Ie.toggleMode&&(Ie.toggleMode=!1,vh()),window.__force&&(e.throttle=window.__force.throttle??e.throttle,e.brake=window.__force.brake??e.brake,e.steer=window.__force.steer??e.steer),Un==="walk"){as-=e.lookDX*.0045,ra=Math.max(-.35,Math.min(.95,ra+e.lookDY*.0035));let r=Math.sin(as),a=Math.cos(as),o=-e.moveY*r-e.moveX*a,l=-e.moveY*a+e.moveX*r,c=jt.x,h=jt.z;qd(jt,t,o,l,e.run),Ke&&Ke.hits(jt.x,jt.z,.32)&&(jt.x=c,jt.z=h,jt.speed=0),bn(jt.x,jt.z)&&(bn(jt.x,h)?bn(c,jt.z)?(jt.x=c,jt.z=h):jt.x=c:jt.z=h),sf&&(sf.style.transform=`translate(${Ie.stickDX.toFixed(1)}px, ${Ie.stickDY.toFixed(1)}px)`),os.group.position.set(jt.x,0,jt.z),os.group.rotation.y=jt.heading,os.pose(jt.phase,jt.speed),Ze.position.set(jt.x+rs.x*150,rs.y*150,jt.z+rs.z*150),Ze.target.position.set(jt.x,0,jt.z),Ze.target.updateMatrixWorld(),_i+=t,Dn&&Dn.update(_i),Ke&&Ke.update(_i,t,Dn),kn&&kn.update(_i,t,jt.x,jt.z,Dn),na&&na.update(jt,t),yi.update(0,"walk",jt.speed,jt.phase,Ke?Ke.nearest(jt.x,jt.z):999),ny(t),un.render(En,Qe),Rl++,i-Cl>1e3&&af(i),requestAnimationFrame(wl);return}let n=Pt.x,s=Pt.z;if(ch(Pt,t,e.throttle,e.brake,e.steer),Ke&&Ke.hits(Pt.x,Pt.z,.55)&&(Pt.x=n,Pt.z=s,Pt.speed*=-.12,Math.abs(Pt.speed)<.4&&(Pt.speed=0)),bn(Pt.x,Pt.z)){let r={x:Pt.x,z:s},a={x:n,z:Pt.z};bn(r.x,r.z)?bn(a.x,a.z)?(Pt.x=n,Pt.z=s,Pt.speed*=.2):(Pt.x=n,Pt.speed*=.86):(Pt.z=s,Pt.speed*=.86)}Tl.position.set(Pt.x,0,Pt.z),Tl.rotation.y=Pt.heading,ia.group.rotation.z=Pt.lean,ia.wheels[0].rotation.x=-Pt.wheel,ia.wheels[1].rotation.x=-Pt.wheel,Ze.position.set(Pt.x+rs.x*150,rs.y*150,Pt.z+rs.z*150),Ze.target.position.set(Pt.x,0,Pt.z),Ze.target.updateMatrixWorld(),_i+=t,Dn&&Dn.update(_i),Ke&&Ke.update(_i,t,Dn),kn&&kn.update(_i,t,Pt.x,Pt.z,Dn),na&&na.update(Pt,t),yi.update(Pt.speed,"ride",0,0,Ke?Ke.nearest(Pt.x,Pt.z):999),sy(t)}un.render(En,cf==="top"?ai:Qe),Rl++,i-Cl>1e3&&af(i),requestAnimationFrame(wl)}function af(i){{xh=Math.round(Rl*1e3/(i-Cl)),Rl=0,Cl=i;let t=un.getPixelRatio(),e=Math.round(ls.clientWidth*t)+"x"+Math.round(ls.clientHeight*t);of.textContent=`${xh} fps \xB7 ${e} @dpr${t} \xB7 ${un.info.render.triangles/1e3|0}k tris \xB7 ${un.info.render.calls} draws \xB7 `+(Un==="walk"?"on foot":`${Math.abs(Pt.speed*3.6)|0} km/h${Pt.reversing?" R":""}`)+(sa.buildings?` \xB7 ${sa.buildings} buildings`:""),window.__probe={fps:xh,tris:un.info.render.triangles,calls:un.info.render.calls,px:e,dpr:t,kmh:+(Pt.speed*3.6).toFixed(1),mode:Un,...sa}}}requestAnimationFrame(wl);window.__drive=(i,t,e)=>{window.__force={throttle:i,steer:t,brake:0},setTimeout(()=>{window.__force=null},e*1e3)};window.__inp=()=>({TOUCH:dh,steer:Ie.steer,throttle:Ie.throttle,brake:Ie.brake,touches:Wd(),fired:window.__touchFired||0});window.__snd=yi;window.__crossers=()=>kn?kn.people.filter(i=>i.crossing).length:0;window.__sig=()=>Dn?Dn.list.map(i=>Dn.stateAt(i,_i)):[];window.__traffic=()=>Ke?Ke.items.map(i=>+i.speed.toFixed(2)):[];window.__camYaw=()=>as;window.__mode=()=>Un;window.__toggle=()=>vh();window.__walker=()=>({x:+jt.x.toFixed(1),z:+jt.z.toFixed(1),sp:+jt.speed.toFixed(2)});window.__state=()=>({x:+Pt.x.toFixed(1),z:+Pt.z.toFixed(1),kmh:+(Pt.speed*3.6).toFixed(1)});window.__dbg=()=>{let i=new An().setFromObject(hn),t=cf==="top"?ai:Qe;return{worldBox:{min:[i.min.x|0,i.min.y|0,i.min.z|0],max:[i.max.x|0,i.max.y|0,i.max.z|0]},children:hn.children.length,camType:t.type,camPos:[t.position.x|0,t.position.y|0,t.position.z|0],camDir:(()=>{let e=new L;return t.getWorldDirection(e),[+e.x.toFixed(2),+e.y.toFixed(2),+e.z.toFixed(2)]})(),ortho:t.isOrthographicCamera?[t.left|0,t.right|0,t.top|0,t.bottom|0,t.near,t.far]:null}};window.__setState=(i,t,e)=>{Pt.x=i,Pt.z=t,Pt.heading=e,Al=!1};
/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
