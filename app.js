var Xh=0,uc=1,qh=2;var Ar=1,lo=2,Is=3,ni=0,Ze=1,He=2,Wn=0,qi=1,dc=2,fc=3,Rr=4,Yh=5;var Mi=100,Zh=101,$h=102,Jh=103,Kh=104,Qh=200,jh=201,tu=202,eu=203,ba=204,Ea=205,nu=206,iu=207,su=208,ru=209,au=210,ou=211,lu=212,cu=213,hu=214,wa=0,Ta=1,Aa=2,Yi=3,Ra=4,Ca=5,Ia=6,Pa=7,co=0,uu=1,du=2,Pn=0,pc=1,mc=2,gc=3,Cr=4,xc=5,_c=6,yc=7;var vc=300,Ri=301,Ji=302,ho=303,uo=304,Ir=306,Ms=1e3,Hn=1001,La=1002,We=1003,fu=1004;var Pr=1005;var Ye=1006,fo=1007;var Ci=1008;var hn=1009,Mc=1010,Sc=1011,Ps=1012,po=1013,Ln=1014,wn=1015,Xn=1016,mo=1017,go=1018,Ls=1020,bc=35902,Ec=35899,wc=1021,Tc=1022,Tn=1023,Gn=1026,Ii=1027,xo=1028,_o=1029,Pi=1030,yo=1031;var vo=1033,Lr=33776,Dr=33777,Ur=33778,Nr=33779,Mo=35840,So=35841,bo=35842,Eo=35843,wo=36196,To=37492,Ao=37496,Ro=37488,Co=37489,Fr=37490,Io=37491,Po=37808,Lo=37809,Do=37810,Uo=37811,No=37812,Fo=37813,Oo=37814,Bo=37815,zo=37816,Ho=37817,Go=37818,ko=37819,Vo=37820,Wo=37821,Xo=36492,qo=36494,Yo=36495,Zo=36283,$o=36284,Or=36285,Jo=36286;var Qs=2300,Da=2301,Sa=2302,Kl=2303,Ql=2400,jl=2401,tc=2402;var pu=3200;var Br=0,mu=1,ai="",Oe="srgb",js="srgb-linear",tr="linear",de="srgb";var Vi=7680;var ec=519,gu=512,xu=513,_u=514,Ko=515,yu=516,vu=517,Qo=518,Mu=519,nc=35044;var Ac="300 es",In=2e3,Ss=2001;function Zd(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function $d(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function er(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Su(){let i=er("canvas");return i.style.display="block",i}var xh={},bs=null;function Rc(...i){let t="THREE."+i.shift();bs?bs("log",t,...i):console.log(t,...i)}function bu(i){let t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Xt(...i){i=bu(i);let t="THREE."+i.shift();if(bs)bs("warn",t,...i);else{let e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function Yt(...i){i=bu(i);let t="THREE."+i.shift();if(bs)bs("error",t,...i);else{let e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function Xi(...i){let t=i.join(" ");t in xh||(xh[t]=!0,Xt(...i))}function Eu(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var wu={[wa]:Ta,[Aa]:Ia,[Ra]:Pa,[Yi]:Ca,[Ta]:wa,[Ia]:Aa,[Pa]:Ra,[Ca]:Yi},kn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}},Ke=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var El=Math.PI/180,Ua=180/Math.PI;function Ds(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ke[i&255]+Ke[i>>8&255]+Ke[i>>16&255]+Ke[i>>24&255]+"-"+Ke[t&255]+Ke[t>>8&255]+"-"+Ke[t>>16&15|64]+Ke[t>>24&255]+"-"+Ke[e&63|128]+Ke[e>>8&255]+"-"+Ke[e>>16&255]+Ke[e>>24&255]+Ke[n&255]+Ke[n>>8&255]+Ke[n>>16&255]+Ke[n>>24&255]).toLowerCase()}function ae(i,t,e){return Math.max(t,Math.min(e,i))}function Jd(i,t){return(i%t+t)%t}function wl(i,t,e){return(1-e)*i+e*t}function ks(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function ln(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var ht=class i{static{i.prototype.isVector2=!0}constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=ae(this.x,t.x,e.x),this.y=ae(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=ae(this.x,t,e),this.y=ae(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ae(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(ae(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},ve=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],f=n[s+3],h=r[a+0],d=r[a+1],g=r[a+2],v=r[a+3];if(f!==v||l!==h||c!==d||u!==g){let m=l*h+c*d+u*g+f*v;m<0&&(h=-h,d=-d,g=-g,v=-v,m=-m);let p=1-o;if(m<.9995){let S=Math.acos(m),b=Math.sin(S);p=Math.sin(p*S)/b,o=Math.sin(o*S)/b,l=l*p+h*o,c=c*p+d*o,u=u*p+g*o,f=f*p+v*o}else{l=l*p+h*o,c=c*p+d*o,u=u*p+g*o,f=f*p+v*o;let S=1/Math.sqrt(l*l+c*c+u*u+f*f);l*=S,c*=S,u*=S,f*=S}}t[e]=l,t[e+1]=c,t[e+2]=u,t[e+3]=f}static multiplyQuaternionsFlat(t,e,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],f=r[a],h=r[a+1],d=r[a+2],g=r[a+3];return t[e]=o*g+u*f+l*d-c*h,t[e+1]=l*g+u*h+c*f-o*d,t[e+2]=c*g+u*d+o*h-l*f,t[e+3]=u*g-o*f-l*h-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),f=o(r/2),h=l(n/2),d=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=h*u*f+c*d*g,this._y=c*d*f-h*u*g,this._z=c*u*g+h*d*f,this._w=c*u*f-h*d*g;break;case"YXZ":this._x=h*u*f+c*d*g,this._y=c*d*f-h*u*g,this._z=c*u*g-h*d*f,this._w=c*u*f+h*d*g;break;case"ZXY":this._x=h*u*f-c*d*g,this._y=c*d*f+h*u*g,this._z=c*u*g+h*d*f,this._w=c*u*f-h*d*g;break;case"ZYX":this._x=h*u*f-c*d*g,this._y=c*d*f+h*u*g,this._z=c*u*g-h*d*f,this._w=c*u*f+h*d*g;break;case"YZX":this._x=h*u*f+c*d*g,this._y=c*d*f+h*u*g,this._z=c*u*g-h*d*f,this._w=c*u*f-h*d*g;break;case"XZY":this._x=h*u*f-c*d*g,this._y=c*d*f-h*u*g,this._z=c*u*g+h*d*f,this._w=c*u*f+h*d*g;break;default:Xt("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],u=e[6],f=e[10],h=n+o+f;if(h>0){let d=.5/Math.sqrt(h+1);this._w=.25/d,this._x=(u-l)*d,this._y=(r-c)*d,this._z=(a-s)*d}else if(n>o&&n>f){let d=2*Math.sqrt(1+n-o-f);this._w=(u-l)/d,this._x=.25*d,this._y=(s+a)/d,this._z=(r+c)/d}else if(o>f){let d=2*Math.sqrt(1+o-n-f);this._w=(r-c)/d,this._x=(s+a)/d,this._y=.25*d,this._z=(l+u)/d}else{let d=2*Math.sqrt(1+f-n-o);this._w=(a-s)/d,this._x=(r+c)/d,this._y=(l+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(ae(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,u=e._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=this.dot(t);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-e;if(o<.9995){let c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,e=Math.sin(e*c)/u,this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},L=class i{static{i.prototype.isVector3=!0}constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(_h.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(_h.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*n),u=2*(o*e-r*s),f=2*(r*n-a*e);return this.x=e+l*c+a*f-o*u,this.y=n+l*u+o*c-r*f,this.z=s+l*f+r*u-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=ae(this.x,t.x,e.x),this.y=ae(this.y,t.y,e.y),this.z=ae(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=ae(this.x,t,e),this.y=ae(this.y,t,e),this.z=ae(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ae(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Tl.copy(this).projectOnVector(t),this.sub(Tl)}reflect(t){return this.sub(Tl.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(ae(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Tl=new L,_h=new ve,Kt=class i{static{i.prototype.isMatrix3=!0}constructor(t,e,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c)}set(t,e,n,s,r,a,o,l,c){let u=this.elements;return u[0]=t,u[1]=s,u[2]=o,u[3]=e,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],f=n[7],h=n[2],d=n[5],g=n[8],v=s[0],m=s[3],p=s[6],S=s[1],b=s[4],y=s[7],A=s[2],w=s[5],T=s[8];return r[0]=a*v+o*S+l*A,r[3]=a*m+o*b+l*w,r[6]=a*p+o*y+l*T,r[1]=c*v+u*S+f*A,r[4]=c*m+u*b+f*w,r[7]=c*p+u*y+f*T,r[2]=h*v+d*S+g*A,r[5]=h*m+d*b+g*w,r[8]=h*p+d*y+g*T,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8];return e*a*u-e*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],f=u*a-o*c,h=o*l-u*r,d=c*r-a*l,g=e*f+n*h+s*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/g;return t[0]=f*v,t[1]=(s*c-u*n)*v,t[2]=(o*n-s*a)*v,t[3]=h*v,t[4]=(u*e-s*l)*v,t[5]=(s*r-o*e)*v,t[6]=d*v,t[7]=(n*l-c*e)*v,t[8]=(a*e-n*r)*v,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return Xi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Al.makeScale(t,e)),this}rotate(t){return Xi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Al.makeRotation(-t)),this}translate(t,e){return Xi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Al.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Al=new Kt,yh=new Kt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),vh=new Kt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Kd(){let i={enabled:!0,workingColorSpace:js,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===de&&(s.r=ei(s.r),s.g=ei(s.g),s.b=ei(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===de&&(s.r=vs(s.r),s.g=vs(s.g),s.b=vs(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===ai?tr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Xi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Xi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[js]:{primaries:t,whitePoint:n,transfer:tr,toXYZ:yh,fromXYZ:vh,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Oe},outputColorSpaceConfig:{drawingBufferColorSpace:Oe}},[Oe]:{primaries:t,whitePoint:n,transfer:de,toXYZ:yh,fromXYZ:vh,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Oe}}}),i}var oe=Kd();function ei(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function vs(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var os,Na=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{os===void 0&&(os=er("canvas")),os.width=t.width,os.height=t.height;let s=os.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=os}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=er("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=ei(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(ei(e[n]/255)*255):e[n]=ei(e[n]);return{data:e,width:t.width,height:t.height}}else return Xt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Qd=0,Es=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Qd++}),this.uuid=Ds(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Rl(s[a].image)):r.push(Rl(s[a]))}else r=Rl(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function Rl(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Na.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Xt("Texture: Unable to serialize Texture."),{})}var jd=0,Cl=new L,sn=class i extends kn{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=Hn,s=Hn,r=Ye,a=Ci,o=Tn,l=hn,c=i.DEFAULT_ANISOTROPY,u=ai){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:jd++}),this.uuid=Ds(),this.name="",this.source=new Es(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new ht(0,0),this.repeat=new ht(1,1),this.center=new ht(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Kt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Cl).x}get height(){return this.source.getSize(Cl).y}get depth(){return this.source.getSize(Cl).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){Xt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Xt(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==vc)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Ms:t.x=t.x-Math.floor(t.x);break;case Hn:t.x=t.x<0?0:1;break;case La:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Ms:t.y=t.y-Math.floor(t.y);break;case Hn:t.y=t.y<0?0:1;break;case La:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};sn.DEFAULT_IMAGE=null;sn.DEFAULT_MAPPING=vc;sn.DEFAULT_ANISOTROPY=1;var Ee=class i{static{i.prototype.isVector4=!0}constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,l=t.elements,c=l[0],u=l[4],f=l[8],h=l[1],d=l[5],g=l[9],v=l[2],m=l[6],p=l[10];if(Math.abs(u-h)<.01&&Math.abs(f-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+h)<.1&&Math.abs(f+v)<.1&&Math.abs(g+m)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let b=(c+1)/2,y=(d+1)/2,A=(p+1)/2,w=(u+h)/4,T=(f+v)/4,x=(g+m)/4;return b>y&&b>A?b<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(b),s=w/n,r=T/n):y>A?y<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),n=w/s,r=x/s):A<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(A),n=T/r,s=x/r),this.set(n,s,r,e),this}let S=Math.sqrt((m-g)*(m-g)+(f-v)*(f-v)+(h-u)*(h-u));return Math.abs(S)<.001&&(S=1),this.x=(m-g)/S,this.y=(f-v)/S,this.z=(h-u)/S,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=ae(this.x,t.x,e.x),this.y=ae(this.y,t.y,e.y),this.z=ae(this.z,t.z,e.z),this.w=ae(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=ae(this.x,t,e),this.y=ae(this.y,t,e),this.z=ae(this.z,t,e),this.w=ae(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ae(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Fa=class extends kn{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ye,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new Ee(0,0,t,e),this.scissorTest=!1,this.viewport=new Ee(0,0,t,e),this.textures=[];let s={width:t,height:e,depth:n.depth},r=new sn(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Ye,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new Es(s)}return this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},gn=class extends Fa{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},nr=class extends sn{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=We,this.minFilter=We,this.wrapR=Hn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Oa=class extends sn{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=We,this.minFilter=We,this.wrapR=Hn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ee=class i{static{i.prototype.isMatrix4=!0}constructor(t,e,n,s,r,a,o,l,c,u,f,h,d,g,v,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c,u,f,h,d,g,v,m)}set(t,e,n,s,r,a,o,l,c,u,f,h,d,g,v,m){let p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=u,p[10]=f,p[14]=h,p[3]=d,p[7]=g,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,s=1/ls.setFromMatrixColumn(t,0).length(),r=1/ls.setFromMatrixColumn(t,1).length(),a=1/ls.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),f=Math.sin(r);if(t.order==="XYZ"){let h=a*u,d=a*f,g=o*u,v=o*f;e[0]=l*u,e[4]=-l*f,e[8]=c,e[1]=d+g*c,e[5]=h-v*c,e[9]=-o*l,e[2]=v-h*c,e[6]=g+d*c,e[10]=a*l}else if(t.order==="YXZ"){let h=l*u,d=l*f,g=c*u,v=c*f;e[0]=h+v*o,e[4]=g*o-d,e[8]=a*c,e[1]=a*f,e[5]=a*u,e[9]=-o,e[2]=d*o-g,e[6]=v+h*o,e[10]=a*l}else if(t.order==="ZXY"){let h=l*u,d=l*f,g=c*u,v=c*f;e[0]=h-v*o,e[4]=-a*f,e[8]=g+d*o,e[1]=d+g*o,e[5]=a*u,e[9]=v-h*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){let h=a*u,d=a*f,g=o*u,v=o*f;e[0]=l*u,e[4]=g*c-d,e[8]=h*c+v,e[1]=l*f,e[5]=v*c+h,e[9]=d*c-g,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){let h=a*l,d=a*c,g=o*l,v=o*c;e[0]=l*u,e[4]=v-h*f,e[8]=g*f+d,e[1]=f,e[5]=a*u,e[9]=-o*u,e[2]=-c*u,e[6]=d*f+g,e[10]=h-v*f}else if(t.order==="XZY"){let h=a*l,d=a*c,g=o*l,v=o*c;e[0]=l*u,e[4]=-f,e[8]=c*u,e[1]=h*f+v,e[5]=a*u,e[9]=d*f-g,e[2]=g*f-d,e[6]=o*u,e[10]=v*f+h}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(tf,t,ef)}lookAt(t,e,n){let s=this.elements;return pn.subVectors(t,e),pn.lengthSq()===0&&(pn.z=1),pn.normalize(),pi.crossVectors(n,pn),pi.lengthSq()===0&&(Math.abs(n.z)===1?pn.x+=1e-4:pn.z+=1e-4,pn.normalize(),pi.crossVectors(n,pn)),pi.normalize(),jr.crossVectors(pn,pi),s[0]=pi.x,s[4]=jr.x,s[8]=pn.x,s[1]=pi.y,s[5]=jr.y,s[9]=pn.y,s[2]=pi.z,s[6]=jr.z,s[10]=pn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],f=n[5],h=n[9],d=n[13],g=n[2],v=n[6],m=n[10],p=n[14],S=n[3],b=n[7],y=n[11],A=n[15],w=s[0],T=s[4],x=s[8],M=s[12],R=s[1],I=s[5],P=s[9],F=s[13],B=s[2],D=s[6],z=s[10],N=s[14],X=s[3],Y=s[7],j=s[11],tt=s[15];return r[0]=a*w+o*R+l*B+c*X,r[4]=a*T+o*I+l*D+c*Y,r[8]=a*x+o*P+l*z+c*j,r[12]=a*M+o*F+l*N+c*tt,r[1]=u*w+f*R+h*B+d*X,r[5]=u*T+f*I+h*D+d*Y,r[9]=u*x+f*P+h*z+d*j,r[13]=u*M+f*F+h*N+d*tt,r[2]=g*w+v*R+m*B+p*X,r[6]=g*T+v*I+m*D+p*Y,r[10]=g*x+v*P+m*z+p*j,r[14]=g*M+v*F+m*N+p*tt,r[3]=S*w+b*R+y*B+A*X,r[7]=S*T+b*I+y*D+A*Y,r[11]=S*x+b*P+y*z+A*j,r[15]=S*M+b*F+y*N+A*tt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],u=t[2],f=t[6],h=t[10],d=t[14],g=t[3],v=t[7],m=t[11],p=t[15],S=l*d-c*h,b=o*d-c*f,y=o*h-l*f,A=a*d-c*u,w=a*h-l*u,T=a*f-o*u;return e*(v*S-m*b+p*y)-n*(g*S-m*A+p*w)+s*(g*b-v*A+p*T)-r*(g*y-v*w+m*T)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],a=t[5],o=t[9],l=t[2],c=t[6],u=t[10];return e*(a*u-o*c)-n*(r*u-o*l)+s*(r*c-a*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],f=t[9],h=t[10],d=t[11],g=t[12],v=t[13],m=t[14],p=t[15],S=e*o-n*a,b=e*l-s*a,y=e*c-r*a,A=n*l-s*o,w=n*c-r*o,T=s*c-r*l,x=u*v-f*g,M=u*m-h*g,R=u*p-d*g,I=f*m-h*v,P=f*p-d*v,F=h*p-d*m,B=S*F-b*P+y*I+A*R-w*M+T*x;if(B===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let D=1/B;return t[0]=(o*F-l*P+c*I)*D,t[1]=(s*P-n*F-r*I)*D,t[2]=(v*T-m*w+p*A)*D,t[3]=(h*w-f*T-d*A)*D,t[4]=(l*R-a*F-c*M)*D,t[5]=(e*F-s*R+r*M)*D,t[6]=(m*y-g*T-p*b)*D,t[7]=(u*T-h*y+d*b)*D,t[8]=(a*P-o*R+c*x)*D,t[9]=(n*R-e*P-r*x)*D,t[10]=(g*w-v*y+p*S)*D,t[11]=(f*y-u*w-d*S)*D,t[12]=(o*M-a*I-l*x)*D,t[13]=(e*I-n*M+s*x)*D,t[14]=(v*b-g*A-m*S)*D,t[15]=(u*A-f*b+h*S)*D,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,u=a+a,f=o+o,h=r*c,d=r*u,g=r*f,v=a*u,m=a*f,p=o*f,S=l*c,b=l*u,y=l*f,A=n.x,w=n.y,T=n.z;return s[0]=(1-(v+p))*A,s[1]=(d+y)*A,s[2]=(g-b)*A,s[3]=0,s[4]=(d-y)*w,s[5]=(1-(h+p))*w,s[6]=(m+S)*w,s[7]=0,s[8]=(g+b)*T,s[9]=(m-S)*T,s[10]=(1-(h+v))*T,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let a=ls.set(s[0],s[1],s[2]).length(),o=ls.set(s[4],s[5],s[6]).length(),l=ls.set(s[8],s[9],s[10]).length();r<0&&(a=-a),An.copy(this);let c=1/a,u=1/o,f=1/l;return An.elements[0]*=c,An.elements[1]*=c,An.elements[2]*=c,An.elements[4]*=u,An.elements[5]*=u,An.elements[6]*=u,An.elements[8]*=f,An.elements[9]*=f,An.elements[10]*=f,e.setFromRotationMatrix(An),n.x=a,n.y=o,n.z=l,this}makePerspective(t,e,n,s,r,a,o=In,l=!1){let c=this.elements,u=2*r/(e-t),f=2*r/(n-s),h=(e+t)/(e-t),d=(n+s)/(n-s),g,v;if(l)g=r/(a-r),v=a*r/(a-r);else if(o===In)g=-(a+r)/(a-r),v=-2*a*r/(a-r);else if(o===Ss)g=-a/(a-r),v=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=f,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=In,l=!1){let c=this.elements,u=2/(e-t),f=2/(n-s),h=-(e+t)/(e-t),d=-(n+s)/(n-s),g,v;if(l)g=1/(a-r),v=a/(a-r);else if(o===In)g=-2/(a-r),v=-(a+r)/(a-r);else if(o===Ss)g=-1/(a-r),v=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=f,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=g,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},ls=new L,An=new ee,tf=new L(0,0,0),ef=new L(1,1,1),pi=new L,jr=new L,pn=new L,Mh=new ee,Sh=new ve,we=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],f=s[2],h=s[6],d=s[10];switch(e){case"XYZ":this._y=Math.asin(ae(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ae(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(ae(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-f,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-ae(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(h,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(ae(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-ae(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,d),this._y=0);break;default:Xt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Mh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Mh,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Sh.setFromEuler(this),this.setFromQuaternion(Sh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};we.DEFAULT_ORDER="XYZ";var ir=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},nf=0,bh=new L,cs=new ve,Jn=new ee,ta=new L,Vs=new L,sf=new L,rf=new ve,Eh=new L(1,0,0),wh=new L(0,1,0),Th=new L(0,0,1),Ah={type:"added"},af={type:"removed"},hs={type:"childadded",child:null},Il={type:"childremoved",child:null},tn=class i extends kn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:nf++}),this.uuid=Ds(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new L,e=new we,n=new ve,s=new L(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ee},normalMatrix:{value:new Kt}}),this.matrix=new ee,this.matrixWorld=new ee,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ir,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return cs.setFromAxisAngle(t,e),this.quaternion.multiply(cs),this}rotateOnWorldAxis(t,e){return cs.setFromAxisAngle(t,e),this.quaternion.premultiply(cs),this}rotateX(t){return this.rotateOnAxis(Eh,t)}rotateY(t){return this.rotateOnAxis(wh,t)}rotateZ(t){return this.rotateOnAxis(Th,t)}translateOnAxis(t,e){return bh.copy(t).applyQuaternion(this.quaternion),this.position.add(bh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Eh,t)}translateY(t){return this.translateOnAxis(wh,t)}translateZ(t){return this.translateOnAxis(Th,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Jn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?ta.copy(t):ta.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Vs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Jn.lookAt(Vs,ta,this.up):Jn.lookAt(ta,Vs,this.up),this.quaternion.setFromRotationMatrix(Jn),s&&(Jn.extractRotation(s.matrixWorld),cs.setFromRotationMatrix(Jn),this.quaternion.premultiply(cs.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Yt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Ah),hs.child=t,this.dispatchEvent(hs),hs.child=null):Yt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(af),Il.child=t,this.dispatchEvent(Il),Il.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Jn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Jn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Jn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Ah),hs.child=t,this.dispatchEvent(hs),hs.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Vs,t,sf),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Vs,rf,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let f=l[c];r(t.shapes,f)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){let o=a(t.geometries),l=a(t.materials),c=a(t.textures),u=a(t.images),f=a(t.shapes),h=a(t.skeletons),d=a(t.animations),g=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),f.length>0&&(n.shapes=f),h.length>0&&(n.skeletons=h),d.length>0&&(n.animations=d),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){let l=[];for(let c in o){let u=o[c];delete u.metadata,l.push(u)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}};tn.DEFAULT_UP=new L(0,1,0);tn.DEFAULT_MATRIX_AUTO_UPDATE=!0;tn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Se=class extends tn{constructor(){super(),this.isGroup=!0,this.type="Group"}},of={type:"move"},ws=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Se,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Se,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Se,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(let v of t.hand.values()){let m=e.getJointPose(v,n),p=this._getHandJoint(c,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let u=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],h=u.position.distanceTo(f.position),d=.02,g=.005;c.inputState.pinching&&h>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&h<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(of)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new Se;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},Tu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},mi={h:0,s:0,l:0},ea={h:0,s:0,l:0};function Pl(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var Gt=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Oe){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,oe.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=oe.workingColorSpace){return this.r=t,this.g=e,this.b=n,oe.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=oe.workingColorSpace){if(t=Jd(t,1),e=ae(e,0,1),n=ae(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=Pl(a,r,t+1/3),this.g=Pl(a,r,t),this.b=Pl(a,r,t-1/3)}return oe.colorSpaceToWorking(this,s),this}setStyle(t,e=Oe){function n(r){r!==void 0&&parseFloat(r)<1&&Xt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Xt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);Xt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Oe){let n=Tu[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Xt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=ei(t.r),this.g=ei(t.g),this.b=ei(t.b),this}copyLinearToSRGB(t){return this.r=vs(t.r),this.g=vs(t.g),this.b=vs(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Oe){return oe.workingToColorSpace(Qe.copy(this),t),Math.round(ae(Qe.r*255,0,255))*65536+Math.round(ae(Qe.g*255,0,255))*256+Math.round(ae(Qe.b*255,0,255))}getHexString(t=Oe){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=oe.workingColorSpace){oe.workingToColorSpace(Qe.copy(this),e);let n=Qe.r,s=Qe.g,r=Qe.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,u=(o+a)/2;if(o===a)l=0,c=0;else{let f=a-o;switch(c=u<=.5?f/(a+o):f/(2-a-o),a){case n:l=(s-r)/f+(s<r?6:0);break;case s:l=(r-n)/f+2;break;case r:l=(n-s)/f+4;break}l/=6}return t.h=l,t.s=c,t.l=u,t}getRGB(t,e=oe.workingColorSpace){return oe.workingToColorSpace(Qe.copy(this),e),t.r=Qe.r,t.g=Qe.g,t.b=Qe.b,t}getStyle(t=Oe){oe.workingToColorSpace(Qe.copy(this),t);let e=Qe.r,n=Qe.g,s=Qe.b;return t!==Oe?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(mi),this.setHSL(mi.h+t,mi.s+e,mi.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(mi),t.getHSL(ea);let n=wl(mi.h,ea.h,e),s=wl(mi.s,ea.s,e),r=wl(mi.l,ea.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Qe=new Gt;Gt.NAMES=Tu;var sr=class i{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new Gt(t),this.density=e}clone(){return new i(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var rr=class extends tn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new we,this.environmentIntensity=1,this.environmentRotation=new we,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}},Rn=new L,Kn=new L,Ll=new L,Qn=new L,us=new L,ds=new L,Rh=new L,Dl=new L,Ul=new L,Nl=new L,Fl=new Ee,Ol=new Ee,Bl=new Ee,vi=class i{constructor(t=new L,e=new L,n=new L){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),Rn.subVectors(t,e),s.cross(Rn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){Rn.subVectors(s,e),Kn.subVectors(n,e),Ll.subVectors(t,e);let a=Rn.dot(Rn),o=Rn.dot(Kn),l=Rn.dot(Ll),c=Kn.dot(Kn),u=Kn.dot(Ll),f=a*c-o*o;if(f===0)return r.set(0,0,0),null;let h=1/f,d=(c*l-o*u)*h,g=(a*u-o*l)*h;return r.set(1-d-g,g,d)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Qn)===null?!1:Qn.x>=0&&Qn.y>=0&&Qn.x+Qn.y<=1}static getInterpolation(t,e,n,s,r,a,o,l){return this.getBarycoord(t,e,n,s,Qn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Qn.x),l.addScaledVector(a,Qn.y),l.addScaledVector(o,Qn.z),l)}static getInterpolatedAttribute(t,e,n,s,r,a){return Fl.setScalar(0),Ol.setScalar(0),Bl.setScalar(0),Fl.fromBufferAttribute(t,e),Ol.fromBufferAttribute(t,n),Bl.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(Fl,r.x),a.addScaledVector(Ol,r.y),a.addScaledVector(Bl,r.z),a}static isFrontFacing(t,e,n,s){return Rn.subVectors(n,e),Kn.subVectors(t,e),Rn.cross(Kn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Rn.subVectors(this.c,this.b),Kn.subVectors(this.a,this.b),Rn.cross(Kn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,a,o;us.subVectors(s,n),ds.subVectors(r,n),Dl.subVectors(t,n);let l=us.dot(Dl),c=ds.dot(Dl);if(l<=0&&c<=0)return e.copy(n);Ul.subVectors(t,s);let u=us.dot(Ul),f=ds.dot(Ul);if(u>=0&&f<=u)return e.copy(s);let h=l*f-u*c;if(h<=0&&l>=0&&u<=0)return a=l/(l-u),e.copy(n).addScaledVector(us,a);Nl.subVectors(t,r);let d=us.dot(Nl),g=ds.dot(Nl);if(g>=0&&d<=g)return e.copy(r);let v=d*c-l*g;if(v<=0&&c>=0&&g<=0)return o=c/(c-g),e.copy(n).addScaledVector(ds,o);let m=u*g-d*f;if(m<=0&&f-u>=0&&d-g>=0)return Rh.subVectors(r,s),o=(f-u)/(f-u+(d-g)),e.copy(s).addScaledVector(Rh,o);let p=1/(m+v+h);return a=v*p,o=h*p,e.copy(n).addScaledVector(us,a).addScaledVector(ds,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},En=class{constructor(t=new L(1/0,1/0,1/0),e=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Cn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Cn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=Cn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,Cn):Cn.fromBufferAttribute(r,a),Cn.applyMatrix4(t.matrixWorld),this.expandByPoint(Cn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),na.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),na.copy(n.boundingBox)),na.applyMatrix4(t.matrixWorld),this.union(na)}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Cn),Cn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ws),ia.subVectors(this.max,Ws),fs.subVectors(t.a,Ws),ps.subVectors(t.b,Ws),ms.subVectors(t.c,Ws),gi.subVectors(ps,fs),xi.subVectors(ms,ps),zi.subVectors(fs,ms);let e=[0,-gi.z,gi.y,0,-xi.z,xi.y,0,-zi.z,zi.y,gi.z,0,-gi.x,xi.z,0,-xi.x,zi.z,0,-zi.x,-gi.y,gi.x,0,-xi.y,xi.x,0,-zi.y,zi.x,0];return!zl(e,fs,ps,ms,ia)||(e=[1,0,0,0,1,0,0,0,1],!zl(e,fs,ps,ms,ia))?!1:(sa.crossVectors(gi,xi),e=[sa.x,sa.y,sa.z],zl(e,fs,ps,ms,ia))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Cn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Cn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(jn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),jn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),jn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),jn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),jn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),jn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),jn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),jn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(jn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},jn=[new L,new L,new L,new L,new L,new L,new L,new L],Cn=new L,na=new En,fs=new L,ps=new L,ms=new L,gi=new L,xi=new L,zi=new L,Ws=new L,ia=new L,sa=new L,Hi=new L;function zl(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Hi.fromArray(i,r);let o=s.x*Math.abs(Hi.x)+s.y*Math.abs(Hi.y)+s.z*Math.abs(Hi.z),l=t.dot(Hi),c=e.dot(Hi),u=n.dot(Hi);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}var Fe=new L,ra=new ht,lf=0,cn=class extends kn{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:lf++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=nc,this.updateRanges=[],this.gpuType=wn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)ra.fromBufferAttribute(this,e),ra.applyMatrix3(t),this.setXY(e,ra.x,ra.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Fe.fromBufferAttribute(this,e),Fe.applyMatrix3(t),this.setXYZ(e,Fe.x,Fe.y,Fe.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Fe.fromBufferAttribute(this,e),Fe.applyMatrix4(t),this.setXYZ(e,Fe.x,Fe.y,Fe.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Fe.fromBufferAttribute(this,e),Fe.applyNormalMatrix(t),this.setXYZ(e,Fe.x,Fe.y,Fe.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Fe.fromBufferAttribute(this,e),Fe.transformDirection(t),this.setXYZ(e,Fe.x,Fe.y,Fe.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=ks(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ln(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=ks(e,this.array)),e}setX(t,e){return this.normalized&&(e=ln(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=ks(e,this.array)),e}setY(t,e){return this.normalized&&(e=ln(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=ks(e,this.array)),e}setZ(t,e){return this.normalized&&(e=ln(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=ks(e,this.array)),e}setW(t,e){return this.normalized&&(e=ln(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=ln(e,this.array),n=ln(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=ln(e,this.array),n=ln(n,this.array),s=ln(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=ln(e,this.array),n=ln(n,this.array),s=ln(s,this.array),r=ln(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==nc&&(t.usage=this.usage),t}dispose(){this.dispatchEvent({type:"dispose"})}};var ar=class extends cn{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var or=class extends cn{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var ce=class extends cn{constructor(t,e,n){super(new Float32Array(t),e,n)}},cf=new En,Xs=new L,Hl=new L,Si=class{constructor(t=new L,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):cf.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Xs.subVectors(t,this.center);let e=Xs.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Xs,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Hl.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Xs.copy(t.center).add(Hl)),this.expandByPoint(Xs.copy(t.center).sub(Hl))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},hf=0,bn=new ee,Gl=new tn,gs=new L,mn=new En,qs=new En,Ve=new L,Be=class i extends kn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:hf++}),this.uuid=Ds(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Zd(t)?or:ar)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Kt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return bn.makeRotationFromQuaternion(t),this.applyMatrix4(bn),this}rotateX(t){return bn.makeRotationX(t),this.applyMatrix4(bn),this}rotateY(t){return bn.makeRotationY(t),this.applyMatrix4(bn),this}rotateZ(t){return bn.makeRotationZ(t),this.applyMatrix4(bn),this}translate(t,e,n){return bn.makeTranslation(t,e,n),this.applyMatrix4(bn),this}scale(t,e,n){return bn.makeScale(t,e,n),this.applyMatrix4(bn),this}lookAt(t){return Gl.lookAt(t),Gl.updateMatrix(),this.applyMatrix4(Gl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(gs).negate(),this.translate(gs.x,gs.y,gs.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new ce(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&Xt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new En);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Yt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];mn.setFromBufferAttribute(r),this.morphTargetsRelative?(Ve.addVectors(this.boundingBox.min,mn.min),this.boundingBox.expandByPoint(Ve),Ve.addVectors(this.boundingBox.max,mn.max),this.boundingBox.expandByPoint(Ve)):(this.boundingBox.expandByPoint(mn.min),this.boundingBox.expandByPoint(mn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Yt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Si);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Yt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(t){let n=this.boundingSphere.center;if(mn.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];qs.setFromBufferAttribute(o),this.morphTargetsRelative?(Ve.addVectors(mn.min,qs.min),mn.expandByPoint(Ve),Ve.addVectors(mn.max,qs.max),mn.expandByPoint(Ve)):(mn.expandByPoint(qs.min),mn.expandByPoint(qs.max))}mn.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)Ve.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Ve));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Ve.fromBufferAttribute(o,c),l&&(gs.fromBufferAttribute(t,c),Ve.add(gs)),s=Math.max(s,n.distanceToSquared(Ve))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Yt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Yt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new cn(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let x=0;x<n.count;x++)o[x]=new L,l[x]=new L;let c=new L,u=new L,f=new L,h=new ht,d=new ht,g=new ht,v=new L,m=new L;function p(x,M,R){c.fromBufferAttribute(n,x),u.fromBufferAttribute(n,M),f.fromBufferAttribute(n,R),h.fromBufferAttribute(r,x),d.fromBufferAttribute(r,M),g.fromBufferAttribute(r,R),u.sub(c),f.sub(c),d.sub(h),g.sub(h);let I=1/(d.x*g.y-g.x*d.y);isFinite(I)&&(v.copy(u).multiplyScalar(g.y).addScaledVector(f,-d.y).multiplyScalar(I),m.copy(f).multiplyScalar(d.x).addScaledVector(u,-g.x).multiplyScalar(I),o[x].add(v),o[M].add(v),o[R].add(v),l[x].add(m),l[M].add(m),l[R].add(m))}let S=this.groups;S.length===0&&(S=[{start:0,count:t.count}]);for(let x=0,M=S.length;x<M;++x){let R=S[x],I=R.start,P=R.count;for(let F=I,B=I+P;F<B;F+=3)p(t.getX(F+0),t.getX(F+1),t.getX(F+2))}let b=new L,y=new L,A=new L,w=new L;function T(x){A.fromBufferAttribute(s,x),w.copy(A);let M=o[x];b.copy(M),b.sub(A.multiplyScalar(A.dot(M))).normalize(),y.crossVectors(w,M);let I=y.dot(l[x])<0?-1:1;a.setXYZW(x,b.x,b.y,b.z,I)}for(let x=0,M=S.length;x<M;++x){let R=S[x],I=R.start,P=R.count;for(let F=I,B=I+P;F<B;F+=3)T(t.getX(F+0)),T(t.getX(F+1)),T(t.getX(F+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new cn(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let h=0,d=n.count;h<d;h++)n.setXYZ(h,0,0,0);let s=new L,r=new L,a=new L,o=new L,l=new L,c=new L,u=new L,f=new L;if(t)for(let h=0,d=t.count;h<d;h+=3){let g=t.getX(h+0),v=t.getX(h+1),m=t.getX(h+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,v),a.fromBufferAttribute(e,m),u.subVectors(a,r),f.subVectors(s,r),u.cross(f),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,m),o.add(u),l.add(u),c.add(u),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,d=e.count;h<d;h+=3)s.fromBufferAttribute(e,h+0),r.fromBufferAttribute(e,h+1),a.fromBufferAttribute(e,h+2),u.subVectors(a,r),f.subVectors(s,r),u.cross(f),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Ve.fromBufferAttribute(t,e),Ve.normalize(),t.setXYZ(e,Ve.x,Ve.y,Ve.z)}toNonIndexed(){function t(o,l){let c=o.array,u=o.itemSize,f=o.normalized,h=new c.constructor(l.length*u),d=0,g=0;for(let v=0,m=l.length;v<m;v++){o.isInterleavedBufferAttribute?d=l[v]*o.data.stride+o.offset:d=l[v]*u;for(let p=0;p<u;p++)h[g++]=c[d++]}return new cn(h,u,f)}if(this.index===null)return Xt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=t(l,n);e.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let u=0,f=c.length;u<f;u++){let h=c[u],d=t(h,n);l.push(d)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let f=0,h=c.length;f<h;f++){let d=c[f];u.push(d.toJSON(t.data))}u.length>0&&(s[l]=u,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(e))}let r=t.morphAttributes;for(let c in r){let u=[],f=r[c];for(let h=0,d=f.length;h<d;h++)u.push(f[h].clone(e));this.morphAttributes[c]=u}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let c=0,u=a.length;c<u;c++){let f=a[c];this.addGroup(f.start,f.count,f.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var uf=0,ii=class extends kn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:uf++}),this.uuid=Ds(),this.name="",this.type="Material",this.blending=qi,this.side=ni,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ba,this.blendDst=Ea,this.blendEquation=Mi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Gt(0,0,0),this.blendAlpha=0,this.depthFunc=Yi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ec,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Vi,this.stencilZFail=Vi,this.stencilZPass=Vi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){Xt(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Xt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==qi&&(n.blending=this.blending),this.side!==ni&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==ba&&(n.blendSrc=this.blendSrc),this.blendDst!==Ea&&(n.blendDst=this.blendDst),this.blendEquation!==Mi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Yi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==ec&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Vi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Vi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Vi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(e){let r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Gt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new ht().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new ht().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var ti=new L,kl=new L,aa=new L,_i=new L,Vl=new L,oa=new L,Wl=new L,Ba=class{constructor(t=new L,e=new L(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ti)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=ti.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(ti.copy(this.origin).addScaledVector(this.direction,e),ti.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){kl.copy(t).add(e).multiplyScalar(.5),aa.copy(e).sub(t).normalize(),_i.copy(this.origin).sub(kl);let r=t.distanceTo(e)*.5,a=-this.direction.dot(aa),o=_i.dot(this.direction),l=-_i.dot(aa),c=_i.lengthSq(),u=Math.abs(1-a*a),f,h,d,g;if(u>0)if(f=a*l-o,h=a*o-l,g=r*u,f>=0)if(h>=-g)if(h<=g){let v=1/u;f*=v,h*=v,d=f*(f+a*h+2*o)+h*(a*f+h+2*l)+c}else h=r,f=Math.max(0,-(a*h+o)),d=-f*f+h*(h+2*l)+c;else h=-r,f=Math.max(0,-(a*h+o)),d=-f*f+h*(h+2*l)+c;else h<=-g?(f=Math.max(0,-(-a*r+o)),h=f>0?-r:Math.min(Math.max(-r,-l),r),d=-f*f+h*(h+2*l)+c):h<=g?(f=0,h=Math.min(Math.max(-r,-l),r),d=h*(h+2*l)+c):(f=Math.max(0,-(a*r+o)),h=f>0?r:Math.min(Math.max(-r,-l),r),d=-f*f+h*(h+2*l)+c);else h=a>0?-r:r,f=Math.max(0,-(a*h+o)),d=-f*f+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(kl).addScaledVector(aa,h),d}intersectSphere(t,e){ti.subVectors(t.center,this.origin);let n=ti.dot(this.direction),s=ti.dot(ti)-n*n,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,l,c=1/this.direction.x,u=1/this.direction.y,f=1/this.direction.z,h=this.origin;return c>=0?(n=(t.min.x-h.x)*c,s=(t.max.x-h.x)*c):(n=(t.max.x-h.x)*c,s=(t.min.x-h.x)*c),u>=0?(r=(t.min.y-h.y)*u,a=(t.max.y-h.y)*u):(r=(t.max.y-h.y)*u,a=(t.min.y-h.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),f>=0?(o=(t.min.z-h.z)*f,l=(t.max.z-h.z)*f):(o=(t.max.z-h.z)*f,l=(t.min.z-h.z)*f),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,ti)!==null}intersectTriangle(t,e,n,s,r){Vl.subVectors(e,t),oa.subVectors(n,t),Wl.crossVectors(Vl,oa);let a=this.direction.dot(Wl),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;_i.subVectors(this.origin,t);let l=o*this.direction.dot(oa.crossVectors(_i,oa));if(l<0)return null;let c=o*this.direction.dot(Vl.cross(_i));if(c<0||l+c>a)return null;let u=-o*_i.dot(Wl);return u<0?null:this.at(u/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Vn=class extends ii{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Gt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new we,this.combine=co,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Ch=new ee,Gi=new Ba,la=new Si,Ih=new L,ca=new L,ha=new L,ua=new L,Xl=new L,da=new L,Ph=new L,fa=new L,Ct=class extends tn{constructor(t=new Be,e=new Vn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(r&&o){da.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=o[l],f=r[l];u!==0&&(Xl.fromBufferAttribute(f,t),a?da.addScaledVector(Xl,u):da.addScaledVector(Xl.sub(e),u))}e.add(da)}return e}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),la.copy(n.boundingSphere),la.applyMatrix4(r),Gi.copy(t.ray).recast(t.near),!(la.containsPoint(Gi.origin)===!1&&(Gi.intersectSphere(la,Ih)===null||Gi.origin.distanceToSquared(Ih)>(t.far-t.near)**2))&&(Ch.copy(r).invert(),Gi.copy(t.ray).applyMatrix4(Ch),!(n.boundingBox!==null&&Gi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Gi)))}_computeIntersections(t,e,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,f=r.attributes.normal,h=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,v=h.length;g<v;g++){let m=h[g],p=a[m.materialIndex],S=Math.max(m.start,d.start),b=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let y=S,A=b;y<A;y+=3){let w=o.getX(y),T=o.getX(y+1),x=o.getX(y+2);s=pa(this,p,t,n,c,u,f,w,T,x),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let g=Math.max(0,d.start),v=Math.min(o.count,d.start+d.count);for(let m=g,p=v;m<p;m+=3){let S=o.getX(m),b=o.getX(m+1),y=o.getX(m+2);s=pa(this,a,t,n,c,u,f,S,b,y),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,v=h.length;g<v;g++){let m=h[g],p=a[m.materialIndex],S=Math.max(m.start,d.start),b=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let y=S,A=b;y<A;y+=3){let w=y,T=y+1,x=y+2;s=pa(this,p,t,n,c,u,f,w,T,x),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let g=Math.max(0,d.start),v=Math.min(l.count,d.start+d.count);for(let m=g,p=v;m<p;m+=3){let S=m,b=m+1,y=m+2;s=pa(this,a,t,n,c,u,f,S,b,y),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}};function df(i,t,e,n,s,r,a,o){let l;if(t.side===Ze?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,t.side===ni,o),l===null)return null;fa.copy(o),fa.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(fa);return c<e.near||c>e.far?null:{distance:c,point:fa.clone(),object:i}}function pa(i,t,e,n,s,r,a,o,l,c){i.getVertexPosition(o,ca),i.getVertexPosition(l,ha),i.getVertexPosition(c,ua);let u=df(i,t,e,n,ca,ha,ua,Ph);if(u){let f=new L;vi.getBarycoord(Ph,ca,ha,ua,f),s&&(u.uv=vi.getInterpolatedAttribute(s,o,l,c,f,new ht)),r&&(u.uv1=vi.getInterpolatedAttribute(r,o,l,c,f,new ht)),a&&(u.normal=vi.getInterpolatedAttribute(a,o,l,c,f,new L),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a:o,b:l,c,normal:new L,materialIndex:0};vi.getNormal(ca,ha,ua,h.normal),u.face=h,u.barycoord=f}return u}var lr=class extends sn{constructor(t=null,e=1,n=1,s,r,a,o,l,c=We,u=We,f,h){super(null,a,o,l,c,u,s,r,f,h),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var cr=class extends cn{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},xs=new ee,Lh=new ee,ma=[],Dh=new En,ff=new ee,Ys=new Ct,Zs=new Si,Le=class extends Ct{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new cr(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,ff)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new En),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,xs),Dh.copy(t.boundingBox).applyMatrix4(xs),this.boundingBox.union(Dh)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Si),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,xs),Zs.copy(t.boundingSphere).applyMatrix4(xs),this.boundingSphere.union(Zs)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(t,e){let n=this.matrixWorld,s=this.count;if(Ys.geometry=this.geometry,Ys.material=this.material,Ys.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Zs.copy(this.boundingSphere),Zs.applyMatrix4(n),t.ray.intersectsSphere(Zs)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,xs),Lh.multiplyMatrices(n,xs),Ys.matrixWorld=Lh,Ys.raycast(t,ma);for(let a=0,o=ma.length;a<o;a++){let l=ma[a];l.instanceId=r,l.object=this,e.push(l)}ma.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new cr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new lr(new Float32Array(s*this.count),s,this.count,xo,wn));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*t;return r[l]=o,r.set(n,l+1),this}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},ql=new L,pf=new L,mf=new Kt,zn=class{constructor(t=new L(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=ql.subVectors(n,e).cross(pf.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let s=t.delta(ql),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let a=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(s,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||mf.getNormalMatrix(t),s=this.coplanarPoint(ql).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},ki=new Si,gf=new ht(.5,.5),ga=new L,Ts=class{constructor(t=new zn,e=new zn,n=new zn,s=new zn,r=new zn,a=new zn){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=In,n=!1){let s=this.planes,r=t.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],f=r[5],h=r[6],d=r[7],g=r[8],v=r[9],m=r[10],p=r[11],S=r[12],b=r[13],y=r[14],A=r[15];if(s[0].setComponents(c-a,d-u,p-g,A-S).normalize(),s[1].setComponents(c+a,d+u,p+g,A+S).normalize(),s[2].setComponents(c+o,d+f,p+v,A+b).normalize(),s[3].setComponents(c-o,d-f,p-v,A-b).normalize(),n)s[4].setComponents(l,h,m,y).normalize(),s[5].setComponents(c-l,d-h,p-m,A-y).normalize();else if(s[4].setComponents(c-l,d-h,p-m,A-y).normalize(),e===In)s[5].setComponents(c+l,d+h,p+m,A+y).normalize();else if(e===Ss)s[5].setComponents(l,h,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),ki.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),ki.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(ki)}intersectsSprite(t){ki.center.set(0,0,0);let e=gf.distanceTo(t.center);return ki.radius=.7071067811865476+e,ki.applyMatrix4(t.matrixWorld),this.intersectsSphere(ki)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(ga.x=s.normal.x>0?t.max.x:t.min.x,ga.y=s.normal.y>0?t.max.y:t.min.y,ga.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(ga)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var hr=class extends sn{constructor(t=[],e=Ri,n,s,r,a,o,l,c,u){super(t,e,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Zi=class extends sn{constructor(t,e,n,s,r,a,o,l,c){super(t,e,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var si=class extends sn{constructor(t,e,n=Ln,s,r,a,o=We,l=We,c,u=Gn,f=1){if(u!==Gn&&u!==Ii)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:t,height:e,depth:f};super(h,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Es(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}},za=class extends si{constructor(t,e=Ln,n=Ri,s,r,a=We,o=We,l,c=Gn){let u={width:t,height:t,depth:1},f=[u,u,u,u,u,u];super(t,t,e,n,s,r,a,o,l,c),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},ur=class extends sn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Et=class i extends Be{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],u=[],f=[],h=0,d=0;g("z","y","x",-1,-1,n,e,t,a,r,0),g("z","y","x",1,-1,n,e,-t,a,r,1),g("x","z","y",1,1,t,n,e,s,a,2),g("x","z","y",1,-1,t,n,-e,s,a,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new ce(c,3)),this.setAttribute("normal",new ce(u,3)),this.setAttribute("uv",new ce(f,2));function g(v,m,p,S,b,y,A,w,T,x,M){let R=y/T,I=A/x,P=y/2,F=A/2,B=w/2,D=T+1,z=x+1,N=0,X=0,Y=new L;for(let j=0;j<z;j++){let tt=j*I-F;for(let st=0;st<D;st++){let Tt=st*R-P;Y[v]=Tt*S,Y[m]=tt*b,Y[p]=B,c.push(Y.x,Y.y,Y.z),Y[v]=0,Y[m]=0,Y[p]=w>0?1:-1,u.push(Y.x,Y.y,Y.z),f.push(st/T),f.push(1-j/x),N+=1}}for(let j=0;j<x;j++)for(let tt=0;tt<T;tt++){let st=h+tt+D*j,Tt=h+tt+D*(j+1),Zt=h+(tt+1)+D*(j+1),wt=h+(tt+1)+D*j;l.push(st,Tt,wt),l.push(Tt,Zt,wt),X+=6}o.addGroup(d,X,M),d+=X,h+=N}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Ae=class i extends Be{constructor(t=1,e=1,n=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:t,height:e,capSegments:n,radialSegments:s,heightSegments:r},e=Math.max(0,e),n=Math.max(1,Math.floor(n)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));let a=[],o=[],l=[],c=[],u=e/2,f=Math.PI/2*t,h=e,d=2*f+h,g=n*2+r,v=s+1,m=new L,p=new L;for(let S=0;S<=g;S++){let b=0,y=0,A=0,w=0;if(S<=n){let M=S/n,R=M*Math.PI/2;y=-u-t*Math.cos(R),A=t*Math.sin(R),w=-t*Math.cos(R),b=M*f}else if(S<=n+r){let M=(S-n)/r;y=-u+M*e,A=t,w=0,b=f+M*h}else{let M=(S-n-r)/n,R=M*Math.PI/2;y=u+t*Math.sin(R),A=t*Math.cos(R),w=t*Math.sin(R),b=f+h+M*f}let T=Math.max(0,Math.min(1,b/d)),x=0;S===0?x=.5/s:S===g&&(x=-.5/s);for(let M=0;M<=s;M++){let R=M/s,I=R*Math.PI*2,P=Math.sin(I),F=Math.cos(I);p.x=-A*F,p.y=y,p.z=A*P,o.push(p.x,p.y,p.z),m.set(-A*F,w,A*P),m.normalize(),l.push(m.x,m.y,m.z),c.push(R+x,T)}if(S>0){let M=(S-1)*v;for(let R=0;R<s;R++){let I=M+R,P=M+R+1,F=S*v+R,B=S*v+R+1;a.push(I,P,F),a.push(P,B,F)}}}this.setIndex(a),this.setAttribute("position",new ce(o,3)),this.setAttribute("normal",new ce(l,3)),this.setAttribute("uv",new ce(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},bi=class i extends Be{constructor(t=1,e=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:s},e=Math.max(3,e);let r=[],a=[],o=[],l=[],c=new L,u=new ht;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let f=0,h=3;f<=e;f++,h+=3){let d=n+f/e*s;c.x=t*Math.cos(d),c.y=t*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),u.x=(a[h]/t+1)/2,u.y=(a[h+1]/t+1)/2,l.push(u.x,u.y)}for(let f=1;f<=e;f++)r.push(f,f+1,0);this.setIndex(r),this.setAttribute("position",new ce(a,3)),this.setAttribute("normal",new ce(o,3)),this.setAttribute("uv",new ce(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.segments,t.thetaStart,t.thetaLength)}},ne=class i extends Be{constructor(t=1,e=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let u=[],f=[],h=[],d=[],g=0,v=[],m=n/2,p=0;S(),a===!1&&(t>0&&b(!0),e>0&&b(!1)),this.setIndex(u),this.setAttribute("position",new ce(f,3)),this.setAttribute("normal",new ce(h,3)),this.setAttribute("uv",new ce(d,2));function S(){let y=new L,A=new L,w=0,T=(e-t)/n;for(let x=0;x<=r;x++){let M=[],R=x/r,I=R*(e-t)+t;for(let P=0;P<=s;P++){let F=P/s,B=F*l+o,D=Math.sin(B),z=Math.cos(B);A.x=I*D,A.y=-R*n+m,A.z=I*z,f.push(A.x,A.y,A.z),y.set(D,T,z).normalize(),h.push(y.x,y.y,y.z),d.push(F,1-R),M.push(g++)}v.push(M)}for(let x=0;x<s;x++)for(let M=0;M<r;M++){let R=v[M][x],I=v[M+1][x],P=v[M+1][x+1],F=v[M][x+1];(t>0||M!==0)&&(u.push(R,I,F),w+=3),(e>0||M!==r-1)&&(u.push(I,P,F),w+=3)}c.addGroup(p,w,0),p+=w}function b(y){let A=g,w=new ht,T=new L,x=0,M=y===!0?t:e,R=y===!0?1:-1;for(let P=1;P<=s;P++)f.push(0,m*R,0),h.push(0,R,0),d.push(.5,.5),g++;let I=g;for(let P=0;P<=s;P++){let B=P/s*l+o,D=Math.cos(B),z=Math.sin(B);T.x=M*z,T.y=m*R,T.z=M*D,f.push(T.x,T.y,T.z),h.push(0,R,0),w.x=D*.5+.5,w.y=z*.5*R+.5,d.push(w.x,w.y),g++}for(let P=0;P<s;P++){let F=A+P,B=I+P;y===!0?u.push(B,B+1,F):u.push(B+1,B,F),x+=3}c.addGroup(p,x,y===!0?1:2),p+=x}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},ri=class i extends ne{constructor(t=1,e=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new i(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Ha=class i extends Be{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};let r=[],a=[];o(s),c(n),u(),this.setAttribute("position",new ce(r,3)),this.setAttribute("normal",new ce(r.slice(),3)),this.setAttribute("uv",new ce(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(S){let b=new L,y=new L,A=new L;for(let w=0;w<e.length;w+=3)d(e[w+0],b),d(e[w+1],y),d(e[w+2],A),l(b,y,A,S)}function l(S,b,y,A){let w=A+1,T=[];for(let x=0;x<=w;x++){T[x]=[];let M=S.clone().lerp(y,x/w),R=b.clone().lerp(y,x/w),I=w-x;for(let P=0;P<=I;P++)P===0&&x===w?T[x][P]=M:T[x][P]=M.clone().lerp(R,P/I)}for(let x=0;x<w;x++)for(let M=0;M<2*(w-x)-1;M++){let R=Math.floor(M/2);M%2===0?(h(T[x][R+1]),h(T[x+1][R]),h(T[x][R])):(h(T[x][R+1]),h(T[x+1][R+1]),h(T[x+1][R]))}}function c(S){let b=new L;for(let y=0;y<r.length;y+=3)b.x=r[y+0],b.y=r[y+1],b.z=r[y+2],b.normalize().multiplyScalar(S),r[y+0]=b.x,r[y+1]=b.y,r[y+2]=b.z}function u(){let S=new L;for(let b=0;b<r.length;b+=3){S.x=r[b+0],S.y=r[b+1],S.z=r[b+2];let y=m(S)/2/Math.PI+.5,A=p(S)/Math.PI+.5;a.push(y,1-A)}g(),f()}function f(){for(let S=0;S<a.length;S+=6){let b=a[S+0],y=a[S+2],A=a[S+4],w=Math.max(b,y,A),T=Math.min(b,y,A);w>.9&&T<.1&&(b<.2&&(a[S+0]+=1),y<.2&&(a[S+2]+=1),A<.2&&(a[S+4]+=1))}}function h(S){r.push(S.x,S.y,S.z)}function d(S,b){let y=S*3;b.x=t[y+0],b.y=t[y+1],b.z=t[y+2]}function g(){let S=new L,b=new L,y=new L,A=new L,w=new ht,T=new ht,x=new ht;for(let M=0,R=0;M<r.length;M+=9,R+=6){S.set(r[M+0],r[M+1],r[M+2]),b.set(r[M+3],r[M+4],r[M+5]),y.set(r[M+6],r[M+7],r[M+8]),w.set(a[R+0],a[R+1]),T.set(a[R+2],a[R+3]),x.set(a[R+4],a[R+5]),A.copy(S).add(b).add(y).divideScalar(3);let I=m(A);v(w,R+0,S,I),v(T,R+2,b,I),v(x,R+4,y,I)}}function v(S,b,y,A){A<0&&S.x===1&&(a[b]=S.x-1),y.x===0&&y.z===0&&(a[b]=A/2/Math.PI+.5)}function m(S){return Math.atan2(S.z,-S.x)}function p(S){return Math.atan2(-S.y,Math.sqrt(S.x*S.x+S.z*S.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.vertices,t.indices,t.radius,t.detail)}};var xn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Xt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,s=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)n=this.getPoint(a/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let n=this.getLengths(),s=0,r=n.length,a;e?a=e:a=t*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);let u=n[s],h=n[s+1]-u,d=(a-u)/h;return(s+d)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),l=e||(a.isVector2?new ht:new L);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){let n=new L,s=[],r=[],a=[],o=new L,l=new ee;for(let d=0;d<=t;d++){let g=d/t;s[d]=this.getTangentAt(g,new L)}r[0]=new L,a[0]=new L;let c=Number.MAX_VALUE,u=Math.abs(s[0].x),f=Math.abs(s[0].y),h=Math.abs(s[0].z);u<=c&&(c=u,n.set(1,0,0)),f<=c&&(c=f,n.set(0,1,0)),h<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let d=1;d<=t;d++){if(r[d]=r[d-1].clone(),a[d]=a[d-1].clone(),o.crossVectors(s[d-1],s[d]),o.length()>Number.EPSILON){o.normalize();let g=Math.acos(ae(s[d-1].dot(s[d]),-1,1));r[d].applyMatrix4(l.makeRotationAxis(o,g))}a[d].crossVectors(s[d],r[d])}if(e===!0){let d=Math.acos(ae(r[0].dot(r[t]),-1,1));d/=t,s[0].dot(o.crossVectors(r[0],r[t]))>0&&(d=-d);for(let g=1;g<=t;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],d*g)),a[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},As=class extends xn{constructor(t=0,e=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new ht){let n=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let u=Math.cos(this.aRotation),f=Math.sin(this.aRotation),h=l-this.aX,d=c-this.aY;l=h*u-d*f+this.aX,c=h*f+d*u+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Ga=class extends As{constructor(t,e,n,s,r,a){super(t,e,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Cc(){let i=0,t=0,e=0,n=0;function s(r,a,o,l){i=r,t=o,e=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,u,f){let h=(a-r)/c-(o-r)/(c+u)+(o-a)/u,d=(o-a)/u-(l-a)/(u+f)+(l-o)/f;h*=u,d*=u,s(a,o,h,d)},calc:function(r){let a=r*r,o=a*r;return i+t*r+e*a+n*o}}}var Uh=new L,Nh=new L,Yl=new Cc,Zl=new Cc,$l=new Cc,ka=class extends xn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new L){let n=e,s=this.points,r=s.length,a=(r-(this.closed?0:1))*t,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,u;this.closed||o>0?c=s[(o-1)%r]:(Nh.subVectors(s[0],s[1]).add(s[0]),c=Nh);let f=s[o%r],h=s[(o+1)%r];if(this.closed||o+2<r?u=s[(o+2)%r]:(Uh.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=Uh),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(f),d),v=Math.pow(f.distanceToSquared(h),d),m=Math.pow(h.distanceToSquared(u),d);v<1e-4&&(v=1),g<1e-4&&(g=v),m<1e-4&&(m=v),Yl.initNonuniformCatmullRom(c.x,f.x,h.x,u.x,g,v,m),Zl.initNonuniformCatmullRom(c.y,f.y,h.y,u.y,g,v,m),$l.initNonuniformCatmullRom(c.z,f.z,h.z,u.z,g,v,m)}else this.curveType==="catmullrom"&&(Yl.initCatmullRom(c.x,f.x,h.x,u.x,this.tension),Zl.initCatmullRom(c.y,f.y,h.y,u.y,this.tension),$l.initCatmullRom(c.z,f.z,h.z,u.z,this.tension));return n.set(Yl.calc(l),Zl.calc(l),$l.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new L().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function Fh(i,t,e,n,s){let r=(n-t)*.5,a=(s-e)*.5,o=i*i,l=i*o;return(2*e-2*n+r+a)*l+(-3*e+3*n-2*r-a)*o+r*i+e}function xf(i,t){let e=1-i;return e*e*t}function _f(i,t){return 2*(1-i)*i*t}function yf(i,t){return i*i*t}function Js(i,t,e,n){return xf(i,t)+_f(i,e)+yf(i,n)}function vf(i,t){let e=1-i;return e*e*e*t}function Mf(i,t){let e=1-i;return 3*e*e*i*t}function Sf(i,t){return 3*(1-i)*i*i*t}function bf(i,t){return i*i*i*t}function Ks(i,t,e,n,s){return vf(i,t)+Mf(i,e)+Sf(i,n)+bf(i,s)}var dr=class extends xn{constructor(t=new ht,e=new ht,n=new ht,s=new ht){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new ht){let n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Ks(t,s.x,r.x,a.x,o.x),Ks(t,s.y,r.y,a.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Va=class extends xn{constructor(t=new L,e=new L,n=new L,s=new L){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new L){let n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Ks(t,s.x,r.x,a.x,o.x),Ks(t,s.y,r.y,a.y,o.y),Ks(t,s.z,r.z,a.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},fr=class extends xn{constructor(t=new ht,e=new ht){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new ht){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new ht){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Wa=class extends xn{constructor(t=new L,e=new L){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new L){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new L){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},pr=class extends xn{constructor(t=new ht,e=new ht,n=new ht){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new ht){let n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(Js(t,s.x,r.x,a.x),Js(t,s.y,r.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Xa=class extends xn{constructor(t=new L,e=new L,n=new L){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new L){let n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(Js(t,s.x,r.x,a.x),Js(t,s.y,r.y,a.y),Js(t,s.z,r.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},mr=class extends xn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new ht){let n=e,s=this.points,r=(s.length-1)*t,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],u=s[a>s.length-2?s.length-1:a+1],f=s[a>s.length-3?s.length-1:a+2];return n.set(Fh(o,l.x,c.x,u.x,f.x),Fh(o,l.y,c.y,u.y,f.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new ht().fromArray(s))}return this}},ic=Object.freeze({__proto__:null,ArcCurve:Ga,CatmullRomCurve3:ka,CubicBezierCurve:dr,CubicBezierCurve3:Va,EllipseCurve:As,LineCurve:fr,LineCurve3:Wa,QuadraticBezierCurve:pr,QuadraticBezierCurve3:Xa,SplineCurve:mr}),qa=class extends xn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new ic[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let a=s[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,l=a.getPoints(o);for(let c=0;c<l.length;c++){let u=l[c];n&&n.equals(u)||(e.push(u),n=u)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(new ic[s.type]().fromJSON(s))}return this}},gr=class extends qa{constructor(t){super(),this.type="Path",this.currentPoint=new ht,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let n=new fr(this.currentPoint.clone(),new ht(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){let r=new pr(this.currentPoint.clone(),new ht(t,e),new ht(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,a){let o=new dr(this.currentPoint.clone(),new ht(t,e),new ht(n,s),new ht(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),n=new mr(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+o,e+l,n,s,r,a),this}absarc(t,e,n,s,r,a){return this.absellipse(t,e,n,n,s,r,a),this}ellipse(t,e,n,s,r,a,o,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(t+c,e+u,n,s,r,a,o,l),this}absellipse(t,e,n,s,r,a,o,l){let c=new As(t,e,n,s,r,a,o,l);if(this.curves.length>0){let f=c.getPoint(0);f.equals(this.currentPoint)||this.lineTo(f.x,f.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},Rs=class extends gr{constructor(t){super(t),this.uuid=Ds(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){let s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(new gr().fromJSON(s))}return this}};function Ef(i,t,e=2){let n=t&&t.length,s=n?t[0]*e:i.length,r=Au(i,0,s,e,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(n&&(r=Cf(i,t,r,e)),i.length>80*e){o=i[0],l=i[1];let u=o,f=l;for(let h=e;h<s;h+=e){let d=i[h],g=i[h+1];d<o&&(o=d),g<l&&(l=g),d>u&&(u=d),g>f&&(f=g)}c=Math.max(u-o,f-l),c=c!==0?32767/c:0}return xr(r,a,e,o,l,c,0),a}function Au(i,t,e,n,s){let r;if(s===Hf(i,t,e,n)>0)for(let a=t;a<e;a+=n)r=Oh(a/n|0,i[a],i[a+1],r);else for(let a=e-n;a>=t;a-=n)r=Oh(a/n|0,i[a],i[a+1],r);return r&&Cs(r,r.next)&&(yr(r),r=r.next),r}function $i(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(Cs(e,e.next)||Te(e.prev,e,e.next)===0)){if(yr(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function xr(i,t,e,n,s,r,a){if(!i)return;!a&&r&&Uf(i,n,s,r);let o=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(r?Tf(i,n,s,r):wf(i)){t.push(l.i,i.i,c.i),yr(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=Af($i(i),t),xr(i,t,e,n,s,r,2)):a===2&&Rf(i,t,e,n,s,r):xr($i(i),t,e,n,s,r,1);break}}}function wf(i){let t=i.prev,e=i,n=i.next;if(Te(t,e,n)>=0)return!1;let s=t.x,r=e.x,a=n.x,o=t.y,l=e.y,c=n.y,u=Math.min(s,r,a),f=Math.min(o,l,c),h=Math.max(s,r,a),d=Math.max(o,l,c),g=n.next;for(;g!==t;){if(g.x>=u&&g.x<=h&&g.y>=f&&g.y<=d&&$s(s,o,r,l,a,c,g.x,g.y)&&Te(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Tf(i,t,e,n){let s=i.prev,r=i,a=i.next;if(Te(s,r,a)>=0)return!1;let o=s.x,l=r.x,c=a.x,u=s.y,f=r.y,h=a.y,d=Math.min(o,l,c),g=Math.min(u,f,h),v=Math.max(o,l,c),m=Math.max(u,f,h),p=sc(d,g,t,e,n),S=sc(v,m,t,e,n),b=i.prevZ,y=i.nextZ;for(;b&&b.z>=p&&y&&y.z<=S;){if(b.x>=d&&b.x<=v&&b.y>=g&&b.y<=m&&b!==s&&b!==a&&$s(o,u,l,f,c,h,b.x,b.y)&&Te(b.prev,b,b.next)>=0||(b=b.prevZ,y.x>=d&&y.x<=v&&y.y>=g&&y.y<=m&&y!==s&&y!==a&&$s(o,u,l,f,c,h,y.x,y.y)&&Te(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;b&&b.z>=p;){if(b.x>=d&&b.x<=v&&b.y>=g&&b.y<=m&&b!==s&&b!==a&&$s(o,u,l,f,c,h,b.x,b.y)&&Te(b.prev,b,b.next)>=0)return!1;b=b.prevZ}for(;y&&y.z<=S;){if(y.x>=d&&y.x<=v&&y.y>=g&&y.y<=m&&y!==s&&y!==a&&$s(o,u,l,f,c,h,y.x,y.y)&&Te(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function Af(i,t){let e=i;do{let n=e.prev,s=e.next.next;!Cs(n,s)&&Cu(n,e,e.next,s)&&_r(n,s)&&_r(s,n)&&(t.push(n.i,e.i,s.i),yr(e),yr(e.next),e=i=s),e=e.next}while(e!==i);return $i(e)}function Rf(i,t,e,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Of(a,o)){let l=Iu(a,o);a=$i(a,a.next),l=$i(l,l.next),xr(a,t,e,n,s,r,0),xr(l,t,e,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function Cf(i,t,e,n){let s=[];for(let r=0,a=t.length;r<a;r++){let o=t[r]*n,l=r<a-1?t[r+1]*n:i.length,c=Au(i,o,l,n,!1);c===c.next&&(c.steiner=!0),s.push(Ff(c))}s.sort(If);for(let r=0;r<s.length;r++)e=Pf(s[r],e);return e}function If(i,t){let e=i.x-t.x;if(e===0&&(e=i.y-t.y,e===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(t.next.y-t.y)/(t.next.x-t.x);e=n-s}return e}function Pf(i,t){let e=Lf(i,t);if(!e)return t;let n=Iu(e,i);return $i(n,n.next),$i(e,e.next)}function Lf(i,t){let e=t,n=i.x,s=i.y,r=-1/0,a;if(Cs(i,e))return e;do{if(Cs(i,e.next))return e.next;if(s<=e.y&&s>=e.next.y&&e.next.y!==e.y){let f=e.x+(s-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(f<=n&&f>r&&(r=f,a=e.x<e.next.x?e:e.next,f===n))return a}e=e.next}while(e!==t);if(!a)return null;let o=a,l=a.x,c=a.y,u=1/0;e=a;do{if(n>=e.x&&e.x>=l&&n!==e.x&&Ru(s<c?n:r,s,l,c,s<c?r:n,s,e.x,e.y)){let f=Math.abs(s-e.y)/(n-e.x);_r(e,i)&&(f<u||f===u&&(e.x>a.x||e.x===a.x&&Df(a,e)))&&(a=e,u=f)}e=e.next}while(e!==o);return a}function Df(i,t){return Te(i.prev,i,t.prev)<0&&Te(t.next,i,i.next)<0}function Uf(i,t,e,n){let s=i;do s.z===0&&(s.z=sc(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Nf(s)}function Nf(i){let t,e=1;do{let n=i,s;i=null;let r=null;for(t=0;n;){t++;let a=n,o=0;for(let c=0;c<e&&(o++,a=a.nextZ,!!a);c++);let l=e;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(s=n,n=n.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=a}r.nextZ=null,e*=2}while(t>1);return i}function sc(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function Ff(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function Ru(i,t,e,n,s,r,a,o){return(s-a)*(t-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(e-a)*(t-o)&&(e-a)*(r-o)>=(s-a)*(n-o)}function $s(i,t,e,n,s,r,a,o){return!(i===a&&t===o)&&Ru(i,t,e,n,s,r,a,o)}function Of(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!Bf(i,t)&&(_r(i,t)&&_r(t,i)&&zf(i,t)&&(Te(i.prev,i,t.prev)||Te(i,t.prev,t))||Cs(i,t)&&Te(i.prev,i,i.next)>0&&Te(t.prev,t,t.next)>0)}function Te(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function Cs(i,t){return i.x===t.x&&i.y===t.y}function Cu(i,t,e,n){let s=_a(Te(i,t,e)),r=_a(Te(i,t,n)),a=_a(Te(e,n,i)),o=_a(Te(e,n,t));return!!(s!==r&&a!==o||s===0&&xa(i,e,t)||r===0&&xa(i,n,t)||a===0&&xa(e,i,n)||o===0&&xa(e,t,n))}function xa(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function _a(i){return i>0?1:i<0?-1:0}function Bf(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&Cu(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function _r(i,t){return Te(i.prev,i,i.next)<0?Te(i,t,i.next)>=0&&Te(i,i.prev,t)>=0:Te(i,t,i.prev)<0||Te(i,i.next,t)<0}function zf(i,t){let e=i,n=!1,s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function Iu(i,t){let e=rc(i.i,i.x,i.y),n=rc(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function Oh(i,t,e,n){let s=rc(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function yr(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function rc(i,t,e){return{i,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Hf(i,t,e,n){let s=0;for(let r=t,a=e-n;r<e;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}var ac=class{static triangulate(t,e,n=2){return Ef(t,e,n)}},Wi=class i{static area(t){let e=t.length,n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return i.area(t)<0}static triangulateShape(t,e){let n=[],s=[],r=[];Bh(t),zh(n,t);let a=t.length;e.forEach(Bh);for(let l=0;l<e.length;l++)s.push(a),a+=e[l].length,zh(n,e[l]);let o=ac.triangulate(n,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function Bh(i){let t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function zh(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}var vr=class i extends Be{constructor(t=new Rs([new ht(.5,.5),new ht(-.5,.5),new ht(-.5,-.5),new ht(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let n=this,s=[],r=[];for(let o=0,l=t.length;o<l;o++){let c=t[o];a(c)}this.setAttribute("position",new ce(s,3)),this.setAttribute("uv",new ce(r,2)),this.computeVertexNormals();function a(o){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,u=e.steps!==void 0?e.steps:1,f=e.depth!==void 0?e.depth:1,h=e.bevelEnabled!==void 0?e.bevelEnabled:!0,d=e.bevelThickness!==void 0?e.bevelThickness:.2,g=e.bevelSize!==void 0?e.bevelSize:d-.1,v=e.bevelOffset!==void 0?e.bevelOffset:0,m=e.bevelSegments!==void 0?e.bevelSegments:3,p=e.extrudePath,S=e.UVGenerator!==void 0?e.UVGenerator:Gf,b,y=!1,A,w,T,x;if(p){b=p.getSpacedPoints(u),y=!0,h=!1;let et=p.isCatmullRomCurve3?p.closed:!1;A=p.computeFrenetFrames(u,et),w=new L,T=new L,x=new L}h||(m=0,d=0,g=0,v=0);let M=o.extractPoints(c),R=M.shape,I=M.holes;if(!Wi.isClockWise(R)){R=R.reverse();for(let et=0,at=I.length;et<at;et++){let it=I[et];Wi.isClockWise(it)&&(I[et]=it.reverse())}}function F(et){let it=10000000000000001e-36,yt=et[0];for(let gt=1;gt<=et.length;gt++){let Wt=gt%et.length,Ft=et[Wt],$t=Ft.x-yt.x,Qt=Ft.y-yt.y,U=$t*$t+Qt*Qt,fe=Math.max(Math.abs(Ft.x),Math.abs(Ft.y),Math.abs(yt.x),Math.abs(yt.y)),re=it*fe*fe;if(U<=re){et.splice(Wt,1),gt--;continue}yt=Ft}}F(R),I.forEach(F);let B=I.length,D=R;for(let et=0;et<B;et++){let at=I[et];R=R.concat(at)}function z(et,at,it){return at||Yt("ExtrudeGeometry: vec does not exist"),et.clone().addScaledVector(at,it)}let N=R.length;function X(et,at,it){let yt,gt,Wt,Ft=et.x-at.x,$t=et.y-at.y,Qt=it.x-et.x,U=it.y-et.y,fe=Ft*Ft+$t*$t,re=Ft*U-$t*Qt;if(Math.abs(re)>Number.EPSILON){let C=Math.sqrt(fe),_=Math.sqrt(Qt*Qt+U*U),G=at.x-$t/C,W=at.y+Ft/C,Z=it.x-U/_,ct=it.y+Qt/_,ut=((Z-G)*U-(ct-W)*Qt)/(Ft*U-$t*Qt);yt=G+Ft*ut-et.x,gt=W+$t*ut-et.y;let $=yt*yt+gt*gt;if($<=2)return new ht(yt,gt);Wt=Math.sqrt($/2)}else{let C=!1;Ft>Number.EPSILON?Qt>Number.EPSILON&&(C=!0):Ft<-Number.EPSILON?Qt<-Number.EPSILON&&(C=!0):Math.sign($t)===Math.sign(U)&&(C=!0),C?(yt=-$t,gt=Ft,Wt=Math.sqrt(fe)):(yt=Ft,gt=$t,Wt=Math.sqrt(fe/2))}return new ht(yt/Wt,gt/Wt)}let Y=[];for(let et=0,at=D.length,it=at-1,yt=et+1;et<at;et++,it++,yt++)it===at&&(it=0),yt===at&&(yt=0),Y[et]=X(D[et],D[it],D[yt]);let j=[],tt,st=Y.concat();for(let et=0,at=B;et<at;et++){let it=I[et];tt=[];for(let yt=0,gt=it.length,Wt=gt-1,Ft=yt+1;yt<gt;yt++,Wt++,Ft++)Wt===gt&&(Wt=0),Ft===gt&&(Ft=0),tt[yt]=X(it[yt],it[Wt],it[Ft]);j.push(tt),st=st.concat(tt)}let Tt;if(m===0)Tt=Wi.triangulateShape(D,I);else{let et=[],at=[];for(let it=0;it<m;it++){let yt=it/m,gt=d*Math.cos(yt*Math.PI/2),Wt=g*Math.sin(yt*Math.PI/2)+v;for(let Ft=0,$t=D.length;Ft<$t;Ft++){let Qt=z(D[Ft],Y[Ft],Wt);bt(Qt.x,Qt.y,-gt),yt===0&&et.push(Qt)}for(let Ft=0,$t=B;Ft<$t;Ft++){let Qt=I[Ft];tt=j[Ft];let U=[];for(let fe=0,re=Qt.length;fe<re;fe++){let C=z(Qt[fe],tt[fe],Wt);bt(C.x,C.y,-gt),yt===0&&U.push(C)}yt===0&&at.push(U)}}Tt=Wi.triangulateShape(et,at)}let Zt=Tt.length,wt=g+v;for(let et=0;et<N;et++){let at=h?z(R[et],st[et],wt):R[et];y?(T.copy(A.normals[0]).multiplyScalar(at.x),w.copy(A.binormals[0]).multiplyScalar(at.y),x.copy(b[0]).add(T).add(w),bt(x.x,x.y,x.z)):bt(at.x,at.y,0)}for(let et=1;et<=u;et++)for(let at=0;at<N;at++){let it=h?z(R[at],st[at],wt):R[at];y?(T.copy(A.normals[et]).multiplyScalar(it.x),w.copy(A.binormals[et]).multiplyScalar(it.y),x.copy(b[et]).add(T).add(w),bt(x.x,x.y,x.z)):bt(it.x,it.y,f/u*et)}for(let et=m-1;et>=0;et--){let at=et/m,it=d*Math.cos(at*Math.PI/2),yt=g*Math.sin(at*Math.PI/2)+v;for(let gt=0,Wt=D.length;gt<Wt;gt++){let Ft=z(D[gt],Y[gt],yt);bt(Ft.x,Ft.y,f+it)}for(let gt=0,Wt=I.length;gt<Wt;gt++){let Ft=I[gt];tt=j[gt];for(let $t=0,Qt=Ft.length;$t<Qt;$t++){let U=z(Ft[$t],tt[$t],yt);y?bt(U.x,U.y+b[u-1].y,b[u-1].x+it):bt(U.x,U.y,f+it)}}}J(),ot();function J(){let et=s.length/3;if(h){let at=0,it=N*at;for(let yt=0;yt<Zt;yt++){let gt=Tt[yt];It(gt[2]+it,gt[1]+it,gt[0]+it)}at=u+m*2,it=N*at;for(let yt=0;yt<Zt;yt++){let gt=Tt[yt];It(gt[0]+it,gt[1]+it,gt[2]+it)}}else{for(let at=0;at<Zt;at++){let it=Tt[at];It(it[2],it[1],it[0])}for(let at=0;at<Zt;at++){let it=Tt[at];It(it[0]+N*u,it[1]+N*u,it[2]+N*u)}}n.addGroup(et,s.length/3-et,0)}function ot(){let et=s.length/3,at=0;rt(D,at),at+=D.length;for(let it=0,yt=I.length;it<yt;it++){let gt=I[it];rt(gt,at),at+=gt.length}n.addGroup(et,s.length/3-et,1)}function rt(et,at){let it=et.length;for(;--it>=0;){let yt=it,gt=it-1;gt<0&&(gt=et.length-1);for(let Wt=0,Ft=u+m*2;Wt<Ft;Wt++){let $t=N*Wt,Qt=N*(Wt+1),U=at+yt+$t,fe=at+gt+$t,re=at+gt+Qt,C=at+yt+Qt;Vt(U,fe,re,C)}}}function bt(et,at,it){l.push(et),l.push(at),l.push(it)}function It(et,at,it){ue(et),ue(at),ue(it);let yt=s.length/3,gt=S.generateTopUV(n,s,yt-3,yt-2,yt-1);Jt(gt[0]),Jt(gt[1]),Jt(gt[2])}function Vt(et,at,it,yt){ue(et),ue(at),ue(yt),ue(at),ue(it),ue(yt);let gt=s.length/3,Wt=S.generateSideWallUV(n,s,gt-6,gt-3,gt-2,gt-1);Jt(Wt[0]),Jt(Wt[1]),Jt(Wt[3]),Jt(Wt[1]),Jt(Wt[2]),Jt(Wt[3])}function ue(et){s.push(l[et*3+0]),s.push(l[et*3+1]),s.push(l[et*3+2])}function Jt(et){r.push(et.x),r.push(et.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return kf(e,n,t)}static fromJSON(t,e){let n=[];for(let r=0,a=t.shapes.length;r<a;r++){let o=e[t.shapes[r]];n.push(o)}let s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new ic[s.type]().fromJSON(s)),new i(n,t.options)}},Gf={generateTopUV:function(i,t,e,n,s){let r=t[e*3],a=t[e*3+1],o=t[n*3],l=t[n*3+1],c=t[s*3],u=t[s*3+1];return[new ht(r,a),new ht(o,l),new ht(c,u)]},generateSideWallUV:function(i,t,e,n,s,r){let a=t[e*3],o=t[e*3+1],l=t[e*3+2],c=t[n*3],u=t[n*3+1],f=t[n*3+2],h=t[s*3],d=t[s*3+1],g=t[s*3+2],v=t[r*3],m=t[r*3+1],p=t[r*3+2];return Math.abs(o-u)<Math.abs(a-c)?[new ht(a,1-l),new ht(c,1-f),new ht(h,1-g),new ht(v,1-p)]:[new ht(o,1-l),new ht(u,1-f),new ht(d,1-g),new ht(m,1-p)]}};function kf(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var Mr=class i extends Ha{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};var ze=class i extends Be{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,f=t/o,h=e/l,d=[],g=[],v=[],m=[];for(let p=0;p<u;p++){let S=p*h-a;for(let b=0;b<c;b++){let y=b*f-r;g.push(y,-S,0),v.push(0,0,1),m.push(b/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let S=0;S<o;S++){let b=S+c*p,y=S+c*(p+1),A=S+1+c*(p+1),w=S+1+c*p;d.push(b,y,w),d.push(y,A,w)}this.setIndex(d),this.setAttribute("position",new ce(g,3)),this.setAttribute("normal",new ce(v,3)),this.setAttribute("uv",new ce(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}};var be=class i extends Be{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,u=[],f=new L,h=new L,d=[],g=[],v=[],m=[];for(let p=0;p<=n;p++){let S=[],b=p/n,y=a+b*o,A=t*Math.cos(y),w=Math.sqrt(t*t-A*A),T=0;p===0&&a===0?T=.5/e:p===n&&l===Math.PI&&(T=-.5/e);for(let x=0;x<=e;x++){let M=x/e,R=s+M*r;f.x=-w*Math.cos(R),f.y=A,f.z=w*Math.sin(R),g.push(f.x,f.y,f.z),h.copy(f).normalize(),v.push(h.x,h.y,h.z),m.push(M+T,1-b),S.push(c++)}u.push(S)}for(let p=0;p<n;p++)for(let S=0;S<e;S++){let b=u[p][S+1],y=u[p][S],A=u[p+1][S],w=u[p+1][S+1];(p!==0||a>0)&&d.push(b,y,w),(p!==n-1||l<Math.PI)&&d.push(y,A,w)}this.setIndex(d),this.setAttribute("position",new ce(g,3)),this.setAttribute("normal",new ce(v,3)),this.setAttribute("uv",new ce(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};function Ki(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];if(Hh(s))s.isRenderTargetTexture?(Xt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(Hh(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function en(i){let t={};for(let e=0;e<i.length;e++){let n=Ki(i[e]);for(let s in n)t[s]=n[s]}return t}function Hh(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Vf(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Ic(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:oe.workingColorSpace}var Pu={clone:Ki,merge:en},Wf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Xf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,rn=class extends ii{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Wf,this.fragmentShader=Xf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Ki(t.uniforms),this.uniformsGroups=Vf(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new Gt().setHex(s.value);break;case"v2":this.uniforms[n].value=new ht().fromArray(s.value);break;case"v3":this.uniforms[n].value=new L().fromArray(s.value);break;case"v4":this.uniforms[n].value=new Ee().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Kt().fromArray(s.value);break;case"m4":this.uniforms[n].value=new ee().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},Ya=class extends rn{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Dt=class extends ii{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Gt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Gt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Br,this.normalScale=new ht(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new we,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var De=class extends ii{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Gt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Gt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Br,this.normalScale=new ht(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new we,this.combine=co,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Za=class extends ii{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=pu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},$a=class extends ii{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function ya(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}var Ei=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let a;e:{i:if(!(t<s)){for(let o=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=e[++n],t<s)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=e[--n-1],t>=r)break t}a=n,n=0;break e}break n}for(;n<a;){let o=n+a>>>1;t<e[o]?a=o:n=o+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=n[r+a];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Ja=class extends Ei{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ql,endingEnd:Ql}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,a=t+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case jl:r=t,o=2*e-n;break;case tc:r=s.length-2,o=e+s[r]-s[r+1];break;default:r=t,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case jl:a=t,l=2*n-e;break;case tc:a=1,l=n+s[1]-s[0];break;default:a=t-1,l=e}let c=(n-e)*.5,u=this.valueSize;this._weightPrev=c/(e-o),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,u=this._offsetPrev,f=this._offsetNext,h=this._weightPrev,d=this._weightNext,g=(n-e)/(s-e),v=g*g,m=v*g,p=-h*m+2*h*v-h*g,S=(1+h)*m+(-1.5-2*h)*v+(-.5+h)*g+1,b=(-1-d)*m+(1.5+d)*v+.5*g,y=d*m-d*v;for(let A=0;A!==o;++A)r[A]=p*a[u+A]+S*a[c+A]+b*a[l+A]+y*a[f+A];return r}},Ka=class extends Ei{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,u=(n-e)/(s-e),f=1-u;for(let h=0;h!==o;++h)r[h]=a[c+h]*f+a[l+h]*u;return r}},Qa=class extends Ei{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},ja=class extends Ei{interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,u=this.inTangents,f=this.outTangents;if(!u||!f){let g=(n-e)/(s-e),v=1-g;for(let m=0;m!==o;++m)r[m]=a[c+m]*v+a[l+m]*g;return r}let h=o*2,d=t-1;for(let g=0;g!==o;++g){let v=a[c+g],m=a[l+g],p=d*h+g*2,S=f[p],b=f[p+1],y=t*h+g*2,A=u[y],w=u[y+1],T=(n-e)/(s-e),x,M,R,I,P;for(let F=0;F<8;F++){x=T*T,M=x*T,R=1-T,I=R*R,P=I*R;let D=P*e+3*I*T*S+3*R*x*A+M*s-n;if(Math.abs(D)<1e-10)break;let z=3*I*(S-e)+6*R*T*(A-S)+3*x*(s-A);if(Math.abs(z)<1e-10)break;T=T-D/z,T=Math.max(0,Math.min(1,T))}r[g]=P*v+3*I*T*b+3*R*x*w+M*m}return r}},_n=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=ya(e,this.TimeBufferType),this.values=ya(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:ya(t.times,Array),values:ya(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s)}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new Qa(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Ka(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Ja(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new ja(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case Qs:e=this.InterpolantFactoryMethodDiscrete;break;case Da:e=this.InterpolantFactoryMethodLinear;break;case Sa:e=this.InterpolantFactoryMethodSmooth;break;case Kl:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Xt("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Qs;case this.InterpolantFactoryMethodLinear:return Da;case this.InterpolantFactoryMethodSmooth:return Sa;case this.InterpolantFactoryMethodBezier:return Kl}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t}return this}trim(t,e){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<t;)++r;for(;a!==-1&&n[a]>e;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Yt("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Yt("KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){Yt("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(a!==null&&a>l){Yt("KeyframeTrack: Out of order keys.",this,o,l,a),t=!1;break}a=l}if(s!==void 0&&$d(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Yt("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Sa,r=t.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=t[o],u=t[o+1];if(c!==u&&(o!==1||c!==t[0]))if(s)l=!0;else{let f=o*n,h=f-n,d=f+n;for(let g=0;g!==n;++g){let v=e[f+g];if(v!==e[h+g]||v!==e[d+g]){l=!0;break}}}if(l){if(o!==a){t[a]=t[o];let f=o*n,h=a*n;for(let d=0;d!==n;++d)e[h+d]=e[f+d]}++a}}if(r>0){t[a]=t[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)e[l+c]=e[o+c];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,s}};_n.prototype.ValueTypeName="";_n.prototype.TimeBufferType=Float32Array;_n.prototype.ValueBufferType=Float32Array;_n.prototype.DefaultInterpolation=Da;var wi=class extends _n{constructor(t,e,n){super(t,e,n)}};wi.prototype.ValueTypeName="bool";wi.prototype.ValueBufferType=Array;wi.prototype.DefaultInterpolation=Qs;wi.prototype.InterpolantFactoryMethodLinear=void 0;wi.prototype.InterpolantFactoryMethodSmooth=void 0;var to=class extends _n{constructor(t,e,n,s){super(t,e,n,s)}};to.prototype.ValueTypeName="color";var eo=class extends _n{constructor(t,e,n,s){super(t,e,n,s)}};eo.prototype.ValueTypeName="number";var no=class extends Ei{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-e)/(s-e),c=t*o;for(let u=c+o;c!==u;c+=4)ve.slerpFlat(r,0,a,c-o,a,c,l);return r}},Sr=class extends _n{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new no(this.times,this.values,this.getValueSize(),t)}};Sr.prototype.ValueTypeName="quaternion";Sr.prototype.InterpolantFactoryMethodSmooth=void 0;var Ti=class extends _n{constructor(t,e,n){super(t,e,n)}};Ti.prototype.ValueTypeName="string";Ti.prototype.ValueBufferType=Array;Ti.prototype.DefaultInterpolation=Qs;Ti.prototype.InterpolantFactoryMethodLinear=void 0;Ti.prototype.InterpolantFactoryMethodSmooth=void 0;var io=class extends _n{constructor(t,e,n,s){super(t,e,n,s)}};io.prototype.ValueTypeName="vector";var so=class{constructor(t,e,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,f){return c.push(u,f),this},this.removeHandler=function(u){let f=c.indexOf(u);return f!==-1&&c.splice(f,2),this},this.getHandler=function(u){for(let f=0,h=c.length;f<h;f+=2){let d=c[f],g=c[f+1];if(d.global&&(d.lastIndex=0),d.test(u))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Lu=new so,ro=class{constructor(t){this.manager=t!==void 0?t:Lu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};ro.DEFAULT_MATERIAL_NAME="__DEFAULT";var br=class extends tn{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Gt(t),this.intensity=e}dispose(){this.dispatchEvent({type:"dispose"})}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},Er=class extends br{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(tn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Gt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Jl=new ee,Gh=new L,kh=new L,oc=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ht(512,512),this.mapType=hn,this.map=null,this.mapPass=null,this.matrix=new ee,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ts,this._frameExtents=new ht(1,1),this._viewportCount=1,this._viewports=[new Ee(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera,n=this.matrix;Gh.setFromMatrixPosition(t.matrixWorld),e.position.copy(Gh),kh.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(kh),e.updateMatrixWorld(),Jl.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Jl,e.coordinateSystem,e.reversedDepth),e.coordinateSystem===Ss||e.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Jl)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},va=new L,Ma=new ve,Bn=new L,wr=class extends tn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ee,this.projectionMatrix=new ee,this.projectionMatrixInverse=new ee,this.coordinateSystem=In,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(va,Ma,Bn),Bn.x===1&&Bn.y===1&&Bn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(va,Ma,Bn.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(va,Ma,Bn),Bn.x===1&&Bn.y===1&&Bn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(va,Ma,Bn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},yi=new L,Vh=new ht,Wh=new ht,je=class extends wr{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Ua*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(El*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Ua*2*Math.atan(Math.tan(El*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){yi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(yi.x,yi.y).multiplyScalar(-t/yi.z),yi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(yi.x,yi.y).multiplyScalar(-t/yi.z)}getViewSize(t,e){return this.getViewBounds(t,Vh,Wh),e.subVectors(Wh,Vh)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(El*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var Ai=class extends wr{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,a=n+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},lc=class extends oc{constructor(){super(new Ai(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Tr=class extends br{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(tn.DEFAULT_UP),this.updateMatrix(),this.target=new tn,this.shadow=new lc}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var _s=-90,ys=1,ao=class extends tn{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new je(_s,ys,t,e);s.layers=this.layers,this.add(s);let r=new je(_s,ys,t,e);r.layers=this.layers,this.add(r);let a=new je(_s,ys,t,e);a.layers=this.layers,this.add(a);let o=new je(_s,ys,t,e);o.layers=this.layers,this.add(o);let l=new je(_s,ys,t,e);l.layers=this.layers,this.add(l);let c=new je(_s,ys,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,l]=e;for(let c of e)this.remove(c);if(t===In)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Ss)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,u]=this.children,f=t.getRenderTarget(),h=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,2,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,3,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(n,4,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),n.texture.generateMipmaps=v,t.setRenderTarget(n,5,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,u),t.setRenderTarget(f,h,d),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},oo=class extends je{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var Pc="\\[\\]\\.:\\/",qf=new RegExp("["+Pc+"]","g"),Lc="[^"+Pc+"]",Yf="[^"+Pc.replace("\\.","")+"]",Zf=/((?:WC+[\/:])*)/.source.replace("WC",Lc),$f=/(WCOD+)?/.source.replace("WCOD",Yf),Jf=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Lc),Kf=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Lc),Qf=new RegExp("^"+Zf+$f+Jf+Kf+"$"),jf=["material","materials","bones","map"],cc=class{constructor(t,e,n){let s=n||Me.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},Me=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(qf,"")}static parseTrackName(t){let e=Qf.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);jf.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let l=n(o.children);if(l)return l}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Xt("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){Yt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Yt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Yt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let u=0;u<t.length;u++)if(t[u].name===c){c=u;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Yt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Yt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){Yt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){Yt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let a=t[s];if(a===void 0){let c=e.nodeName;Yt("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Yt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Yt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Me.Composite=cc;Me.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Me.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Me.prototype.GetterByBindingType=[Me.prototype._getValue_direct,Me.prototype._getValue_array,Me.prototype._getValue_arrayElement,Me.prototype._getValue_toArray];Me.prototype.SetterByBindingTypeAndVersioning=[[Me.prototype._setValue_direct,Me.prototype._setValue_direct_setNeedsUpdate,Me.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Me.prototype._setValue_array,Me.prototype._setValue_array_setNeedsUpdate,Me.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Me.prototype._setValue_arrayElement,Me.prototype._setValue_arrayElement_setNeedsUpdate,Me.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Me.prototype._setValue_fromArray,Me.prototype._setValue_fromArray_setNeedsUpdate,Me.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var I_=new Float32Array(1);var hc=class i{static{i.prototype.isMatrix2=!0}constructor(t,e,n,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=s,this}};function Dc(i,t,e,n){let s=tp(n);switch(e){case wc:return i*t;case xo:return i*t/s.components*s.byteLength;case _o:return i*t/s.components*s.byteLength;case Pi:return i*t*2/s.components*s.byteLength;case yo:return i*t*2/s.components*s.byteLength;case Tc:return i*t*3/s.components*s.byteLength;case Tn:return i*t*4/s.components*s.byteLength;case vo:return i*t*4/s.components*s.byteLength;case Lr:case Dr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Ur:case Nr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case So:case Eo:return Math.max(i,16)*Math.max(t,8)/4;case Mo:case bo:return Math.max(i,8)*Math.max(t,8)/2;case wo:case To:case Ro:case Co:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Ao:case Fr:case Io:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Po:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Lo:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Do:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Uo:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case No:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case Fo:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Oo:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Bo:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case zo:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Ho:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Go:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case ko:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Vo:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Wo:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Xo:case qo:case Yo:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Zo:case $o:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Or:case Jo:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function tp(i){switch(i){case hn:case Mc:return{byteLength:1,components:1};case Ps:case Sc:case Xn:return{byteLength:2,components:1};case mo:case go:return{byteLength:2,components:4};case Ln:case po:case wn:return{byteLength:4,components:1};case bc:case Ec:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"185"}}));typeof window<"u"&&(window.__THREE__?Xt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="185");function ed(){let i=null,t=!1,e=null,n=null;function s(r,a){e(r,a),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function np(i){let t=new WeakMap;function e(o,l){let c=o.array,u=o.usage,f=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,u),o.onUploadCallback();let d;if(c instanceof Float32Array)d=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=i.SHORT;else if(c instanceof Uint32Array)d=i.UNSIGNED_INT;else if(c instanceof Int32Array)d=i.INT;else if(c instanceof Int8Array)d=i.BYTE;else if(c instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:f}}function n(o,l,c){let u=l.array,f=l.updateRanges;if(i.bindBuffer(c,o),f.length===0)i.bufferSubData(c,0,u);else{f.sort((d,g)=>d.start-g.start);let h=0;for(let d=1;d<f.length;d++){let g=f[h],v=f[d];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++h,f[h]=v)}f.length=h+1;for(let d=0,g=f.length;d<g;d++){let v=f[d];i.bufferSubData(c,v.start*u.BYTES_PER_ELEMENT,u,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(i.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=t.get(o);(!u||u.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var ip=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,sp=`#ifdef USE_ALPHAHASH
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
#endif`,rp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,ap=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,op=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,lp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,cp=`#ifdef USE_AOMAP
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
#endif`,hp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,up=`#ifdef USE_BATCHING
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
#endif`,dp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,fp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,pp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,mp=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,gp=`#ifdef USE_IRIDESCENCE
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
#endif`,xp=`#ifdef USE_BUMPMAP
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
#endif`,_p=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,yp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,vp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Mp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Sp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,bp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Ep=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,wp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Tp=`#define PI 3.141592653589793
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
} // validated`,Ap=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Rp=`vec3 transformedNormal = objectNormal;
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
#endif`,Cp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Ip=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Pp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Lp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Dp="gl_FragColor = linearToOutputTexel( gl_FragColor );",Up=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Np=`#ifdef USE_ENVMAP
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
#endif`,Fp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Op=`#ifdef USE_ENVMAP
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
#endif`,Bp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,zp=`#ifdef USE_ENVMAP
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
#endif`,Hp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Gp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,kp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Vp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Wp=`#ifdef USE_GRADIENTMAP
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
}`,Xp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,qp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Yp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Zp=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,$p=`#ifdef USE_ENVMAP
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
#endif`,Jp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Kp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Qp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,jp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,tm=`PhysicalMaterial material;
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
#endif`,em=`uniform sampler2D dfgLUT;
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
}`,nm=`
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
#endif`,im=`#if defined( RE_IndirectDiffuse )
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
#endif`,sm=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,rm=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,am=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,om=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,lm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,cm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,hm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,um=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,dm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,fm=`#if defined( USE_POINTS_UV )
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
#endif`,pm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,mm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,gm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,xm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,_m=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ym=`#ifdef USE_MORPHTARGETS
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
#endif`,vm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Mm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Sm=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,bm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Em=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,wm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Tm=`#ifdef USE_NORMALMAP
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
#endif`,Am=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Rm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Cm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Im=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Pm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Lm=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Dm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Um=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Nm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Fm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Om=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Bm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,zm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Hm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Gm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,km=`float getShadowMask() {
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
}`,Vm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Wm=`#ifdef USE_SKINNING
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
#endif`,Xm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,qm=`#ifdef USE_SKINNING
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
#endif`,Ym=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Zm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,$m=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Jm=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Km=`#ifdef USE_TRANSMISSION
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
#endif`,Qm=`#ifdef USE_TRANSMISSION
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
#endif`,jm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,t0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,e0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,n0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,i0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,s0=`uniform sampler2D t2D;
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
}`,r0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,a0=`#ifdef ENVMAP_TYPE_CUBE
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
}`,o0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,l0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,c0=`#include <common>
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
}`,h0=`#if DEPTH_PACKING == 3200
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
}`,u0=`#define DISTANCE
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
}`,d0=`#define DISTANCE
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
}`,f0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,p0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,m0=`uniform float scale;
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
}`,g0=`uniform vec3 diffuse;
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
}`,x0=`#include <common>
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
}`,_0=`uniform vec3 diffuse;
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
}`,y0=`#define LAMBERT
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
}`,v0=`#define LAMBERT
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
}`,M0=`#define MATCAP
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
}`,S0=`#define MATCAP
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
}`,b0=`#define NORMAL
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
}`,E0=`#define NORMAL
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
}`,w0=`#define PHONG
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
}`,T0=`#define PHONG
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
}`,A0=`#define STANDARD
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
}`,R0=`#define STANDARD
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
}`,C0=`#define TOON
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
}`,I0=`#define TOON
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
}`,P0=`uniform float size;
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
}`,L0=`uniform vec3 diffuse;
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
}`,D0=`#include <common>
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
}`,U0=`uniform vec3 color;
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
}`,N0=`uniform float rotation;
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
}`,F0=`uniform vec3 diffuse;
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
}`,ie={alphahash_fragment:ip,alphahash_pars_fragment:sp,alphamap_fragment:rp,alphamap_pars_fragment:ap,alphatest_fragment:op,alphatest_pars_fragment:lp,aomap_fragment:cp,aomap_pars_fragment:hp,batching_pars_vertex:up,batching_vertex:dp,begin_vertex:fp,beginnormal_vertex:pp,bsdfs:mp,iridescence_fragment:gp,bumpmap_pars_fragment:xp,clipping_planes_fragment:_p,clipping_planes_pars_fragment:yp,clipping_planes_pars_vertex:vp,clipping_planes_vertex:Mp,color_fragment:Sp,color_pars_fragment:bp,color_pars_vertex:Ep,color_vertex:wp,common:Tp,cube_uv_reflection_fragment:Ap,defaultnormal_vertex:Rp,displacementmap_pars_vertex:Cp,displacementmap_vertex:Ip,emissivemap_fragment:Pp,emissivemap_pars_fragment:Lp,colorspace_fragment:Dp,colorspace_pars_fragment:Up,envmap_fragment:Np,envmap_common_pars_fragment:Fp,envmap_pars_fragment:Op,envmap_pars_vertex:Bp,envmap_physical_pars_fragment:$p,envmap_vertex:zp,fog_vertex:Hp,fog_pars_vertex:Gp,fog_fragment:kp,fog_pars_fragment:Vp,gradientmap_pars_fragment:Wp,lightmap_pars_fragment:Xp,lights_lambert_fragment:qp,lights_lambert_pars_fragment:Yp,lights_pars_begin:Zp,lights_toon_fragment:Jp,lights_toon_pars_fragment:Kp,lights_phong_fragment:Qp,lights_phong_pars_fragment:jp,lights_physical_fragment:tm,lights_physical_pars_fragment:em,lights_fragment_begin:nm,lights_fragment_maps:im,lights_fragment_end:sm,lightprobes_pars_fragment:rm,logdepthbuf_fragment:am,logdepthbuf_pars_fragment:om,logdepthbuf_pars_vertex:lm,logdepthbuf_vertex:cm,map_fragment:hm,map_pars_fragment:um,map_particle_fragment:dm,map_particle_pars_fragment:fm,metalnessmap_fragment:pm,metalnessmap_pars_fragment:mm,morphinstance_vertex:gm,morphcolor_vertex:xm,morphnormal_vertex:_m,morphtarget_pars_vertex:ym,morphtarget_vertex:vm,normal_fragment_begin:Mm,normal_fragment_maps:Sm,normal_pars_fragment:bm,normal_pars_vertex:Em,normal_vertex:wm,normalmap_pars_fragment:Tm,clearcoat_normal_fragment_begin:Am,clearcoat_normal_fragment_maps:Rm,clearcoat_pars_fragment:Cm,iridescence_pars_fragment:Im,opaque_fragment:Pm,packing:Lm,premultiplied_alpha_fragment:Dm,project_vertex:Um,dithering_fragment:Nm,dithering_pars_fragment:Fm,roughnessmap_fragment:Om,roughnessmap_pars_fragment:Bm,shadowmap_pars_fragment:zm,shadowmap_pars_vertex:Hm,shadowmap_vertex:Gm,shadowmask_pars_fragment:km,skinbase_vertex:Vm,skinning_pars_vertex:Wm,skinning_vertex:Xm,skinnormal_vertex:qm,specularmap_fragment:Ym,specularmap_pars_fragment:Zm,tonemapping_fragment:$m,tonemapping_pars_fragment:Jm,transmission_fragment:Km,transmission_pars_fragment:Qm,uv_pars_fragment:jm,uv_pars_vertex:t0,uv_vertex:e0,worldpos_vertex:n0,background_vert:i0,background_frag:s0,backgroundCube_vert:r0,backgroundCube_frag:a0,cube_vert:o0,cube_frag:l0,depth_vert:c0,depth_frag:h0,distance_vert:u0,distance_frag:d0,equirect_vert:f0,equirect_frag:p0,linedashed_vert:m0,linedashed_frag:g0,meshbasic_vert:x0,meshbasic_frag:_0,meshlambert_vert:y0,meshlambert_frag:v0,meshmatcap_vert:M0,meshmatcap_frag:S0,meshnormal_vert:b0,meshnormal_frag:E0,meshphong_vert:w0,meshphong_frag:T0,meshphysical_vert:A0,meshphysical_frag:R0,meshtoon_vert:C0,meshtoon_frag:I0,points_vert:P0,points_frag:L0,shadow_vert:D0,shadow_frag:U0,sprite_vert:N0,sprite_frag:F0},_t={common:{diffuse:{value:new Gt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Kt},alphaMap:{value:null},alphaMapTransform:{value:new Kt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Kt}},envmap:{envMap:{value:null},envMapRotation:{value:new Kt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Kt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Kt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Kt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Kt},normalScale:{value:new ht(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Kt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Kt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Kt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Kt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Gt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new L},probesMax:{value:new L},probesResolution:{value:new L}},points:{diffuse:{value:new Gt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Kt},alphaTest:{value:0},uvTransform:{value:new Kt}},sprite:{diffuse:{value:new Gt(16777215)},opacity:{value:1},center:{value:new ht(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Kt},alphaMap:{value:null},alphaMapTransform:{value:new Kt},alphaTest:{value:0}}},Yn={basic:{uniforms:en([_t.common,_t.specularmap,_t.envmap,_t.aomap,_t.lightmap,_t.fog]),vertexShader:ie.meshbasic_vert,fragmentShader:ie.meshbasic_frag},lambert:{uniforms:en([_t.common,_t.specularmap,_t.envmap,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.fog,_t.lights,{emissive:{value:new Gt(0)},envMapIntensity:{value:1}}]),vertexShader:ie.meshlambert_vert,fragmentShader:ie.meshlambert_frag},phong:{uniforms:en([_t.common,_t.specularmap,_t.envmap,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.fog,_t.lights,{emissive:{value:new Gt(0)},specular:{value:new Gt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ie.meshphong_vert,fragmentShader:ie.meshphong_frag},standard:{uniforms:en([_t.common,_t.envmap,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.roughnessmap,_t.metalnessmap,_t.fog,_t.lights,{emissive:{value:new Gt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ie.meshphysical_vert,fragmentShader:ie.meshphysical_frag},toon:{uniforms:en([_t.common,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.gradientmap,_t.fog,_t.lights,{emissive:{value:new Gt(0)}}]),vertexShader:ie.meshtoon_vert,fragmentShader:ie.meshtoon_frag},matcap:{uniforms:en([_t.common,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.fog,{matcap:{value:null}}]),vertexShader:ie.meshmatcap_vert,fragmentShader:ie.meshmatcap_frag},points:{uniforms:en([_t.points,_t.fog]),vertexShader:ie.points_vert,fragmentShader:ie.points_frag},dashed:{uniforms:en([_t.common,_t.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ie.linedashed_vert,fragmentShader:ie.linedashed_frag},depth:{uniforms:en([_t.common,_t.displacementmap]),vertexShader:ie.depth_vert,fragmentShader:ie.depth_frag},normal:{uniforms:en([_t.common,_t.bumpmap,_t.normalmap,_t.displacementmap,{opacity:{value:1}}]),vertexShader:ie.meshnormal_vert,fragmentShader:ie.meshnormal_frag},sprite:{uniforms:en([_t.sprite,_t.fog]),vertexShader:ie.sprite_vert,fragmentShader:ie.sprite_frag},background:{uniforms:{uvTransform:{value:new Kt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ie.background_vert,fragmentShader:ie.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Kt}},vertexShader:ie.backgroundCube_vert,fragmentShader:ie.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ie.cube_vert,fragmentShader:ie.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ie.equirect_vert,fragmentShader:ie.equirect_frag},distance:{uniforms:en([_t.common,_t.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ie.distance_vert,fragmentShader:ie.distance_frag},shadow:{uniforms:en([_t.lights,_t.fog,{color:{value:new Gt(0)},opacity:{value:1}}]),vertexShader:ie.shadow_vert,fragmentShader:ie.shadow_frag}};Yn.physical={uniforms:en([Yn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Kt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Kt},clearcoatNormalScale:{value:new ht(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Kt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Kt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Kt},sheen:{value:0},sheenColor:{value:new Gt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Kt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Kt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Kt},transmissionSamplerSize:{value:new ht},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Kt},attenuationDistance:{value:0},attenuationColor:{value:new Gt(0)},specularColor:{value:new Gt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Kt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Kt},anisotropyVector:{value:new ht},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Kt}}]),vertexShader:ie.meshphysical_vert,fragmentShader:ie.meshphysical_frag};var jo={r:0,b:0,g:0},O0=new ee,nd=new Kt;nd.set(-1,0,0,0,1,0,0,0,1);function B0(i,t,e,n,s,r){let a=new Gt(0),o=s===!0?0:1,l,c,u=null,f=0,h=null;function d(S){let b=S.isScene===!0?S.background:null;if(b&&b.isTexture){let y=S.backgroundBlurriness>0;b=t.get(b,y)}return b}function g(S){let b=!1,y=d(S);y===null?m(a,o):y&&y.isColor&&(m(y,1),b=!0);let A=i.xr.getEnvironmentBlendMode();A==="additive"?e.buffers.color.setClear(0,0,0,1,r):A==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||b)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function v(S,b){let y=d(b);y&&(y.isCubeTexture||y.mapping===Ir)?(c===void 0&&(c=new Ct(new Et(1,1,1),new rn({name:"BackgroundCubeMaterial",uniforms:Ki(Yn.backgroundCube.uniforms),vertexShader:Yn.backgroundCube.vertexShader,fragmentShader:Yn.backgroundCube.fragmentShader,side:Ze,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(A,w,T){this.matrixWorld.copyPosition(T.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(O0.makeRotationFromEuler(b.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(nd),c.material.toneMapped=oe.getTransfer(y.colorSpace)!==de,(u!==y||f!==y.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,u=y,f=y.version,h=i.toneMapping),c.layers.enableAll(),S.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new Ct(new ze(2,2),new rn({name:"BackgroundMaterial",uniforms:Ki(Yn.background.uniforms),vertexShader:Yn.background.vertexShader,fragmentShader:Yn.background.fragmentShader,side:ni,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,l.material.toneMapped=oe.getTransfer(y.colorSpace)!==de,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(u!==y||f!==y.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,u=y,f=y.version,h=i.toneMapping),l.layers.enableAll(),S.unshift(l,l.geometry,l.material,0,0,null))}function m(S,b){S.getRGB(jo,Ic(i)),e.buffers.color.setClear(jo.r,jo.g,jo.b,b,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(S,b=1){a.set(S),o=b,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(S){o=S,m(a,o)},render:g,addToRenderList:v,dispose:p}}function z0(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null),r=s,a=!1;function o(I,P,F,B,D){let z=!1,N=f(I,B,F,P);r!==N&&(r=N,c(r.object)),z=d(I,B,F,D),z&&g(I,B,F,D),D!==null&&t.update(D,i.ELEMENT_ARRAY_BUFFER),(z||a)&&(a=!1,y(I,P,F,B),D!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(D).buffer))}function l(){return i.createVertexArray()}function c(I){return i.bindVertexArray(I)}function u(I){return i.deleteVertexArray(I)}function f(I,P,F,B){let D=B.wireframe===!0,z=n[P.id];z===void 0&&(z={},n[P.id]=z);let N=I.isInstancedMesh===!0?I.id:0,X=z[N];X===void 0&&(X={},z[N]=X);let Y=X[F.id];Y===void 0&&(Y={},X[F.id]=Y);let j=Y[D];return j===void 0&&(j=h(l()),Y[D]=j),j}function h(I){let P=[],F=[],B=[];for(let D=0;D<e;D++)P[D]=0,F[D]=0,B[D]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:F,attributeDivisors:B,object:I,attributes:{},index:null}}function d(I,P,F,B){let D=r.attributes,z=P.attributes,N=0,X=F.getAttributes();for(let Y in X)if(X[Y].location>=0){let tt=D[Y],st=z[Y];if(st===void 0&&(Y==="instanceMatrix"&&I.instanceMatrix&&(st=I.instanceMatrix),Y==="instanceColor"&&I.instanceColor&&(st=I.instanceColor)),tt===void 0||tt.attribute!==st||st&&tt.data!==st.data)return!0;N++}return r.attributesNum!==N||r.index!==B}function g(I,P,F,B){let D={},z=P.attributes,N=0,X=F.getAttributes();for(let Y in X)if(X[Y].location>=0){let tt=z[Y];tt===void 0&&(Y==="instanceMatrix"&&I.instanceMatrix&&(tt=I.instanceMatrix),Y==="instanceColor"&&I.instanceColor&&(tt=I.instanceColor));let st={};st.attribute=tt,tt&&tt.data&&(st.data=tt.data),D[Y]=st,N++}r.attributes=D,r.attributesNum=N,r.index=B}function v(){let I=r.newAttributes;for(let P=0,F=I.length;P<F;P++)I[P]=0}function m(I){p(I,0)}function p(I,P){let F=r.newAttributes,B=r.enabledAttributes,D=r.attributeDivisors;F[I]=1,B[I]===0&&(i.enableVertexAttribArray(I),B[I]=1),D[I]!==P&&(i.vertexAttribDivisor(I,P),D[I]=P)}function S(){let I=r.newAttributes,P=r.enabledAttributes;for(let F=0,B=P.length;F<B;F++)P[F]!==I[F]&&(i.disableVertexAttribArray(F),P[F]=0)}function b(I,P,F,B,D,z,N){N===!0?i.vertexAttribIPointer(I,P,F,D,z):i.vertexAttribPointer(I,P,F,B,D,z)}function y(I,P,F,B){v();let D=B.attributes,z=F.getAttributes(),N=P.defaultAttributeValues;for(let X in z){let Y=z[X];if(Y.location>=0){let j=D[X];if(j===void 0&&(X==="instanceMatrix"&&I.instanceMatrix&&(j=I.instanceMatrix),X==="instanceColor"&&I.instanceColor&&(j=I.instanceColor)),j!==void 0){let tt=j.normalized,st=j.itemSize,Tt=t.get(j);if(Tt===void 0)continue;let Zt=Tt.buffer,wt=Tt.type,J=Tt.bytesPerElement,ot=wt===i.INT||wt===i.UNSIGNED_INT||j.gpuType===po;if(j.isInterleavedBufferAttribute){let rt=j.data,bt=rt.stride,It=j.offset;if(rt.isInstancedInterleavedBuffer){for(let Vt=0;Vt<Y.locationSize;Vt++)p(Y.location+Vt,rt.meshPerAttribute);I.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=rt.meshPerAttribute*rt.count)}else for(let Vt=0;Vt<Y.locationSize;Vt++)m(Y.location+Vt);i.bindBuffer(i.ARRAY_BUFFER,Zt);for(let Vt=0;Vt<Y.locationSize;Vt++)b(Y.location+Vt,st/Y.locationSize,wt,tt,bt*J,(It+st/Y.locationSize*Vt)*J,ot)}else{if(j.isInstancedBufferAttribute){for(let rt=0;rt<Y.locationSize;rt++)p(Y.location+rt,j.meshPerAttribute);I.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let rt=0;rt<Y.locationSize;rt++)m(Y.location+rt);i.bindBuffer(i.ARRAY_BUFFER,Zt);for(let rt=0;rt<Y.locationSize;rt++)b(Y.location+rt,st/Y.locationSize,wt,tt,st*J,st/Y.locationSize*rt*J,ot)}}else if(N!==void 0){let tt=N[X];if(tt!==void 0)switch(tt.length){case 2:i.vertexAttrib2fv(Y.location,tt);break;case 3:i.vertexAttrib3fv(Y.location,tt);break;case 4:i.vertexAttrib4fv(Y.location,tt);break;default:i.vertexAttrib1fv(Y.location,tt)}}}}S()}function A(){M();for(let I in n){let P=n[I];for(let F in P){let B=P[F];for(let D in B){let z=B[D];for(let N in z)u(z[N].object),delete z[N];delete B[D]}}delete n[I]}}function w(I){if(n[I.id]===void 0)return;let P=n[I.id];for(let F in P){let B=P[F];for(let D in B){let z=B[D];for(let N in z)u(z[N].object),delete z[N];delete B[D]}}delete n[I.id]}function T(I){for(let P in n){let F=n[P];for(let B in F){let D=F[B];if(D[I.id]===void 0)continue;let z=D[I.id];for(let N in z)u(z[N].object),delete z[N];delete D[I.id]}}}function x(I){for(let P in n){let F=n[P],B=I.isInstancedMesh===!0?I.id:0,D=F[B];if(D!==void 0){for(let z in D){let N=D[z];for(let X in N)u(N[X].object),delete N[X];delete D[z]}delete F[B],Object.keys(F).length===0&&delete n[P]}}}function M(){R(),a=!0,r!==s&&(r=s,c(r.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:M,resetDefaultState:R,dispose:A,releaseStatesOfGeometry:w,releaseStatesOfObject:x,releaseStatesOfProgram:T,initAttributes:v,enableAttribute:m,disableUnusedAttributes:S}}function H0(i,t,e){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),e.update(c,n,1)}function a(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),e.update(c,n,u))}function o(l,c,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let h=0;for(let d=0;d<u;d++)h+=c[d];e.update(h,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function G0(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let T=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(T){return!(T!==Tn&&n.convert(T)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(T){let x=T===Xn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(T!==hn&&n.convert(T)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&T!==wn&&!x)}function l(T){if(T==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",u=l(c);u!==c&&(Xt("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let f=e.logarithmicDepthBuffer===!0,h=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&h===!1&&Xt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),S=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),b=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),A=i.getParameter(i.MAX_SAMPLES),w=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:f,reversedDepthBuffer:h,maxTextures:d,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:S,maxVaryings:b,maxFragmentUniforms:y,maxSamples:A,samples:w}}function k0(i){let t=this,e=null,n=0,s=!1,r=!1,a=new zn,o=new Kt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,h){let d=f.length!==0||h||n!==0||s;return s=h,n=f.length,d},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,h){e=u(f,h,0)},this.setState=function(f,h,d){let g=f.clippingPlanes,v=f.clipIntersection,m=f.clipShadows,p=i.get(f);if(!s||g===null||g.length===0||r&&!m)r?u(null):c();else{let S=r?0:n,b=S*4,y=p.clippingState||null;l.value=y,y=u(g,h,b,d);for(let A=0;A!==b;++A)y[A]=e[A];p.clippingState=y,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=S}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function u(f,h,d,g){let v=f!==null?f.length:0,m=null;if(v!==0){if(m=l.value,g!==!0||m===null){let p=d+v*4,S=h.matrixWorldInverse;o.getNormalMatrix(S),(m===null||m.length<p)&&(m=new Float32Array(p));for(let b=0,y=d;b!==v;++b,y+=4)a.copy(f[b]).applyMatrix4(S,o),a.normal.toArray(m,y),m[y+3]=a.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,m}}var Li=4,Du=[.125,.215,.35,.446,.526,.582],Qi=20,V0=256,zr=new Ai,Uu=new Gt,Uc=null,Nc=0,Fc=0,Oc=!1,W0=new L,el=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){let{size:a=256,position:o=W0}=r;Uc=this._renderer.getRenderTarget(),Nc=this._renderer.getActiveCubeFace(),Fc=this._renderer.getActiveMipmapLevel(),Oc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,n,s,l,o),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ou(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Fu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(Uc,Nc,Fc),this._renderer.xr.enabled=Oc,t.scissorTest=!1,Us(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Ri||t.mapping===Ji?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Uc=this._renderer.getRenderTarget(),Nc=this._renderer.getActiveCubeFace(),Fc=this._renderer.getActiveMipmapLevel(),Oc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Ye,minFilter:Ye,generateMipmaps:!1,type:Xn,format:Tn,colorSpace:js,depthBuffer:!1},s=Nu(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Nu(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=X0(r)),this._blurMaterial=Y0(r,t,e),this._ggxMaterial=q0(r,t,e)}return s}_compileMaterial(t){let e=new Ct(new Be,t);this._renderer.compile(e,zr)}_sceneToCubeUV(t,e,n,s,r){let l=new je(90,1,e,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],f=this._renderer,h=f.autoClear,d=f.toneMapping;f.getClearColor(Uu),f.toneMapping=Pn,f.autoClear=!1,f.state.buffers.depth.getReversed()&&(f.setRenderTarget(s),f.clearDepth(),f.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Ct(new Et,new Vn({name:"PMREM.Background",side:Ze,depthWrite:!1,depthTest:!1})));let v=this._backgroundBox,m=v.material,p=!1,S=t.background;S?S.isColor&&(m.color.copy(S),t.background=null,p=!0):(m.color.copy(Uu),p=!0);for(let b=0;b<6;b++){let y=b%3;y===0?(l.up.set(0,c[b],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[b],r.y,r.z)):y===1?(l.up.set(0,0,c[b]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[b],r.z)):(l.up.set(0,c[b],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[b]));let A=this._cubeSize;Us(s,y*A,b>2?A:0,A,A),f.setRenderTarget(s),p&&f.render(v,l),f.render(t,l)}f.toneMapping=d,f.autoClear=h,t.background=S}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===Ri||t.mapping===Ji;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ou()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Fu());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=t;let l=this._cubeSize;Us(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,zr)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let l=a.uniforms,c=n/(this._lodMeshes.length-1),u=e/(this._lodMeshes.length-1),f=Math.sqrt(c*c-u*u),h=0+c*1.25,d=f*h,{_lodMax:g}=this,v=this._sizeLods[n],m=3*v*(n>g-Li?n-g+Li:0),p=4*(this._cubeSize-v);l.envMap.value=t.texture,l.roughness.value=d,l.mipInt.value=g-e,Us(r,m,p,3*v,2*v),s.setRenderTarget(r),s.render(o,zr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-n,Us(t,m,p,3*v,2*v),s.setRenderTarget(t),s.render(o,zr)}_blur(t,e,n,s,r){let a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,s,"latitudinal",r),this._halfBlur(a,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,a,o){let l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&Yt("blur direction must be either latitudinal or longitudinal!");let u=3,f=this._lodMeshes[s];f.material=c;let h=c.uniforms,d=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*Qi-1),v=r/g,m=isFinite(r)?1+Math.floor(u*v):Qi;m>Qi&&Xt(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Qi}`);let p=[],S=0;for(let T=0;T<Qi;++T){let x=T/v,M=Math.exp(-x*x/2);p.push(M),T===0?S+=M:T<m&&(S+=2*M)}for(let T=0;T<p.length;T++)p[T]=p[T]/S;h.envMap.value=t.texture,h.samples.value=m,h.weights.value=p,h.latitudinal.value=a==="latitudinal",o&&(h.poleAxis.value=o);let{_lodMax:b}=this;h.dTheta.value=g,h.mipInt.value=b-n;let y=this._sizeLods[s],A=3*y*(s>b-Li?s-b+Li:0),w=4*(this._cubeSize-y);Us(e,A,w,3*y,2*y),l.setRenderTarget(e),l.render(f,zr)}};function X0(i){let t=[],e=[],n=[],s=i,r=i-Li+1+Du.length;for(let a=0;a<r;a++){let o=Math.pow(2,s);t.push(o);let l=1/o;a>i-Li?l=Du[a-i+Li-1]:a===0&&(l=0),e.push(l);let c=1/(o-2),u=-c,f=1+c,h=[u,u,f,u,f,f,u,u,f,f,u,f],d=6,g=6,v=3,m=2,p=1,S=new Float32Array(v*g*d),b=new Float32Array(m*g*d),y=new Float32Array(p*g*d);for(let w=0;w<d;w++){let T=w%3*2/3-1,x=w>2?0:-1,M=[T,x,0,T+2/3,x,0,T+2/3,x+1,0,T,x,0,T+2/3,x+1,0,T,x+1,0];S.set(M,v*g*w),b.set(h,m*g*w);let R=[w,w,w,w,w,w];y.set(R,p*g*w)}let A=new Be;A.setAttribute("position",new cn(S,v)),A.setAttribute("uv",new cn(b,m)),A.setAttribute("faceIndex",new cn(y,p)),n.push(new Ct(A,null)),s>Li&&s--}return{lodMeshes:n,sizeLods:t,sigmas:e}}function Nu(i,t,e){let n=new gn(i,t,e);return n.texture.mapping=Ir,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Us(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function q0(i,t,e){return new rn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:V0,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:sl(),fragmentShader:`

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
		`,blending:Wn,depthTest:!1,depthWrite:!1})}function Y0(i,t,e){let n=new Float32Array(Qi),s=new L(0,1,0);return new rn({name:"SphericalGaussianBlur",defines:{n:Qi,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:sl(),fragmentShader:`

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
		`,blending:Wn,depthTest:!1,depthWrite:!1})}function Fu(){return new rn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:sl(),fragmentShader:`

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
		`,blending:Wn,depthTest:!1,depthWrite:!1})}function Ou(){return new rn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:sl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Wn,depthTest:!1,depthWrite:!1})}function sl(){return`

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
	`}var nl=class extends gn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new hr(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Et(5,5,5),r=new rn({name:"CubemapFromEquirect",uniforms:Ki(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ze,blending:Wn});r.uniforms.tEquirect.value=e;let a=new Ct(s,r),o=e.minFilter;return e.minFilter===Ci&&(e.minFilter=Ye),new ao(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}};function Z0(i){let t=new WeakMap,e=new WeakMap,n=null;function s(h,d=!1){return h==null?null:d?a(h):r(h)}function r(h){if(h&&h.isTexture){let d=h.mapping;if(d===ho||d===uo)if(t.has(h)){let g=t.get(h).texture;return o(g,h.mapping)}else{let g=h.image;if(g&&g.height>0){let v=new nl(g.height);return v.fromEquirectangularTexture(i,h),t.set(h,v),h.addEventListener("dispose",c),o(v.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture){let d=h.mapping,g=d===ho||d===uo,v=d===Ri||d===Ji;if(g||v){let m=e.get(h),p=m!==void 0?m.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==p)return n===null&&(n=new el(i)),m=g?n.fromEquirectangular(h,m):n.fromCubemap(h,m),m.texture.pmremVersion=h.pmremVersion,e.set(h,m),m.texture;if(m!==void 0)return m.texture;{let S=h.image;return g&&S&&S.height>0||v&&S&&l(S)?(n===null&&(n=new el(i)),m=g?n.fromEquirectangular(h):n.fromCubemap(h),m.texture.pmremVersion=h.pmremVersion,e.set(h,m),h.addEventListener("dispose",u),m.texture):null}}}return h}function o(h,d){return d===ho?h.mapping=Ri:d===uo&&(h.mapping=Ji),h}function l(h){let d=0,g=6;for(let v=0;v<g;v++)h[v]!==void 0&&d++;return d===g}function c(h){let d=h.target;d.removeEventListener("dispose",c);let g=t.get(d);g!==void 0&&(t.delete(d),g.dispose())}function u(h){let d=h.target;d.removeEventListener("dispose",u);let g=e.get(d);g!==void 0&&(e.delete(d),g.dispose())}function f(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:f}}function $0(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&Xi("WebGLRenderer: "+n+" extension not supported."),s}}}function J0(i,t,e,n){let s={},r=new WeakMap;function a(f){let h=f.target;h.index!==null&&t.remove(h.index);for(let g in h.attributes)t.remove(h.attributes[g]);h.removeEventListener("dispose",a),delete s[h.id];let d=r.get(h);d&&(t.remove(d),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,e.memory.geometries--}function o(f,h){return s[h.id]===!0||(h.addEventListener("dispose",a),s[h.id]=!0,e.memory.geometries++),h}function l(f){let h=f.attributes;for(let d in h)t.update(h[d],i.ARRAY_BUFFER)}function c(f){let h=[],d=f.index,g=f.attributes.position,v=0;if(g===void 0)return;if(d!==null){let S=d.array;v=d.version;for(let b=0,y=S.length;b<y;b+=3){let A=S[b+0],w=S[b+1],T=S[b+2];h.push(A,w,w,T,T,A)}}else{let S=g.array;v=g.version;for(let b=0,y=S.length/3-1;b<y;b+=3){let A=b+0,w=b+1,T=b+2;h.push(A,w,w,T,T,A)}}let m=new(g.count>=65535?or:ar)(h,1);m.version=v;let p=r.get(f);p&&t.remove(p),r.set(f,m)}function u(f){let h=r.get(f);if(h){let d=f.index;d!==null&&h.version<d.version&&c(f)}else c(f);return r.get(f)}return{get:o,update:l,getWireframeAttribute:u}}function K0(i,t,e){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,h){i.drawElements(n,h,r,f*a),e.update(h,n,1)}function c(f,h,d){d!==0&&(i.drawElementsInstanced(n,h,r,f*a,d),e.update(h,n,d))}function u(f,h,d){if(d===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,f,0,d);let v=0;for(let m=0;m<d;m++)v+=h[m];e.update(v,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function Q0(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:Yt("WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function j0(i,t,e){let n=new WeakMap,s=new Ee;function r(a,o,l){let c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=u!==void 0?u.length:0,h=n.get(o);if(h===void 0||h.count!==f){let M=function(){T.dispose(),n.delete(o),o.removeEventListener("dispose",M)};h!==void 0&&h.texture.dispose();let d=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,v=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],S=o.morphAttributes.color||[],b=0;d===!0&&(b=1),g===!0&&(b=2),v===!0&&(b=3);let y=o.attributes.position.count*b,A=1;y>t.maxTextureSize&&(A=Math.ceil(y/t.maxTextureSize),y=t.maxTextureSize);let w=new Float32Array(y*A*4*f),T=new nr(w,y,A,f);T.type=wn,T.needsUpdate=!0;let x=b*4;for(let R=0;R<f;R++){let I=m[R],P=p[R],F=S[R],B=y*A*4*R;for(let D=0;D<I.count;D++){let z=D*x;d===!0&&(s.fromBufferAttribute(I,D),w[B+z+0]=s.x,w[B+z+1]=s.y,w[B+z+2]=s.z,w[B+z+3]=0),g===!0&&(s.fromBufferAttribute(P,D),w[B+z+4]=s.x,w[B+z+5]=s.y,w[B+z+6]=s.z,w[B+z+7]=0),v===!0&&(s.fromBufferAttribute(F,D),w[B+z+8]=s.x,w[B+z+9]=s.y,w[B+z+10]=s.z,w[B+z+11]=F.itemSize===4?s.w:1)}}h={count:f,texture:T,size:new ht(y,A)},n.set(o,h),o.addEventListener("dispose",M)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let d=0;for(let v=0;v<c.length;v++)d+=c[v];let g=o.morphTargetsRelative?1:1-d;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function tg(i,t,e,n,s){let r=new WeakMap;function a(c){let u=s.render.frame,f=c.geometry,h=t.get(c,f);if(r.get(h)!==u&&(t.update(h),r.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(e.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){let d=c.skeleton;r.get(d)!==u&&(d.update(),r.set(d,u))}return h}function o(){r=new WeakMap}function l(c){let u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),e.remove(u.instanceMatrix),u.instanceColor!==null&&e.remove(u.instanceColor)}return{update:a,dispose:o}}var eg={[pc]:"LINEAR_TONE_MAPPING",[mc]:"REINHARD_TONE_MAPPING",[gc]:"CINEON_TONE_MAPPING",[Cr]:"ACES_FILMIC_TONE_MAPPING",[_c]:"AGX_TONE_MAPPING",[yc]:"NEUTRAL_TONE_MAPPING",[xc]:"CUSTOM_TONE_MAPPING"};function ng(i,t,e,n,s,r){let a=new gn(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,depthTexture:s?new si(t,e):void 0}),o=new gn(t,e,{type:Xn,depthBuffer:!1,stencilBuffer:!1}),l=new Be;l.setAttribute("position",new ce([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new ce([0,2,0,0,2,0],2));let c=new Ya({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),u=new Ct(l,c),f=new Ai(-1,1,1,-1,0,1),h=null,d=null,g=!1,v,m=null,p=[],S=!1;this.setSize=function(b,y){a.setSize(b,y),o.setSize(b,y);for(let A=0;A<p.length;A++){let w=p[A];w.setSize&&w.setSize(b,y)}},this.setEffects=function(b){p=b,S=p.length>0&&p[0].isRenderPass===!0;let y=a.width,A=a.height;for(let w=0;w<p.length;w++){let T=p[w];T.setSize&&T.setSize(y,A)}},this.begin=function(b,y){if(g||b.toneMapping===Pn&&p.length===0)return!1;if(m=y,y!==null){let A=y.width,w=y.height;(a.width!==A||a.height!==w)&&this.setSize(A,w)}return S===!1&&b.setRenderTarget(a),v=b.toneMapping,b.toneMapping=Pn,!0},this.hasRenderPass=function(){return S},this.end=function(b,y){b.toneMapping=v,g=!0;let A=a,w=o;for(let T=0;T<p.length;T++){let x=p[T];if(x.enabled!==!1&&(x.render(b,w,A,y),x.needsSwap!==!1)){let M=A;A=w,w=M}}if(h!==b.outputColorSpace||d!==b.toneMapping){h=b.outputColorSpace,d=b.toneMapping,c.defines={},oe.getTransfer(h)===de&&(c.defines.SRGB_TRANSFER="");let T=eg[d];T&&(c.defines[T]=""),c.needsUpdate=!0}c.uniforms.tDiffuse.value=A.texture,b.setRenderTarget(m),b.render(u,f),m=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),o.dispose(),l.dispose(),c.dispose()}}var id=new sn,Hc=new si(1,1),sd=new nr,rd=new Oa,ad=new hr,Bu=[],zu=[],Hu=new Float32Array(16),Gu=new Float32Array(9),ku=new Float32Array(4);function Fs(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=Bu[s];if(r===void 0&&(r=new Float32Array(s),Bu[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function Ge(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function ke(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function rl(i,t){let e=zu[t];e===void 0&&(e=new Int32Array(t),zu[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function ig(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function sg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ge(e,t))return;i.uniform2fv(this.addr,t),ke(e,t)}}function rg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ge(e,t))return;i.uniform3fv(this.addr,t),ke(e,t)}}function ag(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ge(e,t))return;i.uniform4fv(this.addr,t),ke(e,t)}}function og(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ge(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),ke(e,t)}else{if(Ge(e,n))return;ku.set(n),i.uniformMatrix2fv(this.addr,!1,ku),ke(e,n)}}function lg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ge(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),ke(e,t)}else{if(Ge(e,n))return;Gu.set(n),i.uniformMatrix3fv(this.addr,!1,Gu),ke(e,n)}}function cg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ge(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),ke(e,t)}else{if(Ge(e,n))return;Hu.set(n),i.uniformMatrix4fv(this.addr,!1,Hu),ke(e,n)}}function hg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function ug(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ge(e,t))return;i.uniform2iv(this.addr,t),ke(e,t)}}function dg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ge(e,t))return;i.uniform3iv(this.addr,t),ke(e,t)}}function fg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ge(e,t))return;i.uniform4iv(this.addr,t),ke(e,t)}}function pg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function mg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ge(e,t))return;i.uniform2uiv(this.addr,t),ke(e,t)}}function gg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ge(e,t))return;i.uniform3uiv(this.addr,t),ke(e,t)}}function xg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ge(e,t))return;i.uniform4uiv(this.addr,t),ke(e,t)}}function _g(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Hc.compareFunction=e.isReversedDepthBuffer()?Qo:Ko,r=Hc):r=id,e.setTexture2D(t||r,s)}function yg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||rd,s)}function vg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||ad,s)}function Mg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||sd,s)}function Sg(i){switch(i){case 5126:return ig;case 35664:return sg;case 35665:return rg;case 35666:return ag;case 35674:return og;case 35675:return lg;case 35676:return cg;case 5124:case 35670:return hg;case 35667:case 35671:return ug;case 35668:case 35672:return dg;case 35669:case 35673:return fg;case 5125:return pg;case 36294:return mg;case 36295:return gg;case 36296:return xg;case 35678:case 36198:case 36298:case 36306:case 35682:return _g;case 35679:case 36299:case 36307:return yg;case 35680:case 36300:case 36308:case 36293:return vg;case 36289:case 36303:case 36311:case 36292:return Mg}}function bg(i,t){i.uniform1fv(this.addr,t)}function Eg(i,t){let e=Fs(t,this.size,2);i.uniform2fv(this.addr,e)}function wg(i,t){let e=Fs(t,this.size,3);i.uniform3fv(this.addr,e)}function Tg(i,t){let e=Fs(t,this.size,4);i.uniform4fv(this.addr,e)}function Ag(i,t){let e=Fs(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function Rg(i,t){let e=Fs(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function Cg(i,t){let e=Fs(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function Ig(i,t){i.uniform1iv(this.addr,t)}function Pg(i,t){i.uniform2iv(this.addr,t)}function Lg(i,t){i.uniform3iv(this.addr,t)}function Dg(i,t){i.uniform4iv(this.addr,t)}function Ug(i,t){i.uniform1uiv(this.addr,t)}function Ng(i,t){i.uniform2uiv(this.addr,t)}function Fg(i,t){i.uniform3uiv(this.addr,t)}function Og(i,t){i.uniform4uiv(this.addr,t)}function Bg(i,t,e){let n=this.cache,s=t.length,r=rl(e,s);Ge(n,r)||(i.uniform1iv(this.addr,r),ke(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Hc:a=id;for(let o=0;o!==s;++o)e.setTexture2D(t[o]||a,r[o])}function zg(i,t,e){let n=this.cache,s=t.length,r=rl(e,s);Ge(n,r)||(i.uniform1iv(this.addr,r),ke(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||rd,r[a])}function Hg(i,t,e){let n=this.cache,s=t.length,r=rl(e,s);Ge(n,r)||(i.uniform1iv(this.addr,r),ke(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||ad,r[a])}function Gg(i,t,e){let n=this.cache,s=t.length,r=rl(e,s);Ge(n,r)||(i.uniform1iv(this.addr,r),ke(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||sd,r[a])}function kg(i){switch(i){case 5126:return bg;case 35664:return Eg;case 35665:return wg;case 35666:return Tg;case 35674:return Ag;case 35675:return Rg;case 35676:return Cg;case 5124:case 35670:return Ig;case 35667:case 35671:return Pg;case 35668:case 35672:return Lg;case 35669:case 35673:return Dg;case 5125:return Ug;case 36294:return Ng;case 36295:return Fg;case 36296:return Og;case 35678:case 36198:case 36298:case 36306:case 35682:return Bg;case 35679:case 36299:case 36307:return zg;case 35680:case 36300:case 36308:case 36293:return Hg;case 36289:case 36303:case 36311:case 36292:return Gg}}var Gc=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Sg(e.type)}},kc=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=kg(e.type)}},Vc=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(t,e[o.id],n)}}},Bc=/(\w+)(\])?(\[|\.)?/g;function Vu(i,t){i.seq.push(t),i.map[t.id]=t}function Vg(i,t,e){let n=i.name,s=n.length;for(Bc.lastIndex=0;;){let r=Bc.exec(n),a=Bc.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Vu(e,c===void 0?new Gc(o,i,t):new kc(o,i,t));break}else{let f=e.map[o];f===void 0&&(f=new Vc(o),Vu(e,f)),e=f}}}var Ns=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=t.getActiveUniform(e,a),l=t.getUniformLocation(e,o.name);Vg(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){let o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];a.id in e&&n.push(a)}return n}};function Wu(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var Wg=37297,Xg=0;function qg(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}var Xu=new Kt;function Yg(i){oe._getMatrix(Xu,oe.workingColorSpace,i);let t=`mat3( ${Xu.elements.map(e=>e.toFixed(4))} )`;switch(oe.getTransfer(i)){case tr:return[t,"LinearTransferOETF"];case de:return[t,"sRGBTransferOETF"];default:return Xt("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function qu(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+qg(i.getShaderSource(t),o)}else return r}function Zg(i,t){let e=Yg(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var $g={[pc]:"Linear",[mc]:"Reinhard",[gc]:"Cineon",[Cr]:"ACESFilmic",[_c]:"AgX",[yc]:"Neutral",[xc]:"Custom"};function Jg(i,t){let e=$g[t];return e===void 0?(Xt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var tl=new L;function Kg(){oe.getLuminanceCoefficients(tl);let i=tl.x.toFixed(4),t=tl.y.toFixed(4),e=tl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Qg(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Gr).join(`
`)}function jg(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function tx(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function Gr(i){return i!==""}function Yu(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Zu(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var ex=/^[ \t]*#include +<([\w\d./]+)>/gm;function Wc(i){return i.replace(ex,ix)}var nx=new Map;function ix(i,t){let e=ie[t];if(e===void 0){let n=nx.get(t);if(n!==void 0)e=ie[n],Xt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Wc(e)}var sx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function $u(i){return i.replace(sx,rx)}function rx(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Ju(i){let t=`precision ${i.precision} float;
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
#define LOW_PRECISION`),t}var ax={[Ar]:"SHADOWMAP_TYPE_PCF",[Is]:"SHADOWMAP_TYPE_VSM"};function ox(i){return ax[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var lx={[Ri]:"ENVMAP_TYPE_CUBE",[Ji]:"ENVMAP_TYPE_CUBE",[Ir]:"ENVMAP_TYPE_CUBE_UV"};function cx(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":lx[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var hx={[Ji]:"ENVMAP_MODE_REFRACTION"};function ux(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":hx[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var dx={[co]:"ENVMAP_BLENDING_MULTIPLY",[uu]:"ENVMAP_BLENDING_MIX",[du]:"ENVMAP_BLENDING_ADD"};function fx(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":dx[i.combine]||"ENVMAP_BLENDING_NONE"}function px(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function mx(i,t,e,n){let s=i.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,l=ox(e),c=cx(e),u=ux(e),f=fx(e),h=px(e),d=Qg(e),g=jg(r),v=s.createProgram(),m,p,S=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Gr).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Gr).join(`
`),p.length>0&&(p+=`
`)):(m=[Ju(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Gr).join(`
`),p=[Ju(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+u:"",e.envMap?"#define "+f:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Pn?"#define TONE_MAPPING":"",e.toneMapping!==Pn?ie.tonemapping_pars_fragment:"",e.toneMapping!==Pn?Jg("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",ie.colorspace_pars_fragment,Zg("linearToOutputTexel",e.outputColorSpace),Kg(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Gr).join(`
`)),a=Wc(a),a=Yu(a,e),a=Zu(a,e),o=Wc(o),o=Yu(o,e),o=Zu(o,e),a=$u(a),o=$u(o),e.isRawShaderMaterial!==!0&&(S=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",e.glslVersion===Ac?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Ac?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let b=S+m+a,y=S+p+o,A=Wu(s,s.VERTEX_SHADER,b),w=Wu(s,s.FRAGMENT_SHADER,y);s.attachShader(v,A),s.attachShader(v,w),e.index0AttributeName!==void 0?s.bindAttribLocation(v,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function T(I){if(i.debug.checkShaderErrors){let P=s.getProgramInfoLog(v)||"",F=s.getShaderInfoLog(A)||"",B=s.getShaderInfoLog(w)||"",D=P.trim(),z=F.trim(),N=B.trim(),X=!0,Y=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(X=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,A,w);else{let j=qu(s,A,"vertex"),tt=qu(s,w,"fragment");Yt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+D+`
`+j+`
`+tt)}else D!==""?Xt("WebGLProgram: Program Info Log:",D):(z===""||N==="")&&(Y=!1);Y&&(I.diagnostics={runnable:X,programLog:D,vertexShader:{log:z,prefix:m},fragmentShader:{log:N,prefix:p}})}s.deleteShader(A),s.deleteShader(w),x=new Ns(s,v),M=tx(s,v)}let x;this.getUniforms=function(){return x===void 0&&T(this),x};let M;this.getAttributes=function(){return M===void 0&&T(this),M};let R=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=s.getProgramParameter(v,Wg)),R},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Xg++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=A,this.fragmentShader=w,this}var gx=0,Xc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new qc(t),e.set(t,n)),n}},qc=class{constructor(t){this.id=gx++,this.code=t,this.usedTimes=0}};function xx(i){return i===Pi||i===Fr||i===Or}function _x(i,t,e,n,s,r){let a=new ir,o=new Xc,l=new Set,c=[],u=new Map,f=n.logarithmicDepthBuffer,h=n.precision,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(x){return l.add(x),x===0?"uv":`uv${x}`}function v(x,M,R,I,P,F){let B=I.fog,D=P.geometry,z=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?I.environment:null,N=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,X=t.get(x.envMap||z,N),Y=X&&X.mapping===Ir?X.image.height:null,j=d[x.type];x.precision!==null&&(h=n.getMaxPrecision(x.precision),h!==x.precision&&Xt("WebGLProgram.getParameters:",x.precision,"not supported, using",h,"instead."));let tt=D.morphAttributes.position||D.morphAttributes.normal||D.morphAttributes.color,st=tt!==void 0?tt.length:0,Tt=0;D.morphAttributes.position!==void 0&&(Tt=1),D.morphAttributes.normal!==void 0&&(Tt=2),D.morphAttributes.color!==void 0&&(Tt=3);let Zt,wt,J,ot;if(j){let Pt=Yn[j];Zt=Pt.vertexShader,wt=Pt.fragmentShader}else{Zt=x.vertexShader,wt=x.fragmentShader;let Pt=o.getVertexShaderStage(x),Re=o.getFragmentShaderStage(x);o.update(x,Pt,Re),J=Pt.id,ot=Re.id}let rt=i.getRenderTarget(),bt=i.state.buffers.depth.getReversed(),It=P.isInstancedMesh===!0,Vt=P.isBatchedMesh===!0,ue=!!x.map,Jt=!!x.matcap,et=!!X,at=!!x.aoMap,it=!!x.lightMap,yt=!!x.bumpMap&&x.wireframe===!1,gt=!!x.normalMap,Wt=!!x.displacementMap,Ft=!!x.emissiveMap,$t=!!x.metalnessMap,Qt=!!x.roughnessMap,U=x.anisotropy>0,fe=x.clearcoat>0,re=x.dispersion>0,C=x.iridescence>0,_=x.sheen>0,G=x.transmission>0,W=U&&!!x.anisotropyMap,Z=fe&&!!x.clearcoatMap,ct=fe&&!!x.clearcoatNormalMap,ut=fe&&!!x.clearcoatRoughnessMap,$=C&&!!x.iridescenceMap,Q=C&&!!x.iridescenceThicknessMap,ft=_&&!!x.sheenColorMap,Ot=_&&!!x.sheenRoughnessMap,xt=!!x.specularMap,pt=!!x.specularColorMap,kt=!!x.specularIntensityMap,qt=G&&!!x.transmissionMap,jt=G&&!!x.thicknessMap,O=!!x.gradientMap,dt=!!x.alphaMap,K=x.alphaTest>0,mt=!!x.alphaHash,St=!!x.extensions,nt=Pn;x.toneMapped&&(rt===null||rt.isXRRenderTarget===!0)&&(nt=i.toneMapping);let Nt={shaderID:j,shaderType:x.type,shaderName:x.name,vertexShader:Zt,fragmentShader:wt,defines:x.defines,customVertexShaderID:J,customFragmentShaderID:ot,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:h,batching:Vt,batchingColor:Vt&&P._colorsTexture!==null,instancing:It,instancingColor:It&&P.instanceColor!==null,instancingMorph:It&&P.morphTexture!==null,outputColorSpace:rt===null?i.outputColorSpace:rt.isXRRenderTarget===!0?rt.texture.colorSpace:oe.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:ue,matcap:Jt,envMap:et,envMapMode:et&&X.mapping,envMapCubeUVHeight:Y,aoMap:at,lightMap:it,bumpMap:yt,normalMap:gt,displacementMap:Wt,emissiveMap:Ft,normalMapObjectSpace:gt&&x.normalMapType===mu,normalMapTangentSpace:gt&&x.normalMapType===Br,packedNormalMap:gt&&x.normalMapType===Br&&xx(x.normalMap.format),metalnessMap:$t,roughnessMap:Qt,anisotropy:U,anisotropyMap:W,clearcoat:fe,clearcoatMap:Z,clearcoatNormalMap:ct,clearcoatRoughnessMap:ut,dispersion:re,iridescence:C,iridescenceMap:$,iridescenceThicknessMap:Q,sheen:_,sheenColorMap:ft,sheenRoughnessMap:Ot,specularMap:xt,specularColorMap:pt,specularIntensityMap:kt,transmission:G,transmissionMap:qt,thicknessMap:jt,gradientMap:O,opaque:x.transparent===!1&&x.blending===qi&&x.alphaToCoverage===!1,alphaMap:dt,alphaTest:K,alphaHash:mt,combine:x.combine,mapUv:ue&&g(x.map.channel),aoMapUv:at&&g(x.aoMap.channel),lightMapUv:it&&g(x.lightMap.channel),bumpMapUv:yt&&g(x.bumpMap.channel),normalMapUv:gt&&g(x.normalMap.channel),displacementMapUv:Wt&&g(x.displacementMap.channel),emissiveMapUv:Ft&&g(x.emissiveMap.channel),metalnessMapUv:$t&&g(x.metalnessMap.channel),roughnessMapUv:Qt&&g(x.roughnessMap.channel),anisotropyMapUv:W&&g(x.anisotropyMap.channel),clearcoatMapUv:Z&&g(x.clearcoatMap.channel),clearcoatNormalMapUv:ct&&g(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ut&&g(x.clearcoatRoughnessMap.channel),iridescenceMapUv:$&&g(x.iridescenceMap.channel),iridescenceThicknessMapUv:Q&&g(x.iridescenceThicknessMap.channel),sheenColorMapUv:ft&&g(x.sheenColorMap.channel),sheenRoughnessMapUv:Ot&&g(x.sheenRoughnessMap.channel),specularMapUv:xt&&g(x.specularMap.channel),specularColorMapUv:pt&&g(x.specularColorMap.channel),specularIntensityMapUv:kt&&g(x.specularIntensityMap.channel),transmissionMapUv:qt&&g(x.transmissionMap.channel),thicknessMapUv:jt&&g(x.thicknessMap.channel),alphaMapUv:dt&&g(x.alphaMap.channel),vertexTangents:!!D.attributes.tangent&&(gt||U),vertexNormals:!!D.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!D.attributes.color&&D.attributes.color.itemSize===4,pointsUvs:P.isPoints===!0&&!!D.attributes.uv&&(ue||dt),fog:!!B,useFog:x.fog===!0,fogExp2:!!B&&B.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||D.attributes.normal===void 0&&gt===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:bt,skinning:P.isSkinnedMesh===!0,hasPositionAttribute:D.attributes.position!==void 0,morphTargets:D.morphAttributes.position!==void 0,morphNormals:D.morphAttributes.normal!==void 0,morphColors:D.morphAttributes.color!==void 0,morphTargetsCount:st,morphTextureStride:Tt,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numLightProbeGrids:F.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&R.length>0,shadowMapType:i.shadowMap.type,toneMapping:nt,decodeVideoTexture:ue&&x.map.isVideoTexture===!0&&oe.getTransfer(x.map.colorSpace)===de,decodeVideoTextureEmissive:Ft&&x.emissiveMap.isVideoTexture===!0&&oe.getTransfer(x.emissiveMap.colorSpace)===de,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===He,flipSided:x.side===Ze,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:St&&x.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(St&&x.extensions.multiDraw===!0||Vt)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Nt.vertexUv1s=l.has(1),Nt.vertexUv2s=l.has(2),Nt.vertexUv3s=l.has(3),l.clear(),Nt}function m(x){let M=[];if(x.shaderID?M.push(x.shaderID):(M.push(x.customVertexShaderID),M.push(x.customFragmentShaderID)),x.defines!==void 0)for(let R in x.defines)M.push(R),M.push(x.defines[R]);return x.isRawShaderMaterial===!1&&(p(M,x),S(M,x),M.push(i.outputColorSpace)),M.push(x.customProgramCacheKey),M.join()}function p(x,M){x.push(M.precision),x.push(M.outputColorSpace),x.push(M.envMapMode),x.push(M.envMapCubeUVHeight),x.push(M.mapUv),x.push(M.alphaMapUv),x.push(M.lightMapUv),x.push(M.aoMapUv),x.push(M.bumpMapUv),x.push(M.normalMapUv),x.push(M.displacementMapUv),x.push(M.emissiveMapUv),x.push(M.metalnessMapUv),x.push(M.roughnessMapUv),x.push(M.anisotropyMapUv),x.push(M.clearcoatMapUv),x.push(M.clearcoatNormalMapUv),x.push(M.clearcoatRoughnessMapUv),x.push(M.iridescenceMapUv),x.push(M.iridescenceThicknessMapUv),x.push(M.sheenColorMapUv),x.push(M.sheenRoughnessMapUv),x.push(M.specularMapUv),x.push(M.specularColorMapUv),x.push(M.specularIntensityMapUv),x.push(M.transmissionMapUv),x.push(M.thicknessMapUv),x.push(M.combine),x.push(M.fogExp2),x.push(M.sizeAttenuation),x.push(M.morphTargetsCount),x.push(M.morphAttributeCount),x.push(M.numDirLights),x.push(M.numPointLights),x.push(M.numSpotLights),x.push(M.numSpotLightMaps),x.push(M.numHemiLights),x.push(M.numRectAreaLights),x.push(M.numDirLightShadows),x.push(M.numPointLightShadows),x.push(M.numSpotLightShadows),x.push(M.numSpotLightShadowsWithMaps),x.push(M.numLightProbes),x.push(M.shadowMapType),x.push(M.toneMapping),x.push(M.numClippingPlanes),x.push(M.numClipIntersection),x.push(M.depthPacking)}function S(x,M){a.disableAll(),M.instancing&&a.enable(0),M.instancingColor&&a.enable(1),M.instancingMorph&&a.enable(2),M.matcap&&a.enable(3),M.envMap&&a.enable(4),M.normalMapObjectSpace&&a.enable(5),M.normalMapTangentSpace&&a.enable(6),M.clearcoat&&a.enable(7),M.iridescence&&a.enable(8),M.alphaTest&&a.enable(9),M.vertexColors&&a.enable(10),M.vertexAlphas&&a.enable(11),M.vertexUv1s&&a.enable(12),M.vertexUv2s&&a.enable(13),M.vertexUv3s&&a.enable(14),M.vertexTangents&&a.enable(15),M.anisotropy&&a.enable(16),M.alphaHash&&a.enable(17),M.batching&&a.enable(18),M.dispersion&&a.enable(19),M.batchingColor&&a.enable(20),M.gradientMap&&a.enable(21),M.packedNormalMap&&a.enable(22),M.vertexNormals&&a.enable(23),x.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.reversedDepthBuffer&&a.enable(4),M.skinning&&a.enable(5),M.morphTargets&&a.enable(6),M.morphNormals&&a.enable(7),M.morphColors&&a.enable(8),M.premultipliedAlpha&&a.enable(9),M.shadowMapEnabled&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),M.decodeVideoTextureEmissive&&a.enable(20),M.alphaToCoverage&&a.enable(21),M.numLightProbeGrids>0&&a.enable(22),M.hasPositionAttribute&&a.enable(23),x.push(a.mask)}function b(x){let M=d[x.type],R;if(M){let I=Yn[M];R=Pu.clone(I.uniforms)}else R=x.uniforms;return R}function y(x,M){let R=u.get(M);return R!==void 0?++R.usedTimes:(R=new mx(i,M,x,s),c.push(R),u.set(M,R)),R}function A(x){if(--x.usedTimes===0){let M=c.indexOf(x);c[M]=c[c.length-1],c.pop(),u.delete(x.cacheKey),x.destroy()}}function w(x){o.remove(x)}function T(){o.dispose()}return{getParameters:v,getProgramCacheKey:m,getUniforms:b,acquireProgram:y,releaseProgram:A,releaseShaderCache:w,programs:c,dispose:T}}function yx(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function vx(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function Ku(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function Qu(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(h){let d=0;return h.isInstancedMesh&&(d+=2),h.isSkinnedMesh&&(d+=1),d}function o(h,d,g,v,m,p){let S=i[t];return S===void 0?(S={id:h.id,object:h,geometry:d,material:g,materialVariant:a(h),groupOrder:v,renderOrder:h.renderOrder,z:m,group:p},i[t]=S):(S.id=h.id,S.object=h,S.geometry=d,S.material=g,S.materialVariant=a(h),S.groupOrder=v,S.renderOrder=h.renderOrder,S.z=m,S.group=p),t++,S}function l(h,d,g,v,m,p){let S=o(h,d,g,v,m,p);g.transmission>0?n.push(S):g.transparent===!0?s.push(S):e.push(S)}function c(h,d,g,v,m,p){let S=o(h,d,g,v,m,p);g.transmission>0?n.unshift(S):g.transparent===!0?s.unshift(S):e.unshift(S)}function u(h,d,g){e.length>1&&e.sort(h||vx),n.length>1&&n.sort(d||Ku),s.length>1&&s.sort(d||Ku),g&&(e.reverse(),n.reverse(),s.reverse())}function f(){for(let h=t,d=i.length;h<d;h++){let g=i[h];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:f,sort:u}}function Mx(){let i=new WeakMap;function t(n,s){let r=i.get(n),a;return r===void 0?(a=new Qu,i.set(n,[a])):s>=r.length?(a=new Qu,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function Sx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new L,color:new Gt};break;case"SpotLight":e={position:new L,direction:new L,color:new Gt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new L,color:new Gt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new L,skyColor:new Gt,groundColor:new Gt};break;case"RectAreaLight":e={color:new Gt,position:new L,halfWidth:new L,halfHeight:new L};break}return i[t.id]=e,e}}}function bx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ht};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ht};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ht,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var Ex=0;function wx(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function Tx(i){let t=new Sx,e=bx(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new L);let s=new L,r=new ee,a=new ee;function o(c){let u=0,f=0,h=0;for(let M=0;M<9;M++)n.probe[M].set(0,0,0);let d=0,g=0,v=0,m=0,p=0,S=0,b=0,y=0,A=0,w=0,T=0;c.sort(wx);for(let M=0,R=c.length;M<R;M++){let I=c[M],P=I.color,F=I.intensity,B=I.distance,D=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===Pi?D=I.shadow.map.texture:D=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)u+=P.r*F,f+=P.g*F,h+=P.b*F;else if(I.isLightProbe){for(let z=0;z<9;z++)n.probe[z].addScaledVector(I.sh.coefficients[z],F);T++}else if(I.isDirectionalLight){let z=t.get(I);if(z.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let N=I.shadow,X=e.get(I);X.shadowIntensity=N.intensity,X.shadowBias=N.bias,X.shadowNormalBias=N.normalBias,X.shadowRadius=N.radius,X.shadowMapSize=N.mapSize,n.directionalShadow[d]=X,n.directionalShadowMap[d]=D,n.directionalShadowMatrix[d]=I.shadow.matrix,S++}n.directional[d]=z,d++}else if(I.isSpotLight){let z=t.get(I);z.position.setFromMatrixPosition(I.matrixWorld),z.color.copy(P).multiplyScalar(F),z.distance=B,z.coneCos=Math.cos(I.angle),z.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),z.decay=I.decay,n.spot[v]=z;let N=I.shadow;if(I.map&&(n.spotLightMap[A]=I.map,A++,N.updateMatrices(I),I.castShadow&&w++),n.spotLightMatrix[v]=N.matrix,I.castShadow){let X=e.get(I);X.shadowIntensity=N.intensity,X.shadowBias=N.bias,X.shadowNormalBias=N.normalBias,X.shadowRadius=N.radius,X.shadowMapSize=N.mapSize,n.spotShadow[v]=X,n.spotShadowMap[v]=D,y++}v++}else if(I.isRectAreaLight){let z=t.get(I);z.color.copy(P).multiplyScalar(F),z.halfWidth.set(I.width*.5,0,0),z.halfHeight.set(0,I.height*.5,0),n.rectArea[m]=z,m++}else if(I.isPointLight){let z=t.get(I);if(z.color.copy(I.color).multiplyScalar(I.intensity),z.distance=I.distance,z.decay=I.decay,I.castShadow){let N=I.shadow,X=e.get(I);X.shadowIntensity=N.intensity,X.shadowBias=N.bias,X.shadowNormalBias=N.normalBias,X.shadowRadius=N.radius,X.shadowMapSize=N.mapSize,X.shadowCameraNear=N.camera.near,X.shadowCameraFar=N.camera.far,n.pointShadow[g]=X,n.pointShadowMap[g]=D,n.pointShadowMatrix[g]=I.shadow.matrix,b++}n.point[g]=z,g++}else if(I.isHemisphereLight){let z=t.get(I);z.skyColor.copy(I.color).multiplyScalar(F),z.groundColor.copy(I.groundColor).multiplyScalar(F),n.hemi[p]=z,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=_t.LTC_FLOAT_1,n.rectAreaLTC2=_t.LTC_FLOAT_2):(n.rectAreaLTC1=_t.LTC_HALF_1,n.rectAreaLTC2=_t.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=f,n.ambient[2]=h;let x=n.hash;(x.directionalLength!==d||x.pointLength!==g||x.spotLength!==v||x.rectAreaLength!==m||x.hemiLength!==p||x.numDirectionalShadows!==S||x.numPointShadows!==b||x.numSpotShadows!==y||x.numSpotMaps!==A||x.numLightProbes!==T)&&(n.directional.length=d,n.spot.length=v,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=S,n.directionalShadowMap.length=S,n.pointShadow.length=b,n.pointShadowMap.length=b,n.spotShadow.length=y,n.spotShadowMap.length=y,n.directionalShadowMatrix.length=S,n.pointShadowMatrix.length=b,n.spotLightMatrix.length=y+A-w,n.spotLightMap.length=A,n.numSpotLightShadowsWithMaps=w,n.numLightProbes=T,x.directionalLength=d,x.pointLength=g,x.spotLength=v,x.rectAreaLength=m,x.hemiLength=p,x.numDirectionalShadows=S,x.numPointShadows=b,x.numSpotShadows=y,x.numSpotMaps=A,x.numLightProbes=T,n.version=Ex++)}function l(c,u){let f=0,h=0,d=0,g=0,v=0,m=u.matrixWorldInverse;for(let p=0,S=c.length;p<S;p++){let b=c[p];if(b.isDirectionalLight){let y=n.directional[f];y.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),f++}else if(b.isSpotLight){let y=n.spot[d];y.position.setFromMatrixPosition(b.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),d++}else if(b.isRectAreaLight){let y=n.rectArea[g];y.position.setFromMatrixPosition(b.matrixWorld),y.position.applyMatrix4(m),a.identity(),r.copy(b.matrixWorld),r.premultiply(m),a.extractRotation(r),y.halfWidth.set(b.width*.5,0,0),y.halfHeight.set(0,b.height*.5,0),y.halfWidth.applyMatrix4(a),y.halfHeight.applyMatrix4(a),g++}else if(b.isPointLight){let y=n.point[h];y.position.setFromMatrixPosition(b.matrixWorld),y.position.applyMatrix4(m),h++}else if(b.isHemisphereLight){let y=n.hemi[v];y.direction.setFromMatrixPosition(b.matrixWorld),y.direction.transformDirection(m),v++}}}return{setup:o,setupView:l,state:n}}function ju(i){let t=new Tx(i),e=[],n=[],s=[];function r(h){f.camera=h,e.length=0,n.length=0,s.length=0}function a(h){e.push(h)}function o(h){n.push(h)}function l(h){s.push(h)}function c(){t.setup(e)}function u(h){t.setupView(e,h)}let f={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:f,setupLights:c,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function Ax(i){let t=new WeakMap;function e(s,r=0){let a=t.get(s),o;return a===void 0?(o=new ju(i),t.set(s,[o])):r>=a.length?(o=new ju(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}var Rx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Cx=`uniform sampler2D shadow_pass;
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
}`,Ix=[new L(1,0,0),new L(-1,0,0),new L(0,1,0),new L(0,-1,0),new L(0,0,1),new L(0,0,-1)],Px=[new L(0,-1,0),new L(0,-1,0),new L(0,0,1),new L(0,0,-1),new L(0,-1,0),new L(0,-1,0)],td=new ee,Hr=new L,zc=new L;function Lx(i,t,e){let n=new Ts,s=new ht,r=new ht,a=new Ee,o=new Za,l=new $a,c={},u=e.maxTextureSize,f={[ni]:Ze,[Ze]:ni,[He]:He},h=new rn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ht},radius:{value:4}},vertexShader:Rx,fragmentShader:Cx}),d=h.clone();d.defines.HORIZONTAL_PASS=1;let g=new Be;g.setAttribute("position",new cn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new Ct(g,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ar;let p=this.type;this.render=function(w,T,x){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||w.length===0)return;this.type===lo&&(Xt("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Ar);let M=i.getRenderTarget(),R=i.getActiveCubeFace(),I=i.getActiveMipmapLevel(),P=i.state;P.setBlending(Wn),P.buffers.depth.getReversed()===!0?P.buffers.color.setClear(0,0,0,0):P.buffers.color.setClear(1,1,1,1),P.buffers.depth.setTest(!0),P.setScissorTest(!1);let F=p!==this.type;F&&T.traverse(function(B){B.material&&(Array.isArray(B.material)?B.material.forEach(D=>D.needsUpdate=!0):B.material.needsUpdate=!0)});for(let B=0,D=w.length;B<D;B++){let z=w[B],N=z.shadow;if(N===void 0){Xt("WebGLShadowMap:",z,"has no shadow.");continue}if(N.autoUpdate===!1&&N.needsUpdate===!1)continue;s.copy(N.mapSize);let X=N.getFrameExtents();s.multiply(X),r.copy(N.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/X.x),s.x=r.x*X.x,N.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/X.y),s.y=r.y*X.y,N.mapSize.y=r.y));let Y=i.state.buffers.depth.getReversed();if(N.camera._reversedDepth=Y,N.map===null||F===!0){if(N.map!==null&&(N.map.depthTexture!==null&&(N.map.depthTexture.dispose(),N.map.depthTexture=null),N.map.dispose()),this.type===Is){if(z.isPointLight){Xt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}N.map=new gn(s.x,s.y,{format:Pi,type:Xn,minFilter:Ye,magFilter:Ye,generateMipmaps:!1}),N.map.texture.name=z.name+".shadowMap",N.map.depthTexture=new si(s.x,s.y,wn),N.map.depthTexture.name=z.name+".shadowMapDepth",N.map.depthTexture.format=Gn,N.map.depthTexture.compareFunction=null,N.map.depthTexture.minFilter=We,N.map.depthTexture.magFilter=We}else z.isPointLight?(N.map=new nl(s.x),N.map.depthTexture=new za(s.x,Ln)):(N.map=new gn(s.x,s.y),N.map.depthTexture=new si(s.x,s.y,Ln)),N.map.depthTexture.name=z.name+".shadowMap",N.map.depthTexture.format=Gn,this.type===Ar?(N.map.depthTexture.compareFunction=Y?Qo:Ko,N.map.depthTexture.minFilter=Ye,N.map.depthTexture.magFilter=Ye):(N.map.depthTexture.compareFunction=null,N.map.depthTexture.minFilter=We,N.map.depthTexture.magFilter=We);N.camera.updateProjectionMatrix()}let j=N.map.isWebGLCubeRenderTarget?6:1;for(let tt=0;tt<j;tt++){if(N.map.isWebGLCubeRenderTarget)i.setRenderTarget(N.map,tt),i.clear();else{tt===0&&(i.setRenderTarget(N.map),i.clear());let st=N.getViewport(tt);a.set(r.x*st.x,r.y*st.y,r.x*st.z,r.y*st.w),P.viewport(a)}if(z.isPointLight){let st=N.camera,Tt=N.matrix,Zt=z.distance||st.far;Zt!==st.far&&(st.far=Zt,st.updateProjectionMatrix()),Hr.setFromMatrixPosition(z.matrixWorld),st.position.copy(Hr),zc.copy(st.position),zc.add(Ix[tt]),st.up.copy(Px[tt]),st.lookAt(zc),st.updateMatrixWorld(),Tt.makeTranslation(-Hr.x,-Hr.y,-Hr.z),td.multiplyMatrices(st.projectionMatrix,st.matrixWorldInverse),N._frustum.setFromProjectionMatrix(td,st.coordinateSystem,st.reversedDepth)}else N.updateMatrices(z);n=N.getFrustum(),y(T,x,N.camera,z,this.type)}N.isPointLightShadow!==!0&&this.type===Is&&S(N,x),N.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(M,R,I)};function S(w,T){let x=t.update(v);h.defines.VSM_SAMPLES!==w.blurSamples&&(h.defines.VSM_SAMPLES=w.blurSamples,d.defines.VSM_SAMPLES=w.blurSamples,h.needsUpdate=!0,d.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new gn(s.x,s.y,{format:Pi,type:Xn})),h.uniforms.shadow_pass.value=w.map.depthTexture,h.uniforms.resolution.value=w.mapSize,h.uniforms.radius.value=w.radius,i.setRenderTarget(w.mapPass),i.clear(),i.renderBufferDirect(T,null,x,h,v,null),d.uniforms.shadow_pass.value=w.mapPass.texture,d.uniforms.resolution.value=w.mapSize,d.uniforms.radius.value=w.radius,i.setRenderTarget(w.map),i.clear(),i.renderBufferDirect(T,null,x,d,v,null)}function b(w,T,x,M){let R=null,I=x.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(I!==void 0)R=I;else if(R=x.isPointLight===!0?l:o,i.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0||T.alphaToCoverage===!0){let P=R.uuid,F=T.uuid,B=c[P];B===void 0&&(B={},c[P]=B);let D=B[F];D===void 0&&(D=R.clone(),B[F]=D,T.addEventListener("dispose",A)),R=D}if(R.visible=T.visible,R.wireframe=T.wireframe,M===Is?R.side=T.shadowSide!==null?T.shadowSide:T.side:R.side=T.shadowSide!==null?T.shadowSide:f[T.side],R.alphaMap=T.alphaMap,R.alphaTest=T.alphaToCoverage===!0?.5:T.alphaTest,R.map=T.map,R.clipShadows=T.clipShadows,R.clippingPlanes=T.clippingPlanes,R.clipIntersection=T.clipIntersection,R.displacementMap=T.displacementMap,R.displacementScale=T.displacementScale,R.displacementBias=T.displacementBias,R.wireframeLinewidth=T.wireframeLinewidth,R.linewidth=T.linewidth,x.isPointLight===!0&&R.isMeshDistanceMaterial===!0){let P=i.properties.get(R);P.light=x}return R}function y(w,T,x,M,R){if(w.visible===!1)return;if(w.layers.test(T.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&R===Is)&&(!w.frustumCulled||n.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,w.matrixWorld);let F=t.update(w),B=w.material;if(Array.isArray(B)){let D=F.groups;for(let z=0,N=D.length;z<N;z++){let X=D[z],Y=B[X.materialIndex];if(Y&&Y.visible){let j=b(w,Y,M,R);w.onBeforeShadow(i,w,T,x,F,j,X),i.renderBufferDirect(x,null,F,j,w,X),w.onAfterShadow(i,w,T,x,F,j,X)}}}else if(B.visible){let D=b(w,B,M,R);w.onBeforeShadow(i,w,T,x,F,D,null),i.renderBufferDirect(x,null,F,D,w,null),w.onAfterShadow(i,w,T,x,F,D,null)}}let P=w.children;for(let F=0,B=P.length;F<B;F++)y(P[F],T,x,M,R)}function A(w){w.target.removeEventListener("dispose",A);for(let x in c){let M=c[x],R=w.target.uuid;R in M&&(M[R].dispose(),delete M[R])}}}function Dx(i,t){function e(){let O=!1,dt=new Ee,K=null,mt=new Ee(0,0,0,0);return{setMask:function(St){K!==St&&!O&&(i.colorMask(St,St,St,St),K=St)},setLocked:function(St){O=St},setClear:function(St,nt,Nt,Pt,Re){Re===!0&&(St*=Pt,nt*=Pt,Nt*=Pt),dt.set(St,nt,Nt,Pt),mt.equals(dt)===!1&&(i.clearColor(St,nt,Nt,Pt),mt.copy(dt))},reset:function(){O=!1,K=null,mt.set(-1,0,0,0)}}}function n(){let O=!1,dt=!1,K=null,mt=null,St=null;return{setReversed:function(nt){if(dt!==nt){let Nt=t.get("EXT_clip_control");nt?Nt.clipControlEXT(Nt.LOWER_LEFT_EXT,Nt.ZERO_TO_ONE_EXT):Nt.clipControlEXT(Nt.LOWER_LEFT_EXT,Nt.NEGATIVE_ONE_TO_ONE_EXT),dt=nt;let Pt=St;St=null,this.setClear(Pt)}},getReversed:function(){return dt},setTest:function(nt){nt?rt(i.DEPTH_TEST):bt(i.DEPTH_TEST)},setMask:function(nt){K!==nt&&!O&&(i.depthMask(nt),K=nt)},setFunc:function(nt){if(dt&&(nt=wu[nt]),mt!==nt){switch(nt){case wa:i.depthFunc(i.NEVER);break;case Ta:i.depthFunc(i.ALWAYS);break;case Aa:i.depthFunc(i.LESS);break;case Yi:i.depthFunc(i.LEQUAL);break;case Ra:i.depthFunc(i.EQUAL);break;case Ca:i.depthFunc(i.GEQUAL);break;case Ia:i.depthFunc(i.GREATER);break;case Pa:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}mt=nt}},setLocked:function(nt){O=nt},setClear:function(nt){St!==nt&&(St=nt,dt&&(nt=1-nt),i.clearDepth(nt))},reset:function(){O=!1,K=null,mt=null,St=null,dt=!1}}}function s(){let O=!1,dt=null,K=null,mt=null,St=null,nt=null,Nt=null,Pt=null,Re=null;return{setTest:function(_e){O||(_e?rt(i.STENCIL_TEST):bt(i.STENCIL_TEST))},setMask:function(_e){dt!==_e&&!O&&(i.stencilMask(_e),dt=_e)},setFunc:function(_e,Nn,Fn){(K!==_e||mt!==Nn||St!==Fn)&&(i.stencilFunc(_e,Nn,Fn),K=_e,mt=Nn,St=Fn)},setOp:function(_e,Nn,Fn){(nt!==_e||Nt!==Nn||Pt!==Fn)&&(i.stencilOp(_e,Nn,Fn),nt=_e,Nt=Nn,Pt=Fn)},setLocked:function(_e){O=_e},setClear:function(_e){Re!==_e&&(i.clearStencil(_e),Re=_e)},reset:function(){O=!1,dt=null,K=null,mt=null,St=null,nt=null,Nt=null,Pt=null,Re=null}}}let r=new e,a=new n,o=new s,l=new WeakMap,c=new WeakMap,u={},f={},h={},d=new WeakMap,g=[],v=null,m=!1,p=null,S=null,b=null,y=null,A=null,w=null,T=null,x=new Gt(0,0,0),M=0,R=!1,I=null,P=null,F=null,B=null,D=null,z=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),N=!1,X=0,Y=i.getParameter(i.VERSION);Y.indexOf("WebGL")!==-1?(X=parseFloat(/^WebGL (\d)/.exec(Y)[1]),N=X>=1):Y.indexOf("OpenGL ES")!==-1&&(X=parseFloat(/^OpenGL ES (\d)/.exec(Y)[1]),N=X>=2);let j=null,tt={},st=i.getParameter(i.SCISSOR_BOX),Tt=i.getParameter(i.VIEWPORT),Zt=new Ee().fromArray(st),wt=new Ee().fromArray(Tt);function J(O,dt,K,mt){let St=new Uint8Array(4),nt=i.createTexture();i.bindTexture(O,nt),i.texParameteri(O,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(O,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Nt=0;Nt<K;Nt++)O===i.TEXTURE_3D||O===i.TEXTURE_2D_ARRAY?i.texImage3D(dt,0,i.RGBA,1,1,mt,0,i.RGBA,i.UNSIGNED_BYTE,St):i.texImage2D(dt+Nt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,St);return nt}let ot={};ot[i.TEXTURE_2D]=J(i.TEXTURE_2D,i.TEXTURE_2D,1),ot[i.TEXTURE_CUBE_MAP]=J(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),ot[i.TEXTURE_2D_ARRAY]=J(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),ot[i.TEXTURE_3D]=J(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),rt(i.DEPTH_TEST),a.setFunc(Yi),yt(!1),gt(uc),rt(i.CULL_FACE),at(Wn);function rt(O){u[O]!==!0&&(i.enable(O),u[O]=!0)}function bt(O){u[O]!==!1&&(i.disable(O),u[O]=!1)}function It(O,dt){return h[O]!==dt?(i.bindFramebuffer(O,dt),h[O]=dt,O===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=dt),O===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=dt),!0):!1}function Vt(O,dt){let K=g,mt=!1;if(O){K=d.get(dt),K===void 0&&(K=[],d.set(dt,K));let St=O.textures;if(K.length!==St.length||K[0]!==i.COLOR_ATTACHMENT0){for(let nt=0,Nt=St.length;nt<Nt;nt++)K[nt]=i.COLOR_ATTACHMENT0+nt;K.length=St.length,mt=!0}}else K[0]!==i.BACK&&(K[0]=i.BACK,mt=!0);mt&&i.drawBuffers(K)}function ue(O){return v!==O?(i.useProgram(O),v=O,!0):!1}let Jt={[Mi]:i.FUNC_ADD,[Zh]:i.FUNC_SUBTRACT,[$h]:i.FUNC_REVERSE_SUBTRACT};Jt[Jh]=i.MIN,Jt[Kh]=i.MAX;let et={[Qh]:i.ZERO,[jh]:i.ONE,[tu]:i.SRC_COLOR,[ba]:i.SRC_ALPHA,[au]:i.SRC_ALPHA_SATURATE,[su]:i.DST_COLOR,[nu]:i.DST_ALPHA,[eu]:i.ONE_MINUS_SRC_COLOR,[Ea]:i.ONE_MINUS_SRC_ALPHA,[ru]:i.ONE_MINUS_DST_COLOR,[iu]:i.ONE_MINUS_DST_ALPHA,[ou]:i.CONSTANT_COLOR,[lu]:i.ONE_MINUS_CONSTANT_COLOR,[cu]:i.CONSTANT_ALPHA,[hu]:i.ONE_MINUS_CONSTANT_ALPHA};function at(O,dt,K,mt,St,nt,Nt,Pt,Re,_e){if(O===Wn){m===!0&&(bt(i.BLEND),m=!1);return}if(m===!1&&(rt(i.BLEND),m=!0),O!==Yh){if(O!==p||_e!==R){if((S!==Mi||A!==Mi)&&(i.blendEquation(i.FUNC_ADD),S=Mi,A=Mi),_e)switch(O){case qi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case dc:i.blendFunc(i.ONE,i.ONE);break;case fc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Rr:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Yt("WebGLState: Invalid blending: ",O);break}else switch(O){case qi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case dc:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case fc:Yt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Rr:Yt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Yt("WebGLState: Invalid blending: ",O);break}b=null,y=null,w=null,T=null,x.set(0,0,0),M=0,p=O,R=_e}return}St=St||dt,nt=nt||K,Nt=Nt||mt,(dt!==S||St!==A)&&(i.blendEquationSeparate(Jt[dt],Jt[St]),S=dt,A=St),(K!==b||mt!==y||nt!==w||Nt!==T)&&(i.blendFuncSeparate(et[K],et[mt],et[nt],et[Nt]),b=K,y=mt,w=nt,T=Nt),(Pt.equals(x)===!1||Re!==M)&&(i.blendColor(Pt.r,Pt.g,Pt.b,Re),x.copy(Pt),M=Re),p=O,R=!1}function it(O,dt){O.side===He?bt(i.CULL_FACE):rt(i.CULL_FACE);let K=O.side===Ze;dt&&(K=!K),yt(K),O.blending===qi&&O.transparent===!1?at(Wn):at(O.blending,O.blendEquation,O.blendSrc,O.blendDst,O.blendEquationAlpha,O.blendSrcAlpha,O.blendDstAlpha,O.blendColor,O.blendAlpha,O.premultipliedAlpha),a.setFunc(O.depthFunc),a.setTest(O.depthTest),a.setMask(O.depthWrite),r.setMask(O.colorWrite);let mt=O.stencilWrite;o.setTest(mt),mt&&(o.setMask(O.stencilWriteMask),o.setFunc(O.stencilFunc,O.stencilRef,O.stencilFuncMask),o.setOp(O.stencilFail,O.stencilZFail,O.stencilZPass)),Ft(O.polygonOffset,O.polygonOffsetFactor,O.polygonOffsetUnits),O.alphaToCoverage===!0?rt(i.SAMPLE_ALPHA_TO_COVERAGE):bt(i.SAMPLE_ALPHA_TO_COVERAGE)}function yt(O){I!==O&&(O?i.frontFace(i.CW):i.frontFace(i.CCW),I=O)}function gt(O){O!==Xh?(rt(i.CULL_FACE),O!==P&&(O===uc?i.cullFace(i.BACK):O===qh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):bt(i.CULL_FACE),P=O}function Wt(O){O!==F&&(N&&i.lineWidth(O),F=O)}function Ft(O,dt,K){O?(rt(i.POLYGON_OFFSET_FILL),(B!==dt||D!==K)&&(B=dt,D=K,a.getReversed()&&(dt=-dt),i.polygonOffset(dt,K))):bt(i.POLYGON_OFFSET_FILL)}function $t(O){O?rt(i.SCISSOR_TEST):bt(i.SCISSOR_TEST)}function Qt(O){O===void 0&&(O=i.TEXTURE0+z-1),j!==O&&(i.activeTexture(O),j=O)}function U(O,dt,K){K===void 0&&(j===null?K=i.TEXTURE0+z-1:K=j);let mt=tt[K];mt===void 0&&(mt={type:void 0,texture:void 0},tt[K]=mt),(mt.type!==O||mt.texture!==dt)&&(j!==K&&(i.activeTexture(K),j=K),i.bindTexture(O,dt||ot[O]),mt.type=O,mt.texture=dt)}function fe(){let O=tt[j];O!==void 0&&O.type!==void 0&&(i.bindTexture(O.type,null),O.type=void 0,O.texture=void 0)}function re(){try{i.compressedTexImage2D(...arguments)}catch(O){Yt("WebGLState:",O)}}function C(){try{i.compressedTexImage3D(...arguments)}catch(O){Yt("WebGLState:",O)}}function _(){try{i.texSubImage2D(...arguments)}catch(O){Yt("WebGLState:",O)}}function G(){try{i.texSubImage3D(...arguments)}catch(O){Yt("WebGLState:",O)}}function W(){try{i.compressedTexSubImage2D(...arguments)}catch(O){Yt("WebGLState:",O)}}function Z(){try{i.compressedTexSubImage3D(...arguments)}catch(O){Yt("WebGLState:",O)}}function ct(){try{i.texStorage2D(...arguments)}catch(O){Yt("WebGLState:",O)}}function ut(){try{i.texStorage3D(...arguments)}catch(O){Yt("WebGLState:",O)}}function $(){try{i.texImage2D(...arguments)}catch(O){Yt("WebGLState:",O)}}function Q(){try{i.texImage3D(...arguments)}catch(O){Yt("WebGLState:",O)}}function ft(O){return f[O]!==void 0?f[O]:i.getParameter(O)}function Ot(O,dt){f[O]!==dt&&(i.pixelStorei(O,dt),f[O]=dt)}function xt(O){Zt.equals(O)===!1&&(i.scissor(O.x,O.y,O.z,O.w),Zt.copy(O))}function pt(O){wt.equals(O)===!1&&(i.viewport(O.x,O.y,O.z,O.w),wt.copy(O))}function kt(O,dt){let K=c.get(dt);K===void 0&&(K=new WeakMap,c.set(dt,K));let mt=K.get(O);mt===void 0&&(mt=i.getUniformBlockIndex(dt,O.name),K.set(O,mt))}function qt(O,dt){let mt=c.get(dt).get(O);l.get(dt)!==mt&&(i.uniformBlockBinding(dt,mt,O.__bindingPointIndex),l.set(dt,mt))}function jt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},f={},j=null,tt={},h={},d=new WeakMap,g=[],v=null,m=!1,p=null,S=null,b=null,y=null,A=null,w=null,T=null,x=new Gt(0,0,0),M=0,R=!1,I=null,P=null,F=null,B=null,D=null,Zt.set(0,0,i.canvas.width,i.canvas.height),wt.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:rt,disable:bt,bindFramebuffer:It,drawBuffers:Vt,useProgram:ue,setBlending:at,setMaterial:it,setFlipSided:yt,setCullFace:gt,setLineWidth:Wt,setPolygonOffset:Ft,setScissorTest:$t,activeTexture:Qt,bindTexture:U,unbindTexture:fe,compressedTexImage2D:re,compressedTexImage3D:C,texImage2D:$,texImage3D:Q,pixelStorei:Ot,getParameter:ft,updateUBOMapping:kt,uniformBlockBinding:qt,texStorage2D:ct,texStorage3D:ut,texSubImage2D:_,texSubImage3D:G,compressedTexSubImage2D:W,compressedTexSubImage3D:Z,scissor:xt,viewport:pt,reset:jt}}function Ux(i,t,e,n,s,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ht,u=new WeakMap,f=new Set,h,d=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(C,_){return g?new OffscreenCanvas(C,_):er("canvas")}function m(C,_,G){let W=1,Z=re(C);if((Z.width>G||Z.height>G)&&(W=G/Math.max(Z.width,Z.height)),W<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let ct=Math.floor(W*Z.width),ut=Math.floor(W*Z.height);h===void 0&&(h=v(ct,ut));let $=_?v(ct,ut):h;return $.width=ct,$.height=ut,$.getContext("2d").drawImage(C,0,0,ct,ut),Xt("WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+ct+"x"+ut+")."),$}else return"data"in C&&Xt("WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),C;return C}function p(C){return C.generateMipmaps}function S(C){i.generateMipmap(C)}function b(C){return C.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?i.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function y(C,_,G,W,Z,ct=!1){if(C!==null){if(i[C]!==void 0)return i[C];Xt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let ut;W&&(ut=t.get("EXT_texture_norm16"),ut||Xt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let $=_;if(_===i.RED&&(G===i.FLOAT&&($=i.R32F),G===i.HALF_FLOAT&&($=i.R16F),G===i.UNSIGNED_BYTE&&($=i.R8),G===i.UNSIGNED_SHORT&&ut&&($=ut.R16_EXT),G===i.SHORT&&ut&&($=ut.R16_SNORM_EXT)),_===i.RED_INTEGER&&(G===i.UNSIGNED_BYTE&&($=i.R8UI),G===i.UNSIGNED_SHORT&&($=i.R16UI),G===i.UNSIGNED_INT&&($=i.R32UI),G===i.BYTE&&($=i.R8I),G===i.SHORT&&($=i.R16I),G===i.INT&&($=i.R32I)),_===i.RG&&(G===i.FLOAT&&($=i.RG32F),G===i.HALF_FLOAT&&($=i.RG16F),G===i.UNSIGNED_BYTE&&($=i.RG8),G===i.UNSIGNED_SHORT&&ut&&($=ut.RG16_EXT),G===i.SHORT&&ut&&($=ut.RG16_SNORM_EXT)),_===i.RG_INTEGER&&(G===i.UNSIGNED_BYTE&&($=i.RG8UI),G===i.UNSIGNED_SHORT&&($=i.RG16UI),G===i.UNSIGNED_INT&&($=i.RG32UI),G===i.BYTE&&($=i.RG8I),G===i.SHORT&&($=i.RG16I),G===i.INT&&($=i.RG32I)),_===i.RGB_INTEGER&&(G===i.UNSIGNED_BYTE&&($=i.RGB8UI),G===i.UNSIGNED_SHORT&&($=i.RGB16UI),G===i.UNSIGNED_INT&&($=i.RGB32UI),G===i.BYTE&&($=i.RGB8I),G===i.SHORT&&($=i.RGB16I),G===i.INT&&($=i.RGB32I)),_===i.RGBA_INTEGER&&(G===i.UNSIGNED_BYTE&&($=i.RGBA8UI),G===i.UNSIGNED_SHORT&&($=i.RGBA16UI),G===i.UNSIGNED_INT&&($=i.RGBA32UI),G===i.BYTE&&($=i.RGBA8I),G===i.SHORT&&($=i.RGBA16I),G===i.INT&&($=i.RGBA32I)),_===i.RGB&&(G===i.UNSIGNED_SHORT&&ut&&($=ut.RGB16_EXT),G===i.SHORT&&ut&&($=ut.RGB16_SNORM_EXT),G===i.UNSIGNED_INT_5_9_9_9_REV&&($=i.RGB9_E5),G===i.UNSIGNED_INT_10F_11F_11F_REV&&($=i.R11F_G11F_B10F)),_===i.RGBA){let Q=ct?tr:oe.getTransfer(Z);G===i.FLOAT&&($=i.RGBA32F),G===i.HALF_FLOAT&&($=i.RGBA16F),G===i.UNSIGNED_BYTE&&($=Q===de?i.SRGB8_ALPHA8:i.RGBA8),G===i.UNSIGNED_SHORT&&ut&&($=ut.RGBA16_EXT),G===i.SHORT&&ut&&($=ut.RGBA16_SNORM_EXT),G===i.UNSIGNED_SHORT_4_4_4_4&&($=i.RGBA4),G===i.UNSIGNED_SHORT_5_5_5_1&&($=i.RGB5_A1)}return($===i.R16F||$===i.R32F||$===i.RG16F||$===i.RG32F||$===i.RGBA16F||$===i.RGBA32F)&&t.get("EXT_color_buffer_float"),$}function A(C,_){let G;return C?_===null||_===Ln||_===Ls?G=i.DEPTH24_STENCIL8:_===wn?G=i.DEPTH32F_STENCIL8:_===Ps&&(G=i.DEPTH24_STENCIL8,Xt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===Ln||_===Ls?G=i.DEPTH_COMPONENT24:_===wn?G=i.DEPTH_COMPONENT32F:_===Ps&&(G=i.DEPTH_COMPONENT16),G}function w(C,_){return p(C)===!0||C.isFramebufferTexture&&C.minFilter!==We&&C.minFilter!==Ye?Math.log2(Math.max(_.width,_.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?_.mipmaps.length:1}function T(C){let _=C.target;_.removeEventListener("dispose",T),M(_),_.isVideoTexture&&u.delete(_),_.isHTMLTexture&&f.delete(_)}function x(C){let _=C.target;_.removeEventListener("dispose",x),I(_)}function M(C){let _=n.get(C);if(_.__webglInit===void 0)return;let G=C.source,W=d.get(G);if(W){let Z=W[_.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&R(C),Object.keys(W).length===0&&d.delete(G)}n.remove(C)}function R(C){let _=n.get(C);i.deleteTexture(_.__webglTexture);let G=C.source,W=d.get(G);delete W[_.__cacheKey],a.memory.textures--}function I(C){let _=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(_.__webglFramebuffer[W]))for(let Z=0;Z<_.__webglFramebuffer[W].length;Z++)i.deleteFramebuffer(_.__webglFramebuffer[W][Z]);else i.deleteFramebuffer(_.__webglFramebuffer[W]);_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer[W])}else{if(Array.isArray(_.__webglFramebuffer))for(let W=0;W<_.__webglFramebuffer.length;W++)i.deleteFramebuffer(_.__webglFramebuffer[W]);else i.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&i.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let W=0;W<_.__webglColorRenderbuffer.length;W++)_.__webglColorRenderbuffer[W]&&i.deleteRenderbuffer(_.__webglColorRenderbuffer[W]);_.__webglDepthRenderbuffer&&i.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let G=C.textures;for(let W=0,Z=G.length;W<Z;W++){let ct=n.get(G[W]);ct.__webglTexture&&(i.deleteTexture(ct.__webglTexture),a.memory.textures--),n.remove(G[W])}n.remove(C)}let P=0;function F(){P=0}function B(){return P}function D(C){P=C}function z(){let C=P;return C>=s.maxTextures&&Xt("WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+s.maxTextures),P+=1,C}function N(C){let _=[];return _.push(C.wrapS),_.push(C.wrapT),_.push(C.wrapR||0),_.push(C.magFilter),_.push(C.minFilter),_.push(C.anisotropy),_.push(C.internalFormat),_.push(C.format),_.push(C.type),_.push(C.generateMipmaps),_.push(C.premultiplyAlpha),_.push(C.flipY),_.push(C.unpackAlignment),_.push(C.colorSpace),_.join()}function X(C,_){let G=n.get(C);if(C.isVideoTexture&&U(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&G.__version!==C.version){let W=C.image;if(W===null)Xt("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Xt("WebGLRenderer: Texture marked for update but image is incomplete");else{bt(G,C,_);return}}else C.isExternalTexture&&(G.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,G.__webglTexture,i.TEXTURE0+_)}function Y(C,_){let G=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&G.__version!==C.version){bt(G,C,_);return}else C.isExternalTexture&&(G.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,G.__webglTexture,i.TEXTURE0+_)}function j(C,_){let G=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&G.__version!==C.version){bt(G,C,_);return}e.bindTexture(i.TEXTURE_3D,G.__webglTexture,i.TEXTURE0+_)}function tt(C,_){let G=n.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&G.__version!==C.version){It(G,C,_);return}e.bindTexture(i.TEXTURE_CUBE_MAP,G.__webglTexture,i.TEXTURE0+_)}let st={[Ms]:i.REPEAT,[Hn]:i.CLAMP_TO_EDGE,[La]:i.MIRRORED_REPEAT},Tt={[We]:i.NEAREST,[fu]:i.NEAREST_MIPMAP_NEAREST,[Pr]:i.NEAREST_MIPMAP_LINEAR,[Ye]:i.LINEAR,[fo]:i.LINEAR_MIPMAP_NEAREST,[Ci]:i.LINEAR_MIPMAP_LINEAR},Zt={[gu]:i.NEVER,[Mu]:i.ALWAYS,[xu]:i.LESS,[Ko]:i.LEQUAL,[_u]:i.EQUAL,[Qo]:i.GEQUAL,[yu]:i.GREATER,[vu]:i.NOTEQUAL};function wt(C,_){if(_.type===wn&&t.has("OES_texture_float_linear")===!1&&(_.magFilter===Ye||_.magFilter===fo||_.magFilter===Pr||_.magFilter===Ci||_.minFilter===Ye||_.minFilter===fo||_.minFilter===Pr||_.minFilter===Ci)&&Xt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(C,i.TEXTURE_WRAP_S,st[_.wrapS]),i.texParameteri(C,i.TEXTURE_WRAP_T,st[_.wrapT]),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,st[_.wrapR]),i.texParameteri(C,i.TEXTURE_MAG_FILTER,Tt[_.magFilter]),i.texParameteri(C,i.TEXTURE_MIN_FILTER,Tt[_.minFilter]),_.compareFunction&&(i.texParameteri(C,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(C,i.TEXTURE_COMPARE_FUNC,Zt[_.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===We||_.minFilter!==Pr&&_.minFilter!==Ci||_.type===wn&&t.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||n.get(_).__currentAnisotropy){let G=t.get("EXT_texture_filter_anisotropic");i.texParameterf(C,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),n.get(_).__currentAnisotropy=_.anisotropy}}}function J(C,_){let G=!1;C.__webglInit===void 0&&(C.__webglInit=!0,_.addEventListener("dispose",T));let W=_.source,Z=d.get(W);Z===void 0&&(Z={},d.set(W,Z));let ct=N(_);if(ct!==C.__cacheKey){Z[ct]===void 0&&(Z[ct]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,G=!0),Z[ct].usedTimes++;let ut=Z[C.__cacheKey];ut!==void 0&&(Z[C.__cacheKey].usedTimes--,ut.usedTimes===0&&R(_)),C.__cacheKey=ct,C.__webglTexture=Z[ct].texture}return G}function ot(C,_,G){return Math.floor(Math.floor(C/G)/_)}function rt(C,_,G,W){let ct=C.updateRanges;if(ct.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,_.width,_.height,G,W,_.data);else{ct.sort((Ot,xt)=>Ot.start-xt.start);let ut=0;for(let Ot=1;Ot<ct.length;Ot++){let xt=ct[ut],pt=ct[Ot],kt=xt.start+xt.count,qt=ot(pt.start,_.width,4),jt=ot(xt.start,_.width,4);pt.start<=kt+1&&qt===jt&&ot(pt.start+pt.count-1,_.width,4)===qt?xt.count=Math.max(xt.count,pt.start+pt.count-xt.start):(++ut,ct[ut]=pt)}ct.length=ut+1;let $=e.getParameter(i.UNPACK_ROW_LENGTH),Q=e.getParameter(i.UNPACK_SKIP_PIXELS),ft=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,_.width);for(let Ot=0,xt=ct.length;Ot<xt;Ot++){let pt=ct[Ot],kt=Math.floor(pt.start/4),qt=Math.ceil(pt.count/4),jt=kt%_.width,O=Math.floor(kt/_.width),dt=qt,K=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,jt),e.pixelStorei(i.UNPACK_SKIP_ROWS,O),e.texSubImage2D(i.TEXTURE_2D,0,jt,O,dt,K,G,W,_.data)}C.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,$),e.pixelStorei(i.UNPACK_SKIP_PIXELS,Q),e.pixelStorei(i.UNPACK_SKIP_ROWS,ft)}}function bt(C,_,G){let W=i.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(W=i.TEXTURE_2D_ARRAY),_.isData3DTexture&&(W=i.TEXTURE_3D);let Z=J(C,_),ct=_.source;e.bindTexture(W,C.__webglTexture,i.TEXTURE0+G);let ut=n.get(ct);if(ct.version!==ut.__version||Z===!0){if(e.activeTexture(i.TEXTURE0+G),(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)===!1){let K=oe.getPrimaries(oe.workingColorSpace),mt=_.colorSpace===ai?null:oe.getPrimaries(_.colorSpace),St=_.colorSpace===ai||K===mt?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,St)}e.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment);let Q=m(_.image,!1,s.maxTextureSize);Q=fe(_,Q);let ft=r.convert(_.format,_.colorSpace),Ot=r.convert(_.type),xt=y(_.internalFormat,ft,Ot,_.normalized,_.colorSpace,_.isVideoTexture);wt(W,_);let pt,kt=_.mipmaps,qt=_.isVideoTexture!==!0,jt=ut.__version===void 0||Z===!0,O=ct.dataReady,dt=w(_,Q);if(_.isDepthTexture)xt=A(_.format===Ii,_.type),jt&&(qt?e.texStorage2D(i.TEXTURE_2D,1,xt,Q.width,Q.height):e.texImage2D(i.TEXTURE_2D,0,xt,Q.width,Q.height,0,ft,Ot,null));else if(_.isDataTexture)if(kt.length>0){qt&&jt&&e.texStorage2D(i.TEXTURE_2D,dt,xt,kt[0].width,kt[0].height);for(let K=0,mt=kt.length;K<mt;K++)pt=kt[K],qt?O&&e.texSubImage2D(i.TEXTURE_2D,K,0,0,pt.width,pt.height,ft,Ot,pt.data):e.texImage2D(i.TEXTURE_2D,K,xt,pt.width,pt.height,0,ft,Ot,pt.data);_.generateMipmaps=!1}else qt?(jt&&e.texStorage2D(i.TEXTURE_2D,dt,xt,Q.width,Q.height),O&&rt(_,Q,ft,Ot)):e.texImage2D(i.TEXTURE_2D,0,xt,Q.width,Q.height,0,ft,Ot,Q.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){qt&&jt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,dt,xt,kt[0].width,kt[0].height,Q.depth);for(let K=0,mt=kt.length;K<mt;K++)if(pt=kt[K],_.format!==Tn)if(ft!==null)if(qt){if(O)if(_.layerUpdates.size>0){let St=Dc(pt.width,pt.height,_.format,_.type);for(let nt of _.layerUpdates){let Nt=pt.data.subarray(nt*St/pt.data.BYTES_PER_ELEMENT,(nt+1)*St/pt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,K,0,0,nt,pt.width,pt.height,1,ft,Nt)}_.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,K,0,0,0,pt.width,pt.height,Q.depth,ft,pt.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,K,xt,pt.width,pt.height,Q.depth,0,pt.data,0,0);else Xt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else qt?O&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,K,0,0,0,pt.width,pt.height,Q.depth,ft,Ot,pt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,K,xt,pt.width,pt.height,Q.depth,0,ft,Ot,pt.data)}else{qt&&jt&&e.texStorage2D(i.TEXTURE_2D,dt,xt,kt[0].width,kt[0].height);for(let K=0,mt=kt.length;K<mt;K++)pt=kt[K],_.format!==Tn?ft!==null?qt?O&&e.compressedTexSubImage2D(i.TEXTURE_2D,K,0,0,pt.width,pt.height,ft,pt.data):e.compressedTexImage2D(i.TEXTURE_2D,K,xt,pt.width,pt.height,0,pt.data):Xt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):qt?O&&e.texSubImage2D(i.TEXTURE_2D,K,0,0,pt.width,pt.height,ft,Ot,pt.data):e.texImage2D(i.TEXTURE_2D,K,xt,pt.width,pt.height,0,ft,Ot,pt.data)}else if(_.isDataArrayTexture)if(qt){if(jt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,dt,xt,Q.width,Q.height,Q.depth),O)if(_.layerUpdates.size>0){let K=Dc(Q.width,Q.height,_.format,_.type);for(let mt of _.layerUpdates){let St=Q.data.subarray(mt*K/Q.data.BYTES_PER_ELEMENT,(mt+1)*K/Q.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,mt,Q.width,Q.height,1,ft,Ot,St)}_.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,ft,Ot,Q.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,xt,Q.width,Q.height,Q.depth,0,ft,Ot,Q.data);else if(_.isData3DTexture)qt?(jt&&e.texStorage3D(i.TEXTURE_3D,dt,xt,Q.width,Q.height,Q.depth),O&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,ft,Ot,Q.data)):e.texImage3D(i.TEXTURE_3D,0,xt,Q.width,Q.height,Q.depth,0,ft,Ot,Q.data);else if(_.isFramebufferTexture){if(jt)if(qt)e.texStorage2D(i.TEXTURE_2D,dt,xt,Q.width,Q.height);else{let K=Q.width,mt=Q.height;for(let St=0;St<dt;St++)e.texImage2D(i.TEXTURE_2D,St,xt,K,mt,0,ft,Ot,null),K>>=1,mt>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in i){let K=i.canvas;if(K.hasAttribute("layoutsubtree")||K.setAttribute("layoutsubtree","true"),Q.parentNode!==K){K.appendChild(Q),f.add(_),K.onpaint=mt=>{let St=mt.changedElements;for(let nt of f)St.includes(nt.image)&&(nt.needsUpdate=!0)},K.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,Q);else{let St=i.RGBA,nt=i.RGBA,Nt=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,St,nt,Nt,Q)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(kt.length>0){if(qt&&jt){let K=re(kt[0]);e.texStorage2D(i.TEXTURE_2D,dt,xt,K.width,K.height)}for(let K=0,mt=kt.length;K<mt;K++)pt=kt[K],qt?O&&e.texSubImage2D(i.TEXTURE_2D,K,0,0,ft,Ot,pt):e.texImage2D(i.TEXTURE_2D,K,xt,ft,Ot,pt);_.generateMipmaps=!1}else if(qt){if(jt){let K=re(Q);e.texStorage2D(i.TEXTURE_2D,dt,xt,K.width,K.height)}O&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,ft,Ot,Q)}else e.texImage2D(i.TEXTURE_2D,0,xt,ft,Ot,Q);p(_)&&S(W),ut.__version=ct.version,_.onUpdate&&_.onUpdate(_)}C.__version=_.version}function It(C,_,G){if(_.image.length!==6)return;let W=J(C,_),Z=_.source;e.bindTexture(i.TEXTURE_CUBE_MAP,C.__webglTexture,i.TEXTURE0+G);let ct=n.get(Z);if(Z.version!==ct.__version||W===!0){e.activeTexture(i.TEXTURE0+G);let ut=oe.getPrimaries(oe.workingColorSpace),$=_.colorSpace===ai?null:oe.getPrimaries(_.colorSpace),Q=_.colorSpace===ai||ut===$?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Q);let ft=_.isCompressedTexture||_.image[0].isCompressedTexture,Ot=_.image[0]&&_.image[0].isDataTexture,xt=[];for(let nt=0;nt<6;nt++)!ft&&!Ot?xt[nt]=m(_.image[nt],!0,s.maxCubemapSize):xt[nt]=Ot?_.image[nt].image:_.image[nt],xt[nt]=fe(_,xt[nt]);let pt=xt[0],kt=r.convert(_.format,_.colorSpace),qt=r.convert(_.type),jt=y(_.internalFormat,kt,qt,_.normalized,_.colorSpace),O=_.isVideoTexture!==!0,dt=ct.__version===void 0||W===!0,K=Z.dataReady,mt=w(_,pt);wt(i.TEXTURE_CUBE_MAP,_);let St;if(ft){O&&dt&&e.texStorage2D(i.TEXTURE_CUBE_MAP,mt,jt,pt.width,pt.height);for(let nt=0;nt<6;nt++){St=xt[nt].mipmaps;for(let Nt=0;Nt<St.length;Nt++){let Pt=St[Nt];_.format!==Tn?kt!==null?O?K&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Nt,0,0,Pt.width,Pt.height,kt,Pt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Nt,jt,Pt.width,Pt.height,0,Pt.data):Xt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):O?K&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Nt,0,0,Pt.width,Pt.height,kt,qt,Pt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Nt,jt,Pt.width,Pt.height,0,kt,qt,Pt.data)}}}else{if(St=_.mipmaps,O&&dt){St.length>0&&mt++;let nt=re(xt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,mt,jt,nt.width,nt.height)}for(let nt=0;nt<6;nt++)if(Ot){O?K&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,0,0,xt[nt].width,xt[nt].height,kt,qt,xt[nt].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,jt,xt[nt].width,xt[nt].height,0,kt,qt,xt[nt].data);for(let Nt=0;Nt<St.length;Nt++){let Re=St[Nt].image[nt].image;O?K&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Nt+1,0,0,Re.width,Re.height,kt,qt,Re.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Nt+1,jt,Re.width,Re.height,0,kt,qt,Re.data)}}else{O?K&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,0,0,kt,qt,xt[nt]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,jt,kt,qt,xt[nt]);for(let Nt=0;Nt<St.length;Nt++){let Pt=St[Nt];O?K&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Nt+1,0,0,kt,qt,Pt.image[nt]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Nt+1,jt,kt,qt,Pt.image[nt])}}}p(_)&&S(i.TEXTURE_CUBE_MAP),ct.__version=Z.version,_.onUpdate&&_.onUpdate(_)}C.__version=_.version}function Vt(C,_,G,W,Z,ct){let ut=r.convert(G.format,G.colorSpace),$=r.convert(G.type),Q=y(G.internalFormat,ut,$,G.normalized,G.colorSpace),ft=n.get(_),Ot=n.get(G);if(Ot.__renderTarget=_,!ft.__hasExternalTextures){let xt=Math.max(1,_.width>>ct),pt=Math.max(1,_.height>>ct);Z===i.TEXTURE_3D||Z===i.TEXTURE_2D_ARRAY?e.texImage3D(Z,ct,Q,xt,pt,_.depth,0,ut,$,null):e.texImage2D(Z,ct,Q,xt,pt,0,ut,$,null)}e.bindFramebuffer(i.FRAMEBUFFER,C),Qt(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,W,Z,Ot.__webglTexture,0,$t(_)):(Z===i.TEXTURE_2D||Z>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,W,Z,Ot.__webglTexture,ct),e.bindFramebuffer(i.FRAMEBUFFER,null)}function ue(C,_,G){if(i.bindRenderbuffer(i.RENDERBUFFER,C),_.depthBuffer){let W=_.depthTexture,Z=W&&W.isDepthTexture?W.type:null,ct=A(_.stencilBuffer,Z),ut=_.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Qt(_)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,$t(_),ct,_.width,_.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,$t(_),ct,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,ct,_.width,_.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ut,i.RENDERBUFFER,C)}else{let W=_.textures;for(let Z=0;Z<W.length;Z++){let ct=W[Z],ut=r.convert(ct.format,ct.colorSpace),$=r.convert(ct.type),Q=y(ct.internalFormat,ut,$,ct.normalized,ct.colorSpace);Qt(_)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,$t(_),Q,_.width,_.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,$t(_),Q,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,Q,_.width,_.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Jt(C,_,G){let W=_.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,C),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let Z=n.get(_.depthTexture);if(Z.__renderTarget=_,(!Z.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),W){if(Z.__webglInit===void 0&&(Z.__webglInit=!0,_.depthTexture.addEventListener("dispose",T)),Z.__webglTexture===void 0){Z.__webglTexture=i.createTexture(),e.bindTexture(i.TEXTURE_CUBE_MAP,Z.__webglTexture),wt(i.TEXTURE_CUBE_MAP,_.depthTexture);let ft=r.convert(_.depthTexture.format),Ot=r.convert(_.depthTexture.type),xt;_.depthTexture.format===Gn?xt=i.DEPTH_COMPONENT24:_.depthTexture.format===Ii&&(xt=i.DEPTH24_STENCIL8);for(let pt=0;pt<6;pt++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+pt,0,xt,_.width,_.height,0,ft,Ot,null)}}else X(_.depthTexture,0);let ct=Z.__webglTexture,ut=$t(_),$=W?i.TEXTURE_CUBE_MAP_POSITIVE_X+G:i.TEXTURE_2D,Q=_.depthTexture.format===Ii?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(_.depthTexture.format===Gn)Qt(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Q,$,ct,0,ut):i.framebufferTexture2D(i.FRAMEBUFFER,Q,$,ct,0);else if(_.depthTexture.format===Ii)Qt(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Q,$,ct,0,ut):i.framebufferTexture2D(i.FRAMEBUFFER,Q,$,ct,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function et(C){let _=n.get(C),G=C.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==C.depthTexture){let W=C.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),W){let Z=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,W.removeEventListener("dispose",Z)};W.addEventListener("dispose",Z),_.__depthDisposeCallback=Z}_.__boundDepthTexture=W}if(C.depthTexture&&!_.__autoAllocateDepthBuffer)if(G)for(let W=0;W<6;W++)Jt(_.__webglFramebuffer[W],C,W);else{let W=C.texture.mipmaps;W&&W.length>0?Jt(_.__webglFramebuffer[0],C,0):Jt(_.__webglFramebuffer,C,0)}else if(G){_.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(e.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[W]),_.__webglDepthbuffer[W]===void 0)_.__webglDepthbuffer[W]=i.createRenderbuffer(),ue(_.__webglDepthbuffer[W],C,!1);else{let Z=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ct=_.__webglDepthbuffer[W];i.bindRenderbuffer(i.RENDERBUFFER,ct),i.framebufferRenderbuffer(i.FRAMEBUFFER,Z,i.RENDERBUFFER,ct)}}else{let W=C.texture.mipmaps;if(W&&W.length>0?e.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=i.createRenderbuffer(),ue(_.__webglDepthbuffer,C,!1);else{let Z=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ct=_.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ct),i.framebufferRenderbuffer(i.FRAMEBUFFER,Z,i.RENDERBUFFER,ct)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function at(C,_,G){let W=n.get(C);_!==void 0&&Vt(W.__webglFramebuffer,C,C.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),G!==void 0&&et(C)}function it(C){let _=C.texture,G=n.get(C),W=n.get(_);C.addEventListener("dispose",x);let Z=C.textures,ct=C.isWebGLCubeRenderTarget===!0,ut=Z.length>1;if(ut||(W.__webglTexture===void 0&&(W.__webglTexture=i.createTexture()),W.__version=_.version,a.memory.textures++),ct){G.__webglFramebuffer=[];for(let $=0;$<6;$++)if(_.mipmaps&&_.mipmaps.length>0){G.__webglFramebuffer[$]=[];for(let Q=0;Q<_.mipmaps.length;Q++)G.__webglFramebuffer[$][Q]=i.createFramebuffer()}else G.__webglFramebuffer[$]=i.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){G.__webglFramebuffer=[];for(let $=0;$<_.mipmaps.length;$++)G.__webglFramebuffer[$]=i.createFramebuffer()}else G.__webglFramebuffer=i.createFramebuffer();if(ut)for(let $=0,Q=Z.length;$<Q;$++){let ft=n.get(Z[$]);ft.__webglTexture===void 0&&(ft.__webglTexture=i.createTexture(),a.memory.textures++)}if(C.samples>0&&Qt(C)===!1){G.__webglMultisampledFramebuffer=i.createFramebuffer(),G.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let $=0;$<Z.length;$++){let Q=Z[$];G.__webglColorRenderbuffer[$]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,G.__webglColorRenderbuffer[$]);let ft=r.convert(Q.format,Q.colorSpace),Ot=r.convert(Q.type),xt=y(Q.internalFormat,ft,Ot,Q.normalized,Q.colorSpace,C.isXRRenderTarget===!0),pt=$t(C);i.renderbufferStorageMultisample(i.RENDERBUFFER,pt,xt,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+$,i.RENDERBUFFER,G.__webglColorRenderbuffer[$])}i.bindRenderbuffer(i.RENDERBUFFER,null),C.depthBuffer&&(G.__webglDepthRenderbuffer=i.createRenderbuffer(),ue(G.__webglDepthRenderbuffer,C,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ct){e.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture),wt(i.TEXTURE_CUBE_MAP,_);for(let $=0;$<6;$++)if(_.mipmaps&&_.mipmaps.length>0)for(let Q=0;Q<_.mipmaps.length;Q++)Vt(G.__webglFramebuffer[$][Q],C,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+$,Q);else Vt(G.__webglFramebuffer[$],C,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0);p(_)&&S(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(ut){for(let $=0,Q=Z.length;$<Q;$++){let ft=Z[$],Ot=n.get(ft),xt=i.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(xt=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(xt,Ot.__webglTexture),wt(xt,ft),Vt(G.__webglFramebuffer,C,ft,i.COLOR_ATTACHMENT0+$,xt,0),p(ft)&&S(xt)}e.unbindTexture()}else{let $=i.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&($=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture($,W.__webglTexture),wt($,_),_.mipmaps&&_.mipmaps.length>0)for(let Q=0;Q<_.mipmaps.length;Q++)Vt(G.__webglFramebuffer[Q],C,_,i.COLOR_ATTACHMENT0,$,Q);else Vt(G.__webglFramebuffer,C,_,i.COLOR_ATTACHMENT0,$,0);p(_)&&S($),e.unbindTexture()}C.depthBuffer&&et(C)}function yt(C){let _=C.textures;for(let G=0,W=_.length;G<W;G++){let Z=_[G];if(p(Z)){let ct=b(C),ut=n.get(Z).__webglTexture;e.bindTexture(ct,ut),S(ct),e.unbindTexture()}}}let gt=[],Wt=[];function Ft(C){if(C.samples>0){if(Qt(C)===!1){let _=C.textures,G=C.width,W=C.height,Z=i.COLOR_BUFFER_BIT,ct=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ut=n.get(C),$=_.length>1;if($)for(let ft=0;ft<_.length;ft++)e.bindFramebuffer(i.FRAMEBUFFER,ut.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ft,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,ut.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ft,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,ut.__webglMultisampledFramebuffer);let Q=C.texture.mipmaps;Q&&Q.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ut.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ut.__webglFramebuffer);for(let ft=0;ft<_.length;ft++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(Z|=i.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(Z|=i.STENCIL_BUFFER_BIT)),$){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ut.__webglColorRenderbuffer[ft]);let Ot=n.get(_[ft]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Ot,0)}i.blitFramebuffer(0,0,G,W,0,0,G,W,Z,i.NEAREST),l===!0&&(gt.length=0,Wt.length=0,gt.push(i.COLOR_ATTACHMENT0+ft),C.depthBuffer&&C.resolveDepthBuffer===!1&&(gt.push(ct),Wt.push(ct),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Wt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,gt))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),$)for(let ft=0;ft<_.length;ft++){e.bindFramebuffer(i.FRAMEBUFFER,ut.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ft,i.RENDERBUFFER,ut.__webglColorRenderbuffer[ft]);let Ot=n.get(_[ft]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,ut.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ft,i.TEXTURE_2D,Ot,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ut.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){let _=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[_])}}}function $t(C){return Math.min(s.maxSamples,C.samples)}function Qt(C){let _=n.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function U(C){let _=a.render.frame;u.get(C)!==_&&(u.set(C,_),C.update())}function fe(C,_){let G=C.colorSpace,W=C.format,Z=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||G!==js&&G!==ai&&(oe.getTransfer(G)===de?(W!==Tn||Z!==hn)&&Xt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Yt("WebGLTextures: Unsupported texture color space:",G)),_}function re(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=z,this.resetTextureUnits=F,this.getTextureUnits=B,this.setTextureUnits=D,this.setTexture2D=X,this.setTexture2DArray=Y,this.setTexture3D=j,this.setTextureCube=tt,this.rebindTextures=at,this.setupRenderTarget=it,this.updateRenderTargetMipmap=yt,this.updateMultisampleRenderTarget=Ft,this.setupDepthRenderbuffer=et,this.setupFrameBufferTexture=Vt,this.useMultisampledRTT=Qt,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function Nx(i,t){function e(n,s=ai){let r,a=oe.getTransfer(s);if(n===hn)return i.UNSIGNED_BYTE;if(n===mo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===go)return i.UNSIGNED_SHORT_5_5_5_1;if(n===bc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Ec)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Mc)return i.BYTE;if(n===Sc)return i.SHORT;if(n===Ps)return i.UNSIGNED_SHORT;if(n===po)return i.INT;if(n===Ln)return i.UNSIGNED_INT;if(n===wn)return i.FLOAT;if(n===Xn)return i.HALF_FLOAT;if(n===wc)return i.ALPHA;if(n===Tc)return i.RGB;if(n===Tn)return i.RGBA;if(n===Gn)return i.DEPTH_COMPONENT;if(n===Ii)return i.DEPTH_STENCIL;if(n===xo)return i.RED;if(n===_o)return i.RED_INTEGER;if(n===Pi)return i.RG;if(n===yo)return i.RG_INTEGER;if(n===vo)return i.RGBA_INTEGER;if(n===Lr||n===Dr||n===Ur||n===Nr)if(a===de)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Lr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Dr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ur)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Nr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Lr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Dr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ur)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Nr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Mo||n===So||n===bo||n===Eo)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Mo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===So)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===bo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Eo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===wo||n===To||n===Ao||n===Ro||n===Co||n===Fr||n===Io)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===wo||n===To)return a===de?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Ao)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Ro)return r.COMPRESSED_R11_EAC;if(n===Co)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Fr)return r.COMPRESSED_RG11_EAC;if(n===Io)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Po||n===Lo||n===Do||n===Uo||n===No||n===Fo||n===Oo||n===Bo||n===zo||n===Ho||n===Go||n===ko||n===Vo||n===Wo)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Po)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Lo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Do)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Uo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===No)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Fo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Oo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Bo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===zo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ho)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Go)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===ko)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Vo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Wo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Xo||n===qo||n===Yo)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Xo)return a===de?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===qo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Yo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Zo||n===$o||n===Or||n===Jo)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Zo)return r.COMPRESSED_RED_RGTC1_EXT;if(n===$o)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Or)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Jo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ls?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var Fx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Ox=`
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

}`,Yc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new ur(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new rn({vertexShader:Fx,fragmentShader:Ox,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Ct(new ze(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Zc=class extends kn{constructor(t,e){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,f=null,h=null,d=null,g=null,v=typeof XRWebGLBinding<"u",m=new Yc,p={},S=e.getContextAttributes(),b=null,y=null,A=[],w=[],T=new ht,x=null,M=new je;M.viewport=new Ee;let R=new je;R.viewport=new Ee;let I=[M,R],P=new oo,F=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let ot=A[J];return ot===void 0&&(ot=new ws,A[J]=ot),ot.getTargetRaySpace()},this.getControllerGrip=function(J){let ot=A[J];return ot===void 0&&(ot=new ws,A[J]=ot),ot.getGripSpace()},this.getHand=function(J){let ot=A[J];return ot===void 0&&(ot=new ws,A[J]=ot),ot.getHandSpace()};function D(J){let ot=w.indexOf(J.inputSource);if(ot===-1)return;let rt=A[ot];rt!==void 0&&(rt.update(J.inputSource,J.frame,c||a),rt.dispatchEvent({type:J.type,data:J.inputSource}))}function z(){s.removeEventListener("select",D),s.removeEventListener("selectstart",D),s.removeEventListener("selectend",D),s.removeEventListener("squeeze",D),s.removeEventListener("squeezestart",D),s.removeEventListener("squeezeend",D),s.removeEventListener("end",z),s.removeEventListener("inputsourceschange",N);for(let J=0;J<A.length;J++){let ot=w[J];ot!==null&&(w[J]=null,A[J].disconnect(ot))}F=null,B=null,m.reset();for(let J in p)delete p[J];t.setRenderTarget(b),d=null,h=null,f=null,s=null,y=null,wt.stop(),n.isPresenting=!1,t.setPixelRatio(x),t.setSize(T.width,T.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){r=J,n.isPresenting===!0&&Xt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){o=J,n.isPresenting===!0&&Xt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(J){c=J},this.getBaseLayer=function(){return h!==null?h:d},this.getBinding=function(){return f===null&&v&&(f=new XRWebGLBinding(s,e)),f},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(J){if(s=J,s!==null){if(b=t.getRenderTarget(),s.addEventListener("select",D),s.addEventListener("selectstart",D),s.addEventListener("selectend",D),s.addEventListener("squeeze",D),s.addEventListener("squeezestart",D),s.addEventListener("squeezeend",D),s.addEventListener("end",z),s.addEventListener("inputsourceschange",N),S.xrCompatible!==!0&&await e.makeXRCompatible(),x=t.getPixelRatio(),t.getSize(T),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let rt=null,bt=null,It=null;S.depth&&(It=S.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,rt=S.stencil?Ii:Gn,bt=S.stencil?Ls:Ln);let Vt={colorFormat:e.RGBA8,depthFormat:It,scaleFactor:r};f=this.getBinding(),h=f.createProjectionLayer(Vt),s.updateRenderState({layers:[h]}),t.setPixelRatio(1),t.setSize(h.textureWidth,h.textureHeight,!1),y=new gn(h.textureWidth,h.textureHeight,{format:Tn,type:hn,depthTexture:new si(h.textureWidth,h.textureHeight,bt,void 0,void 0,void 0,void 0,void 0,void 0,rt),stencilBuffer:S.stencil,colorSpace:t.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1})}else{let rt={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,e,rt),s.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),y=new gn(d.framebufferWidth,d.framebufferHeight,{format:Tn,type:hn,colorSpace:t.outputColorSpace,stencilBuffer:S.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),wt.setContext(s),wt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function N(J){for(let ot=0;ot<J.removed.length;ot++){let rt=J.removed[ot],bt=w.indexOf(rt);bt>=0&&(w[bt]=null,A[bt].disconnect(rt))}for(let ot=0;ot<J.added.length;ot++){let rt=J.added[ot],bt=w.indexOf(rt);if(bt===-1){for(let Vt=0;Vt<A.length;Vt++)if(Vt>=w.length){w.push(rt),bt=Vt;break}else if(w[Vt]===null){w[Vt]=rt,bt=Vt;break}if(bt===-1)break}let It=A[bt];It&&It.connect(rt)}}let X=new L,Y=new L;function j(J,ot,rt){X.setFromMatrixPosition(ot.matrixWorld),Y.setFromMatrixPosition(rt.matrixWorld);let bt=X.distanceTo(Y),It=ot.projectionMatrix.elements,Vt=rt.projectionMatrix.elements,ue=It[14]/(It[10]-1),Jt=It[14]/(It[10]+1),et=(It[9]+1)/It[5],at=(It[9]-1)/It[5],it=(It[8]-1)/It[0],yt=(Vt[8]+1)/Vt[0],gt=ue*it,Wt=ue*yt,Ft=bt/(-it+yt),$t=Ft*-it;if(ot.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX($t),J.translateZ(Ft),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),It[10]===-1)J.projectionMatrix.copy(ot.projectionMatrix),J.projectionMatrixInverse.copy(ot.projectionMatrixInverse);else{let Qt=ue+Ft,U=Jt+Ft,fe=gt-$t,re=Wt+(bt-$t),C=et*Jt/U*Qt,_=at*Jt/U*Qt;J.projectionMatrix.makePerspective(fe,re,C,_,Qt,U),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function tt(J,ot){ot===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(ot.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(s===null)return;let ot=J.near,rt=J.far;m.texture!==null&&(m.depthNear>0&&(ot=m.depthNear),m.depthFar>0&&(rt=m.depthFar)),P.near=R.near=M.near=ot,P.far=R.far=M.far=rt,(F!==P.near||B!==P.far)&&(s.updateRenderState({depthNear:P.near,depthFar:P.far}),F=P.near,B=P.far),P.layers.mask=J.layers.mask|6,M.layers.mask=P.layers.mask&-5,R.layers.mask=P.layers.mask&-3;let bt=J.parent,It=P.cameras;tt(P,bt);for(let Vt=0;Vt<It.length;Vt++)tt(It[Vt],bt);It.length===2?j(P,M,R):P.projectionMatrix.copy(M.projectionMatrix),st(J,P,bt)};function st(J,ot,rt){rt===null?J.matrix.copy(ot.matrixWorld):(J.matrix.copy(rt.matrixWorld),J.matrix.invert(),J.matrix.multiply(ot.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(ot.projectionMatrix),J.projectionMatrixInverse.copy(ot.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=Ua*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return P},this.getFoveation=function(){if(!(h===null&&d===null))return l},this.setFoveation=function(J){l=J,h!==null&&(h.fixedFoveation=J),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=J)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(P)},this.getCameraTexture=function(J){return p[J]};let Tt=null;function Zt(J,ot){if(u=ot.getViewerPose(c||a),g=ot,u!==null){let rt=u.views;d!==null&&(t.setRenderTargetFramebuffer(y,d.framebuffer),t.setRenderTarget(y));let bt=!1;rt.length!==P.cameras.length&&(P.cameras.length=0,bt=!0);for(let Jt=0;Jt<rt.length;Jt++){let et=rt[Jt],at=null;if(d!==null)at=d.getViewport(et);else{let yt=f.getViewSubImage(h,et);at=yt.viewport,Jt===0&&(t.setRenderTargetTextures(y,yt.colorTexture,yt.depthStencilTexture),t.setRenderTarget(y))}let it=I[Jt];it===void 0&&(it=new je,it.layers.enable(Jt),it.viewport=new Ee,I[Jt]=it),it.matrix.fromArray(et.transform.matrix),it.matrix.decompose(it.position,it.quaternion,it.scale),it.projectionMatrix.fromArray(et.projectionMatrix),it.projectionMatrixInverse.copy(it.projectionMatrix).invert(),it.viewport.set(at.x,at.y,at.width,at.height),Jt===0&&(P.matrix.copy(it.matrix),P.matrix.decompose(P.position,P.quaternion,P.scale)),bt===!0&&P.cameras.push(it)}let It=s.enabledFeatures;if(It&&It.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){f=n.getBinding();let Jt=f.getDepthInformation(rt[0]);Jt&&Jt.isValid&&Jt.texture&&m.init(Jt,s.renderState)}if(It&&It.includes("camera-access")&&v){t.state.unbindTexture(),f=n.getBinding();for(let Jt=0;Jt<rt.length;Jt++){let et=rt[Jt].camera;if(et){let at=p[et];at||(at=new ur,p[et]=at);let it=f.getCameraImage(et);at.sourceTexture=it}}}}for(let rt=0;rt<A.length;rt++){let bt=w[rt],It=A[rt];bt!==null&&It!==void 0&&It.update(bt,ot,c||a)}Tt&&Tt(J,ot),ot.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ot}),g=null}let wt=new ed;wt.setAnimationLoop(Zt),this.setAnimationLoop=function(J){Tt=J},this.dispose=function(){}}},Bx=new ee,od=new Kt;od.set(-1,0,0,0,1,0,0,0,1);function zx(i,t){function e(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Ic(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,S,b,y){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),f(m,p)):p.isMeshPhongMaterial?(r(m,p),u(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),h(m,p),p.isMeshPhysicalMaterial&&d(m,p,y)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),v(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,S,b):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,e(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Ze&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,e(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Ze&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,e(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,e(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let S=t.get(p),b=S.envMap,y=S.envMapRotation;b&&(m.envMap.value=b,m.envMapRotation.value.setFromMatrix4(Bx.makeRotationFromEuler(y)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(od),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,S,b){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*S,m.scale.value=b*.5,p.map&&(m.map.value=p.map,e(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function f(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function h(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,S){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Ze&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=S.texture,m.transmissionSamplerSize.value.set(S.width,S.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){let S=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(S.matrixWorld),m.nearDistance.value=S.shadow.camera.near,m.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Hx(i,t,e,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,A){let w=A.program;n.uniformBlockBinding(y,w)}function c(y,A){let w=s[y.id];w===void 0&&(m(y),w=u(y),s[y.id]=w,y.addEventListener("dispose",S));let T=A.program;n.updateUBOMapping(y,T);let x=t.render.frame;r[y.id]!==x&&(h(y),r[y.id]=x)}function u(y){let A=f();y.__bindingPointIndex=A;let w=i.createBuffer(),T=y.__size,x=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,w),i.bufferData(i.UNIFORM_BUFFER,T,x),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,A,w),w}function f(){for(let y=0;y<o;y++)if(a.indexOf(y)===-1)return a.push(y),y;return Yt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(y){let A=s[y.id],w=y.uniforms,T=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,A);for(let x=0,M=w.length;x<M;x++){let R=w[x];if(Array.isArray(R))for(let I=0,P=R.length;I<P;I++)d(R[I],x,I,T);else d(R,x,0,T)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function d(y,A,w,T){if(v(y,A,w,T)===!0){let x=y.__offset,M=y.value;if(Array.isArray(M)){let R=0;for(let I=0;I<M.length;I++){let P=M[I],F=p(P);g(P,y.__data,R),typeof P!="number"&&typeof P!="boolean"&&!P.isMatrix3&&!ArrayBuffer.isView(P)&&(R+=F.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(M,y.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,x,y.__data)}}function g(y,A,w){typeof y=="number"||typeof y=="boolean"?A[0]=y:y.isMatrix3?(A[0]=y.elements[0],A[1]=y.elements[1],A[2]=y.elements[2],A[3]=0,A[4]=y.elements[3],A[5]=y.elements[4],A[6]=y.elements[5],A[7]=0,A[8]=y.elements[6],A[9]=y.elements[7],A[10]=y.elements[8],A[11]=0):ArrayBuffer.isView(y)?A.set(new y.constructor(y.buffer,y.byteOffset,A.length)):y.toArray(A,w)}function v(y,A,w,T){let x=y.value,M=A+"_"+w;if(T[M]===void 0)return typeof x=="number"||typeof x=="boolean"?T[M]=x:ArrayBuffer.isView(x)?T[M]=x.slice():T[M]=x.clone(),!0;{let R=T[M];if(typeof x=="number"||typeof x=="boolean"){if(R!==x)return T[M]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(R.equals(x)===!1)return R.copy(x),!0}}return!1}function m(y){let A=y.uniforms,w=0,T=16;for(let M=0,R=A.length;M<R;M++){let I=Array.isArray(A[M])?A[M]:[A[M]];for(let P=0,F=I.length;P<F;P++){let B=I[P],D=Array.isArray(B.value)?B.value:[B.value];for(let z=0,N=D.length;z<N;z++){let X=D[z],Y=p(X),j=w%T,tt=j%Y.boundary,st=j+tt;w+=tt,st!==0&&T-st<Y.storage&&(w+=T-st),B.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),B.__offset=w,w+=Y.storage}}}let x=w%T;return x>0&&(w+=T-x),y.__size=w,y.__cache={},this}function p(y){let A={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(A.boundary=4,A.storage=4):y.isVector2?(A.boundary=8,A.storage=8):y.isVector3||y.isColor?(A.boundary=16,A.storage=12):y.isVector4?(A.boundary=16,A.storage=16):y.isMatrix3?(A.boundary=48,A.storage=48):y.isMatrix4?(A.boundary=64,A.storage=64):y.isTexture?Xt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(A.boundary=16,A.storage=y.byteLength):Xt("WebGLRenderer: Unsupported uniform value type.",y),A}function S(y){let A=y.target;A.removeEventListener("dispose",S);let w=a.indexOf(A.__bindingPointIndex);a.splice(w,1),i.deleteBuffer(s[A.id]),delete s[A.id],delete r[A.id]}function b(){for(let y in s)i.deleteBuffer(s[y]);a=[],s={},r={}}return{bind:l,update:c,dispose:b}}var Gx=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),qn=null;function kx(){return qn===null&&(qn=new lr(Gx,16,16,Pi,Xn),qn.name="DFG_LUT",qn.minFilter=Ye,qn.magFilter=Ye,qn.wrapS=Hn,qn.wrapT=Hn,qn.generateMipmaps=!1,qn.needsUpdate=!0),qn}var il=class{constructor(t={}){let{canvas:e=Su(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:h=!1,outputBufferType:d=hn}=t;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=a;let v=d,m=new Set([vo,yo,_o]),p=new Set([hn,Ln,Ps,Ls,mo,go]),S=new Uint32Array(4),b=new Int32Array(4),y=new L,A=null,w=null,T=[],x=[],M=null;this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Pn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let R=this,I=!1,P=null,F=null,B=null,D=null;this._outputColorSpace=Oe;let z=0,N=0,X=null,Y=-1,j=null,tt=new Ee,st=new Ee,Tt=null,Zt=new Gt(0),wt=0,J=e.width,ot=e.height,rt=1,bt=null,It=null,Vt=new Ee(0,0,J,ot),ue=new Ee(0,0,J,ot),Jt=!1,et=new Ts,at=!1,it=!1,yt=new ee,gt=new L,Wt=new Ee,Ft={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},$t=!1;function Qt(){return X===null?rt:1}let U=n;function fe(E,H){return e.getContext(E,H)}try{let E={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:f};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"185"}`),e.addEventListener("webglcontextlost",Re,!1),e.addEventListener("webglcontextrestored",_e,!1),e.addEventListener("webglcontextcreationerror",Nn,!1),U===null){let H="webgl2";if(U=fe(H,E),U===null)throw fe(H)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(E){throw Yt("WebGLRenderer: "+E.message),E}let re,C,_,G,W,Z,ct,ut,$,Q,ft,Ot,xt,pt,kt,qt,jt,O,dt,K,mt,St,nt;function Nt(){re=new $0(U),re.init(),mt=new Nx(U,re),C=new G0(U,re,t,mt),_=new Dx(U,re),C.reversedDepthBuffer&&h&&_.buffers.depth.setReversed(!0),F=U.createFramebuffer(),B=U.createFramebuffer(),D=U.createFramebuffer(),G=new Q0(U),W=new yx,Z=new Ux(U,re,_,W,C,mt,G),ct=new Z0(R),ut=new np(U),St=new z0(U,ut),$=new J0(U,ut,G,St),Q=new tg(U,$,ut,St,G),O=new j0(U,C,Z),kt=new k0(W),ft=new _x(R,ct,re,C,St,kt),Ot=new zx(R,W),xt=new Mx,pt=new Ax(re),jt=new B0(R,ct,_,Q,g,l),qt=new Lx(R,Q,C),nt=new Hx(U,G,C,_),dt=new H0(U,re,G),K=new K0(U,re,G),G.programs=ft.programs,R.capabilities=C,R.extensions=re,R.properties=W,R.renderLists=xt,R.shadowMap=qt,R.state=_,R.info=G}Nt(),v!==hn&&(M=new ng(v,e.width,e.height,o,s,r));let Pt=new Zc(R,U);this.xr=Pt,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){let E=re.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){let E=re.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return rt},this.setPixelRatio=function(E){E!==void 0&&(rt=E,this.setSize(J,ot,!1))},this.getSize=function(E){return E.set(J,ot)},this.setSize=function(E,H,q=!0){if(Pt.isPresenting){Xt("WebGLRenderer: Can't change size while VR device is presenting.");return}J=E,ot=H,e.width=Math.floor(E*rt),e.height=Math.floor(H*rt),q===!0&&(e.style.width=E+"px",e.style.height=H+"px"),M!==null&&M.setSize(e.width,e.height),this.setViewport(0,0,E,H)},this.getDrawingBufferSize=function(E){return E.set(J*rt,ot*rt).floor()},this.setDrawingBufferSize=function(E,H,q){J=E,ot=H,rt=q,e.width=Math.floor(E*q),e.height=Math.floor(H*q),this.setViewport(0,0,E,H)},this.setEffects=function(E){if(v===hn){Yt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(E){for(let H=0;H<E.length;H++)if(E[H].isOutputPass===!0){Xt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}M.setEffects(E||[])},this.getCurrentViewport=function(E){return E.copy(tt)},this.getViewport=function(E){return E.copy(Vt)},this.setViewport=function(E,H,q,k){E.isVector4?Vt.set(E.x,E.y,E.z,E.w):Vt.set(E,H,q,k),_.viewport(tt.copy(Vt).multiplyScalar(rt).round())},this.getScissor=function(E){return E.copy(ue)},this.setScissor=function(E,H,q,k){E.isVector4?ue.set(E.x,E.y,E.z,E.w):ue.set(E,H,q,k),_.scissor(st.copy(ue).multiplyScalar(rt).round())},this.getScissorTest=function(){return Jt},this.setScissorTest=function(E){_.setScissorTest(Jt=E)},this.setOpaqueSort=function(E){bt=E},this.setTransparentSort=function(E){It=E},this.getClearColor=function(E){return E.copy(jt.getClearColor())},this.setClearColor=function(){jt.setClearColor(...arguments)},this.getClearAlpha=function(){return jt.getClearAlpha()},this.setClearAlpha=function(){jt.setClearAlpha(...arguments)},this.clear=function(E=!0,H=!0,q=!0){let k=0;if(E){let V=!1;if(X!==null){let Mt=X.texture.format;V=m.has(Mt)}if(V){let Mt=X.texture.type,Rt=p.has(Mt),vt=jt.getClearColor(),Lt=jt.getClearAlpha(),Bt=vt.r,te=vt.g,se=vt.b;Rt?(S[0]=Bt,S[1]=te,S[2]=se,S[3]=Lt,U.clearBufferuiv(U.COLOR,0,S)):(b[0]=Bt,b[1]=te,b[2]=se,b[3]=Lt,U.clearBufferiv(U.COLOR,0,b))}else k|=U.COLOR_BUFFER_BIT}H&&(k|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),q&&(k|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),k!==0&&U.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(E){E.setRenderer(this),P=E},this.dispose=function(){e.removeEventListener("webglcontextlost",Re,!1),e.removeEventListener("webglcontextrestored",_e,!1),e.removeEventListener("webglcontextcreationerror",Nn,!1),jt.dispose(),xt.dispose(),pt.dispose(),W.dispose(),ct.dispose(),Q.dispose(),St.dispose(),nt.dispose(),ft.dispose(),Pt.dispose(),Pt.removeEventListener("sessionstart",ch),Pt.removeEventListener("sessionend",hh),Bi.stop()};function Re(E){E.preventDefault(),Rc("WebGLRenderer: Context Lost."),I=!0}function _e(){Rc("WebGLRenderer: Context Restored."),I=!1;let E=G.autoReset,H=qt.enabled,q=qt.autoUpdate,k=qt.needsUpdate,V=qt.type;Nt(),G.autoReset=E,qt.enabled=H,qt.autoUpdate=q,qt.needsUpdate=k,qt.type=V}function Nn(E){Yt("WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function Fn(E){let H=E.target;H.removeEventListener("dispose",Fn),Gd(H)}function Gd(E){kd(E),W.remove(E)}function kd(E){let H=W.get(E).programs;H!==void 0&&(H.forEach(function(q){ft.releaseProgram(q)}),E.isShaderMaterial&&ft.releaseShaderCache(E))}this.renderBufferDirect=function(E,H,q,k,V,Mt){H===null&&(H=Ft);let Rt=V.isMesh&&V.matrixWorld.determinantAffine()<0,vt=Xd(E,H,q,k,V);_.setMaterial(k,Rt);let Lt=q.index,Bt=1;if(k.wireframe===!0){if(Lt=$.getWireframeAttribute(q),Lt===void 0)return;Bt=2}let te=q.drawRange,se=q.attributes.position,Ht=te.start*Bt,pe=(te.start+te.count)*Bt;Mt!==null&&(Ht=Math.max(Ht,Mt.start*Bt),pe=Math.min(pe,(Mt.start+Mt.count)*Bt)),Lt!==null?(Ht=Math.max(Ht,0),pe=Math.min(pe,Lt.count)):se!=null&&(Ht=Math.max(Ht,0),pe=Math.min(pe,se.count));let Ie=pe-Ht;if(Ie<0||Ie===1/0)return;St.setup(V,k,vt,q,Lt);let Ce,ge=dt;if(Lt!==null&&(Ce=ut.get(Lt),ge=K,ge.setIndex(Ce)),V.isMesh)k.wireframe===!0?(_.setLineWidth(k.wireframeLinewidth*Qt()),ge.setMode(U.LINES)):ge.setMode(U.TRIANGLES);else if(V.isLine){let Je=k.linewidth;Je===void 0&&(Je=1),_.setLineWidth(Je*Qt()),V.isLineSegments?ge.setMode(U.LINES):V.isLineLoop?ge.setMode(U.LINE_LOOP):ge.setMode(U.LINE_STRIP)}else V.isPoints?ge.setMode(U.POINTS):V.isSprite&&ge.setMode(U.TRIANGLES);if(V.isBatchedMesh)if(re.get("WEBGL_multi_draw"))ge.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{let Je=V._multiDrawStarts,At=V._multiDrawCounts,fn=V._multiDrawCount,he=Lt?ut.get(Lt).bytesPerElement:1,Sn=W.get(k).currentProgram.getUniforms();for(let On=0;On<fn;On++)Sn.setValue(U,"_gl_DrawID",On),ge.render(Je[On]/he,At[On])}else if(V.isInstancedMesh)ge.renderInstances(Ht,Ie,V.count);else if(q.isInstancedBufferGeometry){let Je=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,At=Math.min(q.instanceCount,Je);ge.renderInstances(Ht,Ie,At)}else ge.render(Ht,Ie)};function lh(E,H,q){E.transparent===!0&&E.side===He&&E.forceSinglePass===!1?(E.side=Ze,E.needsUpdate=!0,Qr(E,H,q),E.side=ni,E.needsUpdate=!0,Qr(E,H,q),E.side=He):Qr(E,H,q)}this.compile=function(E,H,q=null){q===null&&(q=E),w=pt.get(q),w.init(H),x.push(w),q.traverseVisible(function(V){V.isLight&&V.layers.test(H.layers)&&(w.pushLight(V),V.castShadow&&w.pushShadow(V))}),E!==q&&E.traverseVisible(function(V){V.isLight&&V.layers.test(H.layers)&&(w.pushLight(V),V.castShadow&&w.pushShadow(V))}),w.setupLights();let k=new Set;return E.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;let Mt=V.material;if(Mt)if(Array.isArray(Mt))for(let Rt=0;Rt<Mt.length;Rt++){let vt=Mt[Rt];lh(vt,q,V),k.add(vt)}else lh(Mt,q,V),k.add(Mt)}),w=x.pop(),k},this.compileAsync=function(E,H,q=null){let k=this.compile(E,H,q);return new Promise(V=>{function Mt(){if(k.forEach(function(Rt){W.get(Rt).currentProgram.isReady()&&k.delete(Rt)}),k.size===0){V(E);return}setTimeout(Mt,10)}re.get("KHR_parallel_shader_compile")!==null?Mt():setTimeout(Mt,10)})};let Sl=null;function Vd(E){Sl&&Sl(E)}function ch(){Bi.stop()}function hh(){Bi.start()}let Bi=new ed;Bi.setAnimationLoop(Vd),typeof self<"u"&&Bi.setContext(self),this.setAnimationLoop=function(E){Sl=E,Pt.setAnimationLoop(E),E===null?Bi.stop():Bi.start()},Pt.addEventListener("sessionstart",ch),Pt.addEventListener("sessionend",hh),this.render=function(E,H){if(H!==void 0&&H.isCamera!==!0){Yt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;P!==null&&P.renderStart(E,H);let q=Pt.enabled===!0&&Pt.isPresenting===!0,k=M!==null&&(X===null||q)&&M.begin(R,X);if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),H.parent===null&&H.matrixWorldAutoUpdate===!0&&H.updateMatrixWorld(),Pt.enabled===!0&&Pt.isPresenting===!0&&(M===null||M.isCompositing()===!1)&&(Pt.cameraAutoUpdate===!0&&Pt.updateCamera(H),H=Pt.getCamera()),E.isScene===!0&&E.onBeforeRender(R,E,H,X),w=pt.get(E,x.length),w.init(H),w.state.textureUnits=Z.getTextureUnits(),x.push(w),yt.multiplyMatrices(H.projectionMatrix,H.matrixWorldInverse),et.setFromProjectionMatrix(yt,In,H.reversedDepth),it=this.localClippingEnabled,at=kt.init(this.clippingPlanes,it),A=xt.get(E,T.length),A.init(),T.push(A),Pt.enabled===!0&&Pt.isPresenting===!0){let Rt=R.xr.getDepthSensingMesh();Rt!==null&&bl(Rt,H,-1/0,R.sortObjects)}bl(E,H,0,R.sortObjects),A.finish(),R.sortObjects===!0&&A.sort(bt,It,H.reversedDepth),$t=Pt.enabled===!1||Pt.isPresenting===!1||Pt.hasDepthSensing()===!1,$t&&jt.addToRenderList(A,E),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),at===!0&&kt.beginShadows();let V=w.state.shadowsArray;if(qt.render(V,E,H),at===!0&&kt.endShadows(),(k&&M.hasRenderPass())===!1){let Rt=A.opaque,vt=A.transmissive;if(w.setupLights(),H.isArrayCamera){let Lt=H.cameras;if(vt.length>0)for(let Bt=0,te=Lt.length;Bt<te;Bt++){let se=Lt[Bt];dh(Rt,vt,E,se)}$t&&jt.render(E);for(let Bt=0,te=Lt.length;Bt<te;Bt++){let se=Lt[Bt];uh(A,E,se,se.viewport)}}else vt.length>0&&dh(Rt,vt,E,H),$t&&jt.render(E),uh(A,E,H)}X!==null&&N===0&&(Z.updateMultisampleRenderTarget(X),Z.updateRenderTargetMipmap(X)),k&&M.end(R),E.isScene===!0&&E.onAfterRender(R,E,H),St.resetDefaultState(),Y=-1,j=null,x.pop(),x.length>0?(w=x[x.length-1],Z.setTextureUnits(w.state.textureUnits),at===!0&&kt.setGlobalState(R.clippingPlanes,w.state.camera)):w=null,T.pop(),T.length>0?A=T[T.length-1]:A=null,P!==null&&P.renderEnd()};function bl(E,H,q,k){if(E.visible===!1)return;if(E.layers.test(H.layers)){if(E.isGroup)q=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(H);else if(E.isLightProbeGrid)w.pushLightProbeGrid(E);else if(E.isLight)w.pushLight(E),E.castShadow&&w.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||et.intersectsSprite(E)){k&&Wt.setFromMatrixPosition(E.matrixWorld).applyMatrix4(yt);let Rt=Q.update(E),vt=E.material;vt.visible&&A.push(E,Rt,vt,q,Wt.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||et.intersectsObject(E))){let Rt=Q.update(E),vt=E.material;if(k&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Wt.copy(E.boundingSphere.center)):(Rt.boundingSphere===null&&Rt.computeBoundingSphere(),Wt.copy(Rt.boundingSphere.center)),Wt.applyMatrix4(E.matrixWorld).applyMatrix4(yt)),Array.isArray(vt)){let Lt=Rt.groups;for(let Bt=0,te=Lt.length;Bt<te;Bt++){let se=Lt[Bt],Ht=vt[se.materialIndex];Ht&&Ht.visible&&A.push(E,Rt,Ht,q,Wt.z,se)}}else vt.visible&&A.push(E,Rt,vt,q,Wt.z,null)}}let Mt=E.children;for(let Rt=0,vt=Mt.length;Rt<vt;Rt++)bl(Mt[Rt],H,q,k)}function uh(E,H,q,k){let{opaque:V,transmissive:Mt,transparent:Rt}=E;w.setupLightsView(q),at===!0&&kt.setGlobalState(R.clippingPlanes,q),k&&_.viewport(tt.copy(k)),V.length>0&&Kr(V,H,q),Mt.length>0&&Kr(Mt,H,q),Rt.length>0&&Kr(Rt,H,q),_.buffers.depth.setTest(!0),_.buffers.depth.setMask(!0),_.buffers.color.setMask(!0),_.setPolygonOffset(!1)}function dh(E,H,q,k){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[k.id]===void 0){let Ht=re.has("EXT_color_buffer_half_float")||re.has("EXT_color_buffer_float");w.state.transmissionRenderTarget[k.id]=new gn(1,1,{generateMipmaps:!0,type:Ht?Xn:hn,minFilter:Ci,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:oe.workingColorSpace})}let Mt=w.state.transmissionRenderTarget[k.id],Rt=k.viewport||tt;Mt.setSize(Rt.z*R.transmissionResolutionScale,Rt.w*R.transmissionResolutionScale);let vt=R.getRenderTarget(),Lt=R.getActiveCubeFace(),Bt=R.getActiveMipmapLevel();R.setRenderTarget(Mt),R.getClearColor(Zt),wt=R.getClearAlpha(),wt<1&&R.setClearColor(16777215,.5),R.clear(),$t&&jt.render(q);let te=R.toneMapping;R.toneMapping=Pn;let se=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),w.setupLightsView(k),at===!0&&kt.setGlobalState(R.clippingPlanes,k),Kr(E,q,k),Z.updateMultisampleRenderTarget(Mt),Z.updateRenderTargetMipmap(Mt),re.has("WEBGL_multisampled_render_to_texture")===!1){let Ht=!1;for(let pe=0,Ie=H.length;pe<Ie;pe++){let Ce=H[pe],{object:ge,geometry:Je,material:At,group:fn}=Ce;if(At.side===He&&ge.layers.test(k.layers)){let he=At.side;At.side=Ze,At.needsUpdate=!0,fh(ge,q,k,Je,At,fn),At.side=he,At.needsUpdate=!0,Ht=!0}}Ht===!0&&(Z.updateMultisampleRenderTarget(Mt),Z.updateRenderTargetMipmap(Mt))}R.setRenderTarget(vt,Lt,Bt),R.setClearColor(Zt,wt),se!==void 0&&(k.viewport=se),R.toneMapping=te}function Kr(E,H,q){let k=H.isScene===!0?H.overrideMaterial:null;for(let V=0,Mt=E.length;V<Mt;V++){let Rt=E[V],{object:vt,geometry:Lt,group:Bt}=Rt,te=Rt.material;te.allowOverride===!0&&k!==null&&(te=k),vt.layers.test(q.layers)&&fh(vt,H,q,Lt,te,Bt)}}function fh(E,H,q,k,V,Mt){E.onBeforeRender(R,H,q,k,V,Mt),E.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),V.onBeforeRender(R,H,q,k,E,Mt),V.transparent===!0&&V.side===He&&V.forceSinglePass===!1?(V.side=Ze,V.needsUpdate=!0,R.renderBufferDirect(q,H,k,V,E,Mt),V.side=ni,V.needsUpdate=!0,R.renderBufferDirect(q,H,k,V,E,Mt),V.side=He):R.renderBufferDirect(q,H,k,V,E,Mt),E.onAfterRender(R,H,q,k,V,Mt)}function Qr(E,H,q){H.isScene!==!0&&(H=Ft);let k=W.get(E),V=w.state.lights,Mt=w.state.shadowsArray,Rt=V.state.version,vt=ft.getParameters(E,V.state,Mt,H,q,w.state.lightProbeGridArray),Lt=ft.getProgramCacheKey(vt),Bt=k.programs;k.environment=E.isMeshStandardMaterial||E.isMeshLambertMaterial||E.isMeshPhongMaterial?H.environment:null,k.fog=H.fog;let te=E.isMeshStandardMaterial||E.isMeshLambertMaterial&&!E.envMap||E.isMeshPhongMaterial&&!E.envMap;k.envMap=ct.get(E.envMap||k.environment,te),k.envMapRotation=k.environment!==null&&E.envMap===null?H.environmentRotation:E.envMapRotation,Bt===void 0&&(E.addEventListener("dispose",Fn),Bt=new Map,k.programs=Bt);let se=Bt.get(Lt);if(se!==void 0){if(k.currentProgram===se&&k.lightsStateVersion===Rt)return mh(E,vt),se}else vt.uniforms=ft.getUniforms(E),P!==null&&E.isNodeMaterial&&P.build(E,q,vt),E.onBeforeCompile(vt,R),se=ft.acquireProgram(vt,Lt),Bt.set(Lt,se),k.uniforms=vt.uniforms;let Ht=k.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Ht.clippingPlanes=kt.uniform),mh(E,vt),k.needsLights=Yd(E),k.lightsStateVersion=Rt,k.needsLights&&(Ht.ambientLightColor.value=V.state.ambient,Ht.lightProbe.value=V.state.probe,Ht.directionalLights.value=V.state.directional,Ht.directionalLightShadows.value=V.state.directionalShadow,Ht.spotLights.value=V.state.spot,Ht.spotLightShadows.value=V.state.spotShadow,Ht.rectAreaLights.value=V.state.rectArea,Ht.ltc_1.value=V.state.rectAreaLTC1,Ht.ltc_2.value=V.state.rectAreaLTC2,Ht.pointLights.value=V.state.point,Ht.pointLightShadows.value=V.state.pointShadow,Ht.hemisphereLights.value=V.state.hemi,Ht.directionalShadowMatrix.value=V.state.directionalShadowMatrix,Ht.spotLightMatrix.value=V.state.spotLightMatrix,Ht.spotLightMap.value=V.state.spotLightMap,Ht.pointShadowMatrix.value=V.state.pointShadowMatrix),k.lightProbeGrid=w.state.lightProbeGridArray.length>0,k.currentProgram=se,k.uniformsList=null,se}function ph(E){if(E.uniformsList===null){let H=E.currentProgram.getUniforms();E.uniformsList=Ns.seqWithValue(H.seq,E.uniforms)}return E.uniformsList}function mh(E,H){let q=W.get(E);q.outputColorSpace=H.outputColorSpace,q.batching=H.batching,q.batchingColor=H.batchingColor,q.instancing=H.instancing,q.instancingColor=H.instancingColor,q.instancingMorph=H.instancingMorph,q.skinning=H.skinning,q.morphTargets=H.morphTargets,q.morphNormals=H.morphNormals,q.morphColors=H.morphColors,q.morphTargetsCount=H.morphTargetsCount,q.numClippingPlanes=H.numClippingPlanes,q.numIntersection=H.numClipIntersection,q.vertexAlphas=H.vertexAlphas,q.vertexTangents=H.vertexTangents,q.toneMapping=H.toneMapping}function Wd(E,H){if(E.length===0)return null;if(E.length===1)return E[0].texture!==null?E[0]:null;y.setFromMatrixPosition(H.matrixWorld);for(let q=0,k=E.length;q<k;q++){let V=E[q];if(V.texture!==null&&V.boundingBox.containsPoint(y))return V}return null}function Xd(E,H,q,k,V){H.isScene!==!0&&(H=Ft),Z.resetTextureUnits();let Mt=H.fog,Rt=k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial?H.environment:null,vt=X===null?R.outputColorSpace:X.isXRRenderTarget===!0?X.texture.colorSpace:oe.workingColorSpace,Lt=k.isMeshStandardMaterial||k.isMeshLambertMaterial&&!k.envMap||k.isMeshPhongMaterial&&!k.envMap,Bt=ct.get(k.envMap||Rt,Lt),te=k.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,se=!!q.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),Ht=!!q.morphAttributes.position,pe=!!q.morphAttributes.normal,Ie=!!q.morphAttributes.color,Ce=Pn;k.toneMapped&&(X===null||X.isXRRenderTarget===!0)&&(Ce=R.toneMapping);let ge=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,Je=ge!==void 0?ge.length:0,At=W.get(k),fn=w.state.lights;if(at===!0&&(it===!0||E!==j)){let ye=E===j&&k.id===Y;kt.setState(k,E,ye)}let he=!1;k.version===At.__version?(At.needsLights&&At.lightsStateVersion!==fn.state.version||At.outputColorSpace!==vt||V.isBatchedMesh&&At.batching===!1||!V.isBatchedMesh&&At.batching===!0||V.isBatchedMesh&&At.batchingColor===!0&&V.colorTexture===null||V.isBatchedMesh&&At.batchingColor===!1&&V.colorTexture!==null||V.isInstancedMesh&&At.instancing===!1||!V.isInstancedMesh&&At.instancing===!0||V.isSkinnedMesh&&At.skinning===!1||!V.isSkinnedMesh&&At.skinning===!0||V.isInstancedMesh&&At.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&At.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&At.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&At.instancingMorph===!1&&V.morphTexture!==null||At.envMap!==Bt||k.fog===!0&&At.fog!==Mt||At.numClippingPlanes!==void 0&&(At.numClippingPlanes!==kt.numPlanes||At.numIntersection!==kt.numIntersection)||At.vertexAlphas!==te||At.vertexTangents!==se||At.morphTargets!==Ht||At.morphNormals!==pe||At.morphColors!==Ie||At.toneMapping!==Ce||At.morphTargetsCount!==Je||!!At.lightProbeGrid!=w.state.lightProbeGridArray.length>0)&&(he=!0):(he=!0,At.__version=k.version);let Sn=At.currentProgram;he===!0&&(Sn=Qr(k,H,V),P&&k.isNodeMaterial&&P.onUpdateProgram(k,Sn,At));let On=!1,ui=!1,rs=!1,xe=Sn.getUniforms(),Pe=At.uniforms;if(_.useProgram(Sn.program)&&(On=!0,ui=!0,rs=!0),k.id!==Y&&(Y=k.id,ui=!0),At.needsLights){let ye=Wd(w.state.lightProbeGridArray,V);At.lightProbeGrid!==ye&&(At.lightProbeGrid=ye,ui=!0)}if(On||j!==E){_.buffers.depth.getReversed()&&E.reversedDepth!==!0&&(E._reversedDepth=!0,E.updateProjectionMatrix()),xe.setValue(U,"projectionMatrix",E.projectionMatrix),xe.setValue(U,"viewMatrix",E.matrixWorldInverse);let fi=xe.map.cameraPosition;fi!==void 0&&fi.setValue(U,gt.setFromMatrixPosition(E.matrixWorld)),C.logarithmicDepthBuffer&&xe.setValue(U,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&xe.setValue(U,"isOrthographic",E.isOrthographicCamera===!0),j!==E&&(j=E,ui=!0,rs=!0)}if(At.needsLights&&(fn.state.directionalShadowMap.length>0&&xe.setValue(U,"directionalShadowMap",fn.state.directionalShadowMap,Z),fn.state.spotShadowMap.length>0&&xe.setValue(U,"spotShadowMap",fn.state.spotShadowMap,Z),fn.state.pointShadowMap.length>0&&xe.setValue(U,"pointShadowMap",fn.state.pointShadowMap,Z)),V.isSkinnedMesh){xe.setOptional(U,V,"bindMatrix"),xe.setOptional(U,V,"bindMatrixInverse");let ye=V.skeleton;ye&&(ye.boneTexture===null&&ye.computeBoneTexture(),xe.setValue(U,"boneTexture",ye.boneTexture,Z))}V.isBatchedMesh&&(xe.setOptional(U,V,"batchingTexture"),xe.setValue(U,"batchingTexture",V._matricesTexture,Z),xe.setOptional(U,V,"batchingIdTexture"),xe.setValue(U,"batchingIdTexture",V._indirectTexture,Z),xe.setOptional(U,V,"batchingColorTexture"),V._colorsTexture!==null&&xe.setValue(U,"batchingColorTexture",V._colorsTexture,Z));let di=q.morphAttributes;if((di.position!==void 0||di.normal!==void 0||di.color!==void 0)&&O.update(V,q,Sn),(ui||At.receiveShadow!==V.receiveShadow)&&(At.receiveShadow=V.receiveShadow,xe.setValue(U,"receiveShadow",V.receiveShadow)),(k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial)&&k.envMap===null&&H.environment!==null&&(Pe.envMapIntensity.value=H.environmentIntensity),Pe.dfgLUT!==void 0&&(Pe.dfgLUT.value=kx()),ui){if(xe.setValue(U,"toneMappingExposure",R.toneMappingExposure),At.needsLights&&qd(Pe,rs),Mt&&k.fog===!0&&Ot.refreshFogUniforms(Pe,Mt),Ot.refreshMaterialUniforms(Pe,k,rt,ot,w.state.transmissionRenderTarget[E.id]),At.needsLights&&At.lightProbeGrid){let ye=At.lightProbeGrid;Pe.probesSH.value=ye.texture,Pe.probesMin.value.copy(ye.boundingBox.min),Pe.probesMax.value.copy(ye.boundingBox.max),Pe.probesResolution.value.copy(ye.resolution)}Ns.upload(U,ph(At),Pe,Z)}if(k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(Ns.upload(U,ph(At),Pe,Z),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&xe.setValue(U,"center",V.center),xe.setValue(U,"modelViewMatrix",V.modelViewMatrix),xe.setValue(U,"normalMatrix",V.normalMatrix),xe.setValue(U,"modelMatrix",V.matrixWorld),k.uniformsGroups!==void 0){let ye=k.uniformsGroups;for(let fi=0,as=ye.length;fi<as;fi++){let gh=ye[fi];nt.update(gh,Sn),nt.bind(gh,Sn)}}return Sn}function qd(E,H){E.ambientLightColor.needsUpdate=H,E.lightProbe.needsUpdate=H,E.directionalLights.needsUpdate=H,E.directionalLightShadows.needsUpdate=H,E.pointLights.needsUpdate=H,E.pointLightShadows.needsUpdate=H,E.spotLights.needsUpdate=H,E.spotLightShadows.needsUpdate=H,E.rectAreaLights.needsUpdate=H,E.hemisphereLights.needsUpdate=H}function Yd(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return z},this.getActiveMipmapLevel=function(){return N},this.getRenderTarget=function(){return X},this.setRenderTargetTextures=function(E,H,q){let k=W.get(E);k.__autoAllocateDepthBuffer=E.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1&&(k.__useRenderToTexture=!1),W.get(E.texture).__webglTexture=H,W.get(E.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:q,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(E,H){let q=W.get(E);q.__webglFramebuffer=H,q.__useDefaultFramebuffer=H===void 0},this.setRenderTarget=function(E,H=0,q=0){X=E,z=H,N=q;let k=null,V=!1,Mt=!1;if(E){let vt=W.get(E);if(vt.__useDefaultFramebuffer!==void 0){_.bindFramebuffer(U.FRAMEBUFFER,vt.__webglFramebuffer),tt.copy(E.viewport),st.copy(E.scissor),Tt=E.scissorTest,_.viewport(tt),_.scissor(st),_.setScissorTest(Tt),Y=-1;return}else if(vt.__webglFramebuffer===void 0)Z.setupRenderTarget(E);else if(vt.__hasExternalTextures)Z.rebindTextures(E,W.get(E.texture).__webglTexture,W.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){let te=E.depthTexture;if(vt.__boundDepthTexture!==te){if(te!==null&&W.has(te)&&(E.width!==te.image.width||E.height!==te.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Z.setupDepthRenderbuffer(E)}}let Lt=E.texture;(Lt.isData3DTexture||Lt.isDataArrayTexture||Lt.isCompressedArrayTexture)&&(Mt=!0);let Bt=W.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Bt[H])?k=Bt[H][q]:k=Bt[H],V=!0):E.samples>0&&Z.useMultisampledRTT(E)===!1?k=W.get(E).__webglMultisampledFramebuffer:Array.isArray(Bt)?k=Bt[q]:k=Bt,tt.copy(E.viewport),st.copy(E.scissor),Tt=E.scissorTest}else tt.copy(Vt).multiplyScalar(rt).floor(),st.copy(ue).multiplyScalar(rt).floor(),Tt=Jt;if(q!==0&&(k=F),_.bindFramebuffer(U.FRAMEBUFFER,k)&&_.drawBuffers(E,k),_.viewport(tt),_.scissor(st),_.setScissorTest(Tt),V){let vt=W.get(E.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+H,vt.__webglTexture,q)}else if(Mt){let vt=H;for(let Lt=0;Lt<E.textures.length;Lt++){let Bt=W.get(E.textures[Lt]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+Lt,Bt.__webglTexture,q,vt)}}else if(E!==null&&q!==0){let vt=W.get(E.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,vt.__webglTexture,q)}Y=-1},this.readRenderTargetPixels=function(E,H,q,k,V,Mt,Rt,vt=0){if(!(E&&E.isWebGLRenderTarget)){Yt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Lt=W.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Rt!==void 0&&(Lt=Lt[Rt]),Lt){_.bindFramebuffer(U.FRAMEBUFFER,Lt);try{let Bt=E.textures[vt],te=Bt.format,se=Bt.type;if(E.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+vt),!C.textureFormatReadable(te)){Yt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!C.textureTypeReadable(se)){Yt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}H>=0&&H<=E.width-k&&q>=0&&q<=E.height-V&&U.readPixels(H,q,k,V,mt.convert(te),mt.convert(se),Mt)}finally{let Bt=X!==null?W.get(X).__webglFramebuffer:null;_.bindFramebuffer(U.FRAMEBUFFER,Bt)}}},this.readRenderTargetPixelsAsync=async function(E,H,q,k,V,Mt,Rt,vt=0){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Lt=W.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Rt!==void 0&&(Lt=Lt[Rt]),Lt)if(H>=0&&H<=E.width-k&&q>=0&&q<=E.height-V){_.bindFramebuffer(U.FRAMEBUFFER,Lt);let Bt=E.textures[vt],te=Bt.format,se=Bt.type;if(E.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+vt),!C.textureFormatReadable(te))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!C.textureTypeReadable(se))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Ht=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,Ht),U.bufferData(U.PIXEL_PACK_BUFFER,Mt.byteLength,U.STREAM_READ),U.readPixels(H,q,k,V,mt.convert(te),mt.convert(se),0);let pe=X!==null?W.get(X).__webglFramebuffer:null;_.bindFramebuffer(U.FRAMEBUFFER,pe);let Ie=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await Eu(U,Ie,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,Ht),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,Mt),U.deleteBuffer(Ht),U.deleteSync(Ie),Mt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(E,H=null,q=0){let k=Math.pow(2,-q),V=Math.floor(E.image.width*k),Mt=Math.floor(E.image.height*k),Rt=H!==null?H.x:0,vt=H!==null?H.y:0;Z.setTexture2D(E,0),U.copyTexSubImage2D(U.TEXTURE_2D,q,0,0,Rt,vt,V,Mt),_.unbindTexture()},this.copyTextureToTexture=function(E,H,q=null,k=null,V=0,Mt=0){let Rt,vt,Lt,Bt,te,se,Ht,pe,Ie,Ce=E.isCompressedTexture?E.mipmaps[Mt]:E.image;if(q!==null)Rt=q.max.x-q.min.x,vt=q.max.y-q.min.y,Lt=q.isBox3?q.max.z-q.min.z:1,Bt=q.min.x,te=q.min.y,se=q.isBox3?q.min.z:0;else{let Pe=Math.pow(2,-V);Rt=Math.floor(Ce.width*Pe),vt=Math.floor(Ce.height*Pe),E.isDataArrayTexture?Lt=Ce.depth:E.isData3DTexture?Lt=Math.floor(Ce.depth*Pe):Lt=1,Bt=0,te=0,se=0}k!==null?(Ht=k.x,pe=k.y,Ie=k.z):(Ht=0,pe=0,Ie=0);let ge=mt.convert(H.format),Je=mt.convert(H.type),At;H.isData3DTexture?(Z.setTexture3D(H,0),At=U.TEXTURE_3D):H.isDataArrayTexture||H.isCompressedArrayTexture?(Z.setTexture2DArray(H,0),At=U.TEXTURE_2D_ARRAY):(Z.setTexture2D(H,0),At=U.TEXTURE_2D),_.activeTexture(U.TEXTURE0),_.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,H.flipY),_.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,H.premultiplyAlpha),_.pixelStorei(U.UNPACK_ALIGNMENT,H.unpackAlignment);let fn=_.getParameter(U.UNPACK_ROW_LENGTH),he=_.getParameter(U.UNPACK_IMAGE_HEIGHT),Sn=_.getParameter(U.UNPACK_SKIP_PIXELS),On=_.getParameter(U.UNPACK_SKIP_ROWS),ui=_.getParameter(U.UNPACK_SKIP_IMAGES);_.pixelStorei(U.UNPACK_ROW_LENGTH,Ce.width),_.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Ce.height),_.pixelStorei(U.UNPACK_SKIP_PIXELS,Bt),_.pixelStorei(U.UNPACK_SKIP_ROWS,te),_.pixelStorei(U.UNPACK_SKIP_IMAGES,se);let rs=E.isDataArrayTexture||E.isData3DTexture,xe=H.isDataArrayTexture||H.isData3DTexture;if(E.isDepthTexture){let Pe=W.get(E),di=W.get(H),ye=W.get(Pe.__renderTarget),fi=W.get(di.__renderTarget);_.bindFramebuffer(U.READ_FRAMEBUFFER,ye.__webglFramebuffer),_.bindFramebuffer(U.DRAW_FRAMEBUFFER,fi.__webglFramebuffer);for(let as=0;as<Lt;as++)rs&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,W.get(E).__webglTexture,V,se+as),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,W.get(H).__webglTexture,Mt,Ie+as)),U.blitFramebuffer(Bt,te,Rt,vt,Ht,pe,Rt,vt,U.DEPTH_BUFFER_BIT,U.NEAREST);_.bindFramebuffer(U.READ_FRAMEBUFFER,null),_.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(V!==0||E.isRenderTargetTexture||W.has(E)){let Pe=W.get(E),di=W.get(H);_.bindFramebuffer(U.READ_FRAMEBUFFER,B),_.bindFramebuffer(U.DRAW_FRAMEBUFFER,D);for(let ye=0;ye<Lt;ye++)rs?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Pe.__webglTexture,V,se+ye):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Pe.__webglTexture,V),xe?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,di.__webglTexture,Mt,Ie+ye):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,di.__webglTexture,Mt),V!==0?U.blitFramebuffer(Bt,te,Rt,vt,Ht,pe,Rt,vt,U.COLOR_BUFFER_BIT,U.NEAREST):xe?U.copyTexSubImage3D(At,Mt,Ht,pe,Ie+ye,Bt,te,Rt,vt):U.copyTexSubImage2D(At,Mt,Ht,pe,Bt,te,Rt,vt);_.bindFramebuffer(U.READ_FRAMEBUFFER,null),_.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else xe?E.isDataTexture||E.isData3DTexture?U.texSubImage3D(At,Mt,Ht,pe,Ie,Rt,vt,Lt,ge,Je,Ce.data):H.isCompressedArrayTexture?U.compressedTexSubImage3D(At,Mt,Ht,pe,Ie,Rt,vt,Lt,ge,Ce.data):U.texSubImage3D(At,Mt,Ht,pe,Ie,Rt,vt,Lt,ge,Je,Ce):E.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,Mt,Ht,pe,Rt,vt,ge,Je,Ce.data):E.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,Mt,Ht,pe,Ce.width,Ce.height,ge,Ce.data):U.texSubImage2D(U.TEXTURE_2D,Mt,Ht,pe,Rt,vt,ge,Je,Ce);_.pixelStorei(U.UNPACK_ROW_LENGTH,fn),_.pixelStorei(U.UNPACK_IMAGE_HEIGHT,he),_.pixelStorei(U.UNPACK_SKIP_PIXELS,Sn),_.pixelStorei(U.UNPACK_SKIP_ROWS,On),_.pixelStorei(U.UNPACK_SKIP_IMAGES,ui),Mt===0&&H.generateMipmaps&&U.generateMipmap(At),_.unbindTexture()},this.initRenderTarget=function(E){W.get(E).__webglFramebuffer===void 0&&Z.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?Z.setTextureCube(E,0):E.isData3DTexture?Z.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?Z.setTexture2DArray(E,0):Z.setTexture2D(E,0),_.unbindTexture()},this.resetState=function(){z=0,N=0,X=null,_.reset(),St.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return In}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=oe._getDrawingBufferColorSpace(t),e.unpackColorSpace=oe._getUnpackColorSpace()}};function Vx(i){let t=i>>>0;return()=>{t+=1831565813;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var an=Vx(19870219),lt=(i,t)=>i+an()*(t-i),Ue=i=>i[an()*i.length|0],oi=i=>an()<i,ji=i=>"#"+i.toString(16).padStart(6,"0"),Xe={sun:16766116,skyTop:4159147,skyMid:9681362,skyHaze:14472125,cloud:16774112,asphalt:5066580,paver:11577496,kerb:11907236,conc:11052187,trim:14209731,glassBlue:6058371,glassGrey:6976122,leafDark:2833697,leafMid:4875312,leafLight:7768383,trunk:5457981,yellow:14201930};function li(i){let t=document.createElement("canvas");return t.width=t.height=i,[t,t.getContext("2d")]}function ci(i,t,e=!0){let n=new Zi(i);return n.wrapS=n.wrapT=Ms,t&&n.repeat.set(t[0],t[1]),e&&(n.colorSpace=Oe),n.anisotropy=4,n}function $c(i,t,e,n){for(let s=0;s<t;s++){let r=(an()*2-1)*e;i.fillStyle=`rgba(${r>0?255:0},${r>0?255:0},${r>0?255:0},${Math.abs(r)/255})`,i.fillRect(an()*n|0,an()*n|0,1+(an()*2|0),1+(an()*2|0))}}function ld(){let[t,e]=li(256);e.fillStyle=ji(Xe.asphalt),e.fillRect(0,0,256,256);for(let n=0;n<5200;n++){let s=lt(-24,24);e.fillStyle=`rgba(${128+s},${128+s},${130+s},${lt(.05,.24)})`,e.fillRect(lt(0,256),lt(0,256),lt(1,2.6),lt(1,2.6))}for(let n=0;n<8;n++){e.strokeStyle=`rgba(28,28,30,${lt(.15,.4)})`,e.lineWidth=lt(.8,2.4),e.beginPath();let s=lt(0,256),r=lt(0,256);e.moveTo(s,r);for(let a=0;a<6;a++)s+=lt(-40,40),r+=lt(-40,40),e.lineTo(s,r);e.stroke()}return ci(t,[30,30])}function cd(){let[t,e]=li(256);e.fillStyle=ji(Xe.paver),e.fillRect(0,0,256,256);let n=3,s=256/n;for(let r=0;r<n;r++)for(let a=0;a<n;a++){let o=lt(-13,11);e.fillStyle=`rgb(${178+o},${170+o},${154+o})`,e.fillRect(a*s+1.6,r*s+1.6,s-3.2,s-3.2);for(let l=0;l<260;l++){let c=lt(-30,26);e.fillStyle=`rgba(${170+c},${163+c},${148+c},${lt(.2,.6)})`,e.fillRect(a*s+lt(2,s-3),r*s+lt(2,s-3),lt(1,2.4),lt(1,2.4))}}return $c(e,2600,18,256),ci(t,[1,1])}function Di(i,t=.55){let[n,s]=li(256);s.fillStyle=ji(i),s.fillRect(0,0,256,256);for(let r=0;r<24;r++){let a=lt(0,256),o=lt(0,256),l=lt(18,70),c=s.createRadialGradient(a,o,0,a,o,l);c.addColorStop(0,`rgba(0,0,0,${lt(.02,.07)*t})`),c.addColorStop(1,"rgba(0,0,0,0)"),s.fillStyle=c,s.fillRect(0,0,256,256)}for(let r=0;r<34;r++){let a=lt(.6,2.6),o=lt(30,170),l=lt(0,256),c=lt(0,256*.5),u=s.createLinearGradient(0,c,0,c+o);u.addColorStop(0,`rgba(54,48,40,${lt(.05,.15)*t})`),u.addColorStop(1,"rgba(54,48,40,0)"),s.fillStyle=u,s.fillRect(l,c,a,o)}return $c(s,4800,24,256),ci(n,[1,1])}function Os(i,t,e=8){let[s,r]=li(256),a=256/e;r.fillStyle=ji(i),r.fillRect(0,0,256,256);for(let o=0;o<e;o++){for(let c=0;c<8;c++){let u=lt(-26,30);r.fillStyle=`rgba(${118+u},${138+u},${156+u},${lt(.25,.75)})`,r.fillRect(c*(256/8)+1,o*a+2,256/8-2,a*.62)}r.fillStyle=ji(t),r.fillRect(0,o*a+a*.66,256,a*.3);let l=r.createLinearGradient(0,o*a,0,o*a+a*.62);l.addColorStop(0,"rgba(232,243,251,0.52)"),l.addColorStop(1,"rgba(232,243,251,0.06)"),r.fillStyle=l,r.fillRect(0,o*a+2,256,a*.6)}r.fillStyle=ji(t);for(let o=0;o<=8;o++)r.fillRect(o*(256/8)-1.2,0,2.4,256);return ci(s,[1,1])}function al(){let[t,e]=li(256);e.fillStyle="#2f3438",e.fillRect(0,0,256,256);let n=6,s=256/n;for(let r=0;r<n;r++){let a=lt(0,1),o=a>.72?[232,214,178]:a>.4?[206,200,190]:[176,182,186];e.fillStyle=`rgb(${o[0]},${o[1]},${o[2]})`,e.fillRect(r*s+3,16,s-6,194),e.fillStyle=`rgba(40,38,34,${lt(.18,.4)})`,e.fillRect(r*s+3,16,s-6,lt(20,60));let l=e.createLinearGradient(r*s,0,r*s+s,256);l.addColorStop(0,"rgba(255,255,255,0.22)"),l.addColorStop(.5,"rgba(255,255,255,0.02)"),l.addColorStop(1,"rgba(255,255,255,0.14)"),e.fillStyle=l,e.fillRect(r*s+3,16,s-6,194),e.fillStyle="#23272a",e.fillRect(r*s-2,0,4,256)}return e.fillStyle="#3a3f43",e.fillRect(0,0,256,16),e.fillStyle="#5b5554",e.fillRect(0,210,256,46),$c(e,1800,16,256),ci(t,[1,1])}function hd(){let[t,e]=li(256);e.fillStyle="#7d4f42",e.fillRect(0,0,256,256);for(let r=0;r<4200;r++){let a=lt(-20,22);e.fillStyle=`rgba(${142+a},${94+a},${78+a},${lt(.15,.5)})`,e.fillRect(lt(0,256),lt(0,256),lt(1,2.4),lt(1,2.4))}let n=9,s=256/n;for(let r=0;r<n;r++){e.fillStyle="rgba(38,44,50,0.86)",e.fillRect(r*s+s*.3,0,s*.4,256);let a=e.createLinearGradient(r*s,0,r*s+s,0);a.addColorStop(0,"rgba(198,214,226,0.16)"),a.addColorStop(1,"rgba(198,214,226,0)"),e.fillStyle=a,e.fillRect(r*s+s*.3,0,s*.4,256)}for(let r=0;r<8;r++)e.fillStyle="rgba(104,68,58,0.9)",e.fillRect(0,r*(256/8)-2,256,4);return ci(t,[1,1])}function Jc(){let[t,e]=li(256);e.fillStyle="#8ea6b8",e.fillRect(0,0,256,256);let n=12,s=256/n;for(let r=0;r<n;r++){for(let o=0;o<10;o++){let l=lt(-24,26);e.fillStyle=`rgba(${132+l},${154+l},${172+l},${lt(.3,.8)})`,e.fillRect(o*(256/10)+1,r*s+1,256/10-2,s*.72)}e.fillStyle="#6b757e",e.fillRect(0,r*s+s*.76,256,s*.22);let a=e.createLinearGradient(0,r*s,0,r*s+s*.72);a.addColorStop(0,"rgba(236,245,252,0.42)"),a.addColorStop(1,"rgba(236,245,252,0.04)"),e.fillStyle=a,e.fillRect(0,r*s+1,256,s*.7)}for(let r=0;r<=10;r++)e.fillStyle="#767f88",e.fillRect(r*(256/10)-1,0,2,256);return ci(t,[1,1])}function ud(){let[t,e]=li(128);e.clearRect(0,0,128,128);let n=e.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);n.addColorStop(0,"rgba(34,50,25,0.85)"),n.addColorStop(.7,"rgba(34,50,25,0.34)"),n.addColorStop(1,"rgba(34,50,25,0)"),e.fillStyle=n,e.fillRect(0,0,128,128);let s=[Xe.leafDark,Xe.leafDark,Xe.leafMid,Xe.leafMid,Xe.leafLight];for(let r=0;r<460;r++){let a=lt(0,128),o=lt(0,128),l=Math.hypot(a-128/2,o-128/2)/(128/2);l>.99||an()<l*l*.9||(e.save(),e.translate(a,o),e.rotate(lt(0,Math.PI*2)),e.fillStyle=ji(Ue(s)),e.globalAlpha=lt(.5,1),e.beginPath(),e.ellipse(0,0,lt(2.6,7),lt(1,2.1),0,0,Math.PI*2),e.fill(),e.restore())}return ci(t,null)}function dd(){let[t,e]=li(128),n=e.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);return n.addColorStop(0,"rgba(0,0,0,0.52)"),n.addColorStop(.55,"rgba(0,0,0,0.2)"),n.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=n,e.fillRect(0,0,128,128),ci(t,null,!1)}function Ui(i){let t=0,e=0;for(let[d,g]of i)t+=d,e+=g;t/=i.length,e/=i.length;let n=0,s=0,r=0;for(let[d,g]of i){let v=d-t,m=g-e;n+=v*v,s+=v*m,r+=m*m}let a=.5*Math.atan2(2*s,n-r),o=Math.cos(a),l=Math.sin(a),c=1e9,u=-1e9,f=1e9,h=-1e9;for(let[d,g]of i){let v=d-t,m=g-e,p=v*o+m*l,S=-v*l+m*o;c=Math.min(c,p),u=Math.max(u,p),f=Math.min(f,S),h=Math.max(h,S)}return{cx:t,cz:e,ux:o,uz:l,ang:a,halfLong:(u-c)/2,halfShort:(h-f)/2,midU:(u+c)/2,midV:(h+f)/2}}function Un(i,t,e,n,s,r,a,o,l,c=0){let u=new Ct(new Et(s,o,r),l),f=t.cx+t.ux*e-t.uz*n,h=t.cz+t.uz*e+t.ux*n;return u.position.set(f,a+o/2,h),u.rotation.y=-t.ang+c,u.castShadow=!0,u.receiveShadow=!0,i.world.add(u),u}function kr(i,t,e,n,s,r,a,o){Un(i,t,e,n,s*1.06,r*1.06,a,1.2,o),Un(i,t,e,n,s*.55,r*.55,a+1.2,3,o)}function ol(i,t){if(!i.axis)return{nx:0,nz:1,dist:30};let e=0,n=0,s=1/0;for(let[l,c]of i.axis.p){let u=(l-t.cx)**2+(c-t.cz)**2;u<s&&(s=u,e=l,n=c)}let r=e-t.cx,a=n-t.cz,o=Math.hypot(r,a)||1;return{nx:r/o,nz:a/o,dist:o}}function Wx(i,t){let e=Ui(t.p),n=i.mat.granite,s=i.mat.towerGlass,r=i.mat.paleStone;i.world.add(i.extrude(t.p,30,n)),i.world.add(i.extrude(i.grow(t.p,1.004),1.6,r,30));let a=Math.min(38,e.halfShort*1.05);for(let h of[-1,1]){let d=e.midU+h*e.halfLong*.4;Un(i,e,d,e.midV,a,a,31.6,107,n);for(let g of[-1,1])Un(i,e,d,e.midV+g*(a/2+.15),a*.82,.4,34,100,s);kr(i,e,d,e.midV,a,a,138.6,r)}let o=ol(i,e),l=e.cx+o.nx*(e.halfShort+17),c=e.cz+o.nz*(e.halfShort+17),u=Math.atan2(o.nx,o.nz),f=new Ct(new Et(62,.5,34),i.mat.paving);f.position.set(l,.25,c),f.rotation.y=u,f.receiveShadow=!0,i.world.add(f);for(let h=0;h<3;h++){let d=new Ct(new Et(62,.18,1.1),i.mat.paleStone);d.position.set(l+o.nx*(17+h*1.1),.42-h*.16,c+o.nz*(17+h*1.1)),d.rotation.y=u,d.receiveShadow=!0,d.castShadow=!0,i.world.add(d)}for(let h of[-1,1]){let d=new Ct(new Et(2.2,.85,30),n);d.position.set(l-o.nz*h*29,.68,c+o.nx*h*29),d.rotation.y=u,d.castShadow=!0,d.receiveShadow=!0,i.world.add(d)}}function Xx(i,t){let e=Ui(t.p),n=i.mat.towerGlass,s=i.mat.paleStone;i.world.add(i.extrude(t.p,34,n)),i.world.add(i.extrude(i.grow(t.p,1.05),1.1,s,20.5)),i.world.add(i.extrude(i.grow(t.p,1.02),1.4,s,34));let r=Math.min(30,e.halfShort*.75);Un(i,e,e.midU-e.halfLong*.12,e.midV,r,r*.78,35.4,176,n),kr(i,e,e.midU-e.halfLong*.12,e.midV,r,r*.78,211,s);let a=ol(i,e),o=Math.atan2(a.nx,a.nz),l=e.cx+a.nx*(e.halfShort+4),c=e.cz+a.nz*(e.halfShort+4),u=new Dt({color:12174537,roughness:.28,metalness:.45,side:He}),f=new Ct(new ne(17,17,Math.min(74,e.halfLong*1.9),22,1,!0,Math.PI*.06,Math.PI*.62),u);f.rotation.z=Math.PI/2,f.rotation.y=o,f.position.set(l,20.5,c),f.castShadow=!0,i.world.add(f);for(let d of[-1,1]){let g=new Ct(new ne(.75,1.9,20,10),u);g.position.set(l-a.nz*d*17,10,c+a.nx*d*17),g.castShadow=!0,i.world.add(g)}let h=new Ct(new ze(Math.min(58,e.halfLong*1.5),13),new Dt({color:1119772,roughness:.25,emissive:3108776,emissiveIntensity:.85}));h.position.set(e.cx+a.nx*(e.halfShort+.4),12.5,e.cz+a.nz*(e.halfShort+.4)),h.rotation.y=o,i.world.add(h)}function qx(i,t){let e=Ui(t.p),n=i.mat.jadeRoof,s=i.mat.warmStone,r=i.mat.towerGlass;i.world.add(i.extrude(t.p,19,s));let a=e.halfShort*2*.98,o=e.halfLong*2*.98,l=new Ct(new ri(Math.max(a,o)*.62,9.5,4),n);l.position.set(e.cx,23.6,e.cz),l.rotation.y=-e.ang+Math.PI/4,l.castShadow=!0,i.world.add(l);let c=Math.min(26,e.halfShort*.9),u=e.midU+e.halfLong*.42;Un(i,e,u,e.midV,c,c*.72,19,121,s);for(let v=0;v<30;v++)Un(i,e,u,e.midV-c*.36,c*.9,.25,22+v*3.9,2.3,r);let f=new Ct(new be(1.05,10,8),n);f.position.set(e.cx,28.9,e.cz),f.castShadow=!0,i.world.add(f);let h=new Ct(new ri(.42,3.4,8),n);h.position.set(e.cx,31,e.cz),h.castShadow=!0,i.world.add(h);let d=new Ct(new ri(Math.max(a,o)*.4,6,4),n);d.position.set(e.cx,27.2,e.cz),d.rotation.y=-e.ang+Math.PI/4,d.castShadow=!0,i.world.add(d);let g=new Ct(new ri(c*.75,7,4),n);g.position.set(e.cx+e.ux*u-e.uz*e.midV,143.5,e.cz+e.uz*u+e.ux*e.midV),g.rotation.y=-e.ang+Math.PI/4,g.castShadow=!0,i.world.add(g)}function Yx(i,t){let e=Ui(t.p),n=i.mat.paleStone,s=i.mat.towerGlass;i.world.add(i.extrude(t.p,26,s));for(let a=0;a<7;a++)i.world.add(i.extrude(i.grow(t.p,1.008),.32,i.mat.trim,4+a*3.4));let r=Math.min(30,e.halfShort*.95);Un(i,e,e.midU+e.halfLong*.25,e.midV,r,r*.8,26,44,s),kr(i,e,e.midU+e.halfLong*.25,e.midV,r,r*.8,70,n)}function Zx(i,t){let e=Ui(t.p),n=i.mat.towerGlass,s=i.mat.paleStone;/wisma atria/i.test(t.n||"")&&(n=i.mat.blueGlass);let r=Math.min(30,t.h*.42);if(i.world.add(i.extrude(t.p,r,n)),i.world.add(i.extrude(i.grow(t.p,1.03),1,s,r-1)),t.h>r+12){let a=Math.min(28,e.halfShort*.85);Un(i,e,e.midU,e.midV,a,a*.8,r,t.h-r,n),kr(i,e,e.midU,e.midV,a,a*.8,t.h,s)}}function $x(i,t){let e=Ui(t.p);i.world.add(i.extrude(t.p,t.h,i.mat.warmStone));let n=Math.max(6,Math.round(e.halfLong*2/4.2));for(let s=0;s<=n;s++){let r=e.midU-e.halfLong+s/n*e.halfLong*2;for(let a of[-1,1])Un(i,e,r,e.midV+a*(e.halfShort+.2),.5,.9,5,t.h-6,i.mat.paleStone)}i.world.add(i.extrude(i.grow(t.p,1.02),1.1,i.mat.trim,t.h))}function Jx(i,t){let e=Ui(t.p),n=i.mat.towerGlass,s=i.mat.paleStone;i.world.add(i.extrude(t.p,22,n));let r=Math.min(26,e.halfShort*.9);Un(i,e,e.midU,e.midV,r,r*.82,22,66,n),kr(i,e,e.midU,e.midV,r,r*.82,88,s);let a=ol(i,e),o=e.cx+a.nx*(e.halfShort*.62),l=e.cz+a.nz*(e.halfShort*.62),c=new Dt({color:10467014,roughness:.12,metalness:.25,transparent:!0,opacity:.72,side:He}),u=new Ct(new ri(11.5,27,18,6,!0),c);u.position.set(o,13.5,l),u.castShadow=!0,i.world.add(u);for(let f=0;f<12;f++){let h=f/12*Math.PI*2,d=new Ct(new Et(.22,27.4,.22),i.mat.metal);d.position.set(o+Math.cos(h)*5.6,13.6,l+Math.sin(h)*5.6),d.rotation.z=Math.cos(h)*.2,d.rotation.x=-Math.sin(h)*.2,d.castShadow=!0,i.world.add(d)}}function Kx(i,t){let e=Ui(t.p),n=i.mat.towerGlass,s=i.mat.paleStone;i.world.add(i.extrude(t.p,t.h,n));let r=ol(i,e);for(let a=0;a<5;a++){let o=12+a*9.5;if(o>t.h-8)break;let l=new Ct(new Et(Math.min(20,e.halfLong*.9),4.2,3.4),new Dt({color:2896697,roughness:.6}));l.position.set(e.cx+r.nx*(e.halfShort-.6),o,e.cz+r.nz*(e.halfShort-.6)),l.rotation.y=Math.atan2(r.nx,r.nz),i.world.add(l);let c=new Ct(new Et(Math.min(20,e.halfLong*.9),.35,4.6),s);c.position.set(e.cx+r.nx*(e.halfShort+.9),o-2,e.cz+r.nz*(e.halfShort+.9)),c.rotation.y=Math.atan2(r.nx,r.nz),c.castShadow=!0,i.world.add(c)}i.world.add(i.extrude(i.grow(t.p,1.02),1,s,t.h));for(let a=0;a<7;a++){let o=new Ct(new be(1.5,8,6),new De({color:4152371}));o.position.set(e.cx+lt(-e.halfLong*.6,e.halfLong*.6),t.h+2,e.cz+lt(-e.halfShort*.6,e.halfShort*.6)),o.scale.y=.7,o.castShadow=!0,i.world.add(o)}}var Qx=[[/ngee ann city|takashimaya/i,Wx],[/ion orchard|orchard residences/i,Xx],[/tang plaza|singapore marriott|^tangs/i,qx],[/paragon/i,Yx],[/wheelock/i,Jx],[/orchard central/i,Kx],[/wisma atria|313|orchard gateway|shaw (house|centre)|mandarin gallery|the heeren/i,Zx],[/lucky plaza|far east plaza|orchard towers|midpoint|palais|delfi|orchard plaza|cairnhill|tripleone/i,$x]];function fd(i){if(!i)return null;for(let[t,e]of Qx)if(t.test(i))return e;return null}var ll={asphalt:ld(),paving:cd(),leaf:ud(),ao:dd()},jx=[Os(8230054,5989742,8),Os(9148578,7041656,7),Os(7311242,5070684,9),Os(10130308,7170658,6),Os(8688543,4147024,10)],t_=[al(),al(),al()],pd=[Di(11774618,.5),Di(10261642,.6),Di(12760480,.45),Di(9276038,.7)],zt={asphalt:new Dt({map:ll.asphalt,roughness:.95}),paving:new Dt({map:ll.paving,roughness:.9}),kerb:new Dt({color:Xe.kerb,roughness:.86}),conc:new Dt({map:Di(Xe.conc,.7),roughness:.92}),trim:new Dt({color:Xe.trim,roughness:.8}),white:new Dt({color:14605008,roughness:.85}),yellow:new Dt({color:Xe.yellow,roughness:.85}),metal:new Dt({color:9146259,roughness:.5,metalness:.4}),darkMetal:new Dt({color:3882820,roughness:.6,metalness:.3}),glass:new Dt({color:5464429,roughness:.14,metalness:.18}),leaf:new De({map:ll.leaf,transparent:!1,alphaTest:.42,side:He}),canopy:new De({color:2371866}),trunk:new Dt({color:Xe.trunk,roughness:.95}),ao:new Vn({map:ll.ao,transparent:!0,blending:Rr,premultipliedAlpha:!0,depthWrite:!1})},e_={granite:new Dt({map:hd(),roughness:.3,metalness:.12}),towerGlass:new Dt({map:Jc(),roughness:.22,metalness:.16}),blueGlass:new Dt({map:Jc(),color:10470621,roughness:.18,metalness:.2}),paleStone:new Dt({map:Di(12893614,.35),roughness:.78}),warmStone:new Dt({map:Di(11707535,.5),roughness:.85}),jadeRoof:new Dt({color:3104586,roughness:.45,metalness:.2})},ZM=new L(0,1,0);function n_(i){let t=0;for(let e=0;e<i.length;e++){let[n,s]=i[e],[r,a]=i[(e+1)%i.length];t+=n*a-r*s}return t/2}function i_(i){let t=n_(i)<0?[...i].reverse():i,e=new Rs;e.moveTo(t[0][0],t[0][1]);for(let n=1;n<t.length;n++)e.lineTo(t[n][0],t[n][1]);return e.closePath(),e}function Vr(i){let t=0,e=0;for(let n of i)t+=n[0],e+=n[1];return[t/i.length,e/i.length]}function md(i){let t=0;for(let e=0;e<i.length;e++){let n=i[e],s=i[(e+1)%i.length];t+=Math.hypot(s[0]-n[0],s[1]-n[1])}return t}function ts(i,t,e,n=0){let s=new vr(i_(i),{depth:t,bevelEnabled:!1,curveSegments:1});s.rotateX(Math.PI/2),s.translate(0,n+t,0);let r=new Ct(s,e);return r.castShadow=!0,r.receiveShadow=!0,r}function Kc(i,t){let e=Vr(i);return i.map(([n,s])=>[e[0]+(n-e[0])*t,e[1]+(s-e[1])*t])}function xd(i,t){let e={count:0,tall:0,bespoke:0},n={world:i,extrude:ts,grow:Kc,axis:t.axis||null,mat:{...e_,trim:zt.trim,conc:zt.conc,paving:zt.paving,metal:zt.metal}};for(let s of t.buildings){let r=s.p;if(r.length<3)continue;let a=fd(s.n);if(a){a(n,s),gd(i,s,md(r)),e.count++,e.bespoke++;continue}let o=s.a>1400||s.k,l=(o?Ue(jx):Ue(pd)).clone();l.needsUpdate=!0;let c=new Dt({map:l,roughness:o?.34:.88,metalness:o?.08:0}),u=md(r);l.repeat.set(Math.max(1,u/26),Math.max(1,s.h/28));let f=s.h;if(s.k&&f>70){let h=Math.min(34,f*.28);i.add(ts(r,h,new Dt({map:Ue(pd),roughness:.8})));let d=Vr(r),g=r.map(([v,m])=>[d[0]+(v-d[0])*.62,d[1]+(m-d[1])*.62]);i.add(ts(g,f-h,c,h)),e.tall++}else if(i.add(ts(r,f,c)),f>8){let h=Vr(r),d=r.map(([g,v])=>[h[0]+(g-h[0])*1.008,h[1]+(v-h[1])*1.008]);i.add(ts(d,.7,zt.trim,f))}if(gd(i,s,u),s.a>900&&f>12){let h=Vr(r);for(let d=0;d<3;d++){let g=new Ct(new Et(lt(3,7),lt(1.6,3.4),lt(3,6)),zt.conc);g.position.set(h[0]+lt(-8,8),f+lt(1,1.8),h[1]+lt(-8,8)),g.castShadow=!0,i.add(g)}}e.count++}return e}function gd(i,t,e){if(t.a<=600||t.h<=7)return;let n=t.p,s=Ue(t_).clone();s.needsUpdate=!0,s.repeat.set(Math.max(2,e/15),1),i.add(ts(Kc(n,1.012),5.4,new Dt({map:s,roughness:.32,metalness:.05}))),i.add(ts(Kc(n,1.055),.42,zt.trim,5.3));let r=0,a=0;for(let o=0;o<n.length;o++){let l=n[o],c=n[(o+1)%n.length],u=Math.hypot(c[0]-l[0],c[1]-l[1]);u>a&&(a=u,r=o)}if(a>16){let o=n[r],l=n[(r+1)%n.length],c=(o[0]+l[0])/2,u=(o[1]+l[1])/2,f=Math.atan2(l[0]-o[0],l[1]-o[1]),h=Vr(n),d=c-h[0],g=u-h[1],v=Math.hypot(d,g)||1,m=Math.min(18,a*.34),p=new Ct(new Et(m,.5,4.4),zt.trim);p.position.set(c+d/v*1.9,6.1,u+g/v*1.9),p.rotation.y=f+Math.PI/2,p.castShadow=!0,i.add(p);for(let S of[-1,1]){let b=new Ct(new ne(.12,.12,6,8),zt.metal);b.position.set(c+d/v*3.6+Math.sin(f)*S*m*.42,3,u+g/v*3.6+Math.cos(f)*S*m*.42),b.castShadow=!0,i.add(b)}}}function s_(i,t,e){let n=new Be,s=[],r=[],a=0;for(let o=0;o<i.length-1;o++){let[l,c]=i[o],[u,f]=i[o+1],h=u-l,d=f-c,g=Math.hypot(h,d);if(g<.01)continue;let v=-d/g*t/2,m=h/g*t/2,p=[l-v,e,c-m],S=[l+v,e,c+m],b=[u+v,e,f+m],y=[u-v,e,f-m];s.push(...p,...S,...b,...p,...b,...y);let A=a/t,w=(a+g)/t;r.push(0,A,1,A,1,w,0,A,1,w,0,w),a+=g}return n.setAttribute("position",new ce(s,3)),n.setAttribute("uv",new ce(r,2)),n.computeVertexNormals(),n}function r_(i){let t=0;for(let e=0;e<i.length-1;e++)t+=Math.hypot(i[e+1][0]-i[e][0],i[e+1][1]-i[e][1]);return t}function _d(i,t){let e=[],n=[],s=null,r=1/0;for(let o of t.roads){let l=o.k==="footway"||o.k==="pedestrian",c=l?.02:.055,u=s_(o.p,o.w,c);if(!(!u.attributes.position||u.attributes.position.count===0)&&((l?n:e).push(u),/orchard road/i.test(o.n||"")&&r_(o.p)>120)){let f=1/0;for(let[h,d]of o.p)f=Math.min(f,h*h+d*d);f<r&&(r=f,s=o)}}let a=(o,l)=>{if(!o.length)return;let c=0;for(let m of o)c+=m.attributes.position.count;let u=new Float32Array(c*3),f=new Float32Array(c*2),h=0,d=0;for(let m of o)u.set(m.attributes.position.array,h),h+=m.attributes.position.array.length,f.set(m.attributes.uv.array,d),d+=m.attributes.uv.array.length;let g=new Be;g.setAttribute("position",new ce(u,3)),g.setAttribute("uv",new ce(f,2)),g.computeVertexNormals();let v=new Ct(g,l);v.receiveShadow=!0,i.add(v)};return a(e,zt.asphalt),a(n,zt.paving),s}var Wr=class{constructor(){this.items=[]}add(t,e,n=1){this.items.push([t,e,n])}build(t){let e=this.items.length;if(!e)return 0;let n=30,s=3,r=4,a=new Le(new ne(.24,.52,1,8),zt.trunk,e),o=new Le(new ne(.07,.2,1,5),zt.trunk,e*r),l=new Le(new Mr(1,0),zt.canopy,e*s),c=new Le(new ze(1,.55),zt.leaf,e*n);a.castShadow=o.castShadow=l.castShadow=c.castShadow=!0;let u=new ee,f=new we,h=new ve,d=new L,g=new L,v=0,m=0,p=0;return this.items.forEach(([S,b,y],A)=>{let w=lt(8.5,12.5)*y,T=lt(5.2,7.2)*y;d.set(S,w/2,b),h.identity(),g.set(y,w,y),u.compose(d,h,g),a.setMatrixAt(A,u);for(let x=0;x<r;x++){let M=x/r*Math.PI*2+lt(-.3,.3),R=lt(1.8,3)*y;d.set(S+Math.cos(M)*R*.22,w*lt(.8,.96),b+Math.sin(M)*R*.22),f.set(Math.cos(M)*.55,0,-Math.sin(M)*.55),h.setFromEuler(f),g.set(y,R,y),u.compose(d,h,g),o.setMatrixAt(v++,u)}for(let x=0;x<s;x++){let M=T*lt(.16,.24);d.set(S+lt(-.45,.45)*T,w*lt(.94,1.06),b+lt(-.45,.45)*T),h.identity(),g.set(M,M*.5,M),u.compose(d,h,g),l.setMatrixAt(m++,u)}for(let x=0;x<n;x++){let M=an()*Math.PI*2,R=T*Math.sqrt(an())*1.12;d.set(S+Math.cos(M)*R,w*lt(.92,1.06)-R*.13+lt(-.4,.4),b+Math.sin(M)*R),f.set(lt(-1.5,-.7),M+lt(-.7,.7),lt(-.4,.4)),h.setFromEuler(f);let I=T*lt(.45,.8);g.set(I,I,I),u.compose(d,h,g),c.setMatrixAt(p++,u)}}),o.count=v,l.count=m,c.count=p,t.add(a,o,l,c),e}};var nn={vMax:11.6,vReverse:2.4,accel:5,reverseAccel:2.6,brake:11,coast:1.35,drag:.016,wheelbase:1.32,steerMax:.62,steerFalloff:.045,leanMax:.62,leanRate:5};function cl(i=0,t=0,e=0){return{x:i,z:t,heading:e,speed:0,lean:0,yaw:0,wheel:0,revHold:0,reversing:!1}}function Qc(i,t,e,n,s){e>0?(i.revHold=0,i.reversing=!1):n>0&&i.speed<=.03?i.revHold+=t:n===0&&(i.revHold=0,i.speed>=-.02&&(i.reversing=!1)),i.revHold>.35&&(i.reversing=!0);let r;if(i.reversing?r=-n*nn.reverseAccel:r=e*nn.accel-n*nn.brake*(i.speed>0?1:0),Math.abs(i.speed)>.05){let u=Math.sign(i.speed);r-=u*(nn.coast+nn.drag*i.speed*i.speed)}i.speed=Math.max(-nn.vReverse,Math.min(nn.vMax,i.speed+r*t)),!i.reversing&&e===0&&Math.abs(i.speed)<.12&&(i.speed=0),i.reversing&&n===0&&Math.abs(i.speed)<.12&&(i.speed=0,i.reversing=!1);let a=1/(1+nn.steerFalloff*i.speed*i.speed),o=s*nn.steerMax*a,l=i.speed/nn.wheelbase*Math.tan(o);i.yaw=l,i.heading-=l*t;let c=Math.max(-nn.leanMax,Math.min(nn.leanMax,l*i.speed*.11));return i.lean+=(c-i.lean)*Math.min(1,nn.leanRate*t),i.x+=Math.sin(i.heading)*i.speed*t,i.z+=Math.cos(i.heading)*i.speed*t,i.wheel+=i.speed/.21*t,i}var a_=10470584,o_=15262418,l_=13028046;function me(i,t,e,n,s,r=0,a=0,o=0){let l=new Ct(i,t);return l.position.set(e,n,s),l.rotation.set(r,a,o),l.castShadow=!0,l}function yd(){let i=new Se,t=new Dt({color:a_,roughness:.35,metalness:.25}),e=new Dt({color:o_,roughness:.5}),n=new Dt({color:l_,roughness:.22,metalness:.85}),s=new Dt({color:2435116,roughness:.85}),r=new Dt({color:5522223,roughness:.62}),a=new Dt({color:14214378,roughness:.1,metalness:.1,transparent:!0,opacity:.55}),o=new be(.3,14,12);i.add(me(o,t,.26,.52,-.3)),i.add(me(o,t,-.26,.52,-.3));let l=i.children[i.children.length-1],c=i.children[i.children.length-2];l.scale.set(.72,.95,1.55),c.scale.set(.72,.95,1.55),i.add(me(new Et(.42,.3,.86),t,0,.56,-.26)),i.add(me(new Et(.46,.055,.62),e,0,.3,.28)),i.add(me(new Et(.5,.62,.1),t,0,.62,.6,-.3)),i.add(me(new Et(.44,.3,.09),e,0,.4,.66,-.3));let u=me(new Ae(.13,.42,4,8),r,0,.79,-.16,0,0,Math.PI/2);u.scale.set(1,1,1.15),i.add(u),i.add(me(new ne(.055,.055,.62,8),n,0,.86,.66,-.28)),i.add(me(new ne(.028,.028,.66,6),n,0,1.09,.6,0,0,Math.PI/2));for(let v of[-.3,.3])i.add(me(new ne(.035,.035,.14,6),s,v,1.09,.6,0,0,Math.PI/2)),i.add(me(new ne(.012,.012,.2,5),n,v*.9,1.2,.6)),i.add(me(new bi(.055,10),n,v*.9,1.3,.6,0,v>0?.5:-.5,0));let f=me(new be(.115,12,10),n,0,.99,.74);f.scale.set(1,1,.62),i.add(f),i.add(me(new bi(.095,12),new Dt({color:16774360,roughness:.2,emissive:16771504,emissiveIntensity:.35}),0,.99,.8)),i.add(me(new Et(.44,.34,.02),a,0,1.32,.66,-.24));let h=new ne(.205,.205,.115,16),d=new ne(.115,.115,.12,12),g=[];for(let[v,m]of[[.62,!0],[-.52,!1]]){let p=new Se;p.add(me(h,s,0,0,0,0,0,Math.PI/2)),p.add(me(d,e,0,0,0,0,0,Math.PI/2)),p.position.set(0,.205,v),i.add(p),g.push(p),m&&(i.add(me(new Et(.07,.44,.07),n,.1,.42,v,-.16)),i.add(me(new Et(.28,.05,.34),t,0,.45,v+.02)))}return i.add(me(new ne(.045,.055,.42,8),n,.24,.3,-.44,0,0,Math.PI/2.4)),{group:i,wheels:g}}function vd(){let i=new Se,t=new De({color:13194559}),e=new De({color:3686735}),n=new De({color:9071186}),s=new Dt({color:15131352,roughness:.3,metalness:.1}),r=new Dt({color:2765112,roughness:.1,metalness:.3}),a=me(new Ae(.17,.4,4,10),t,0,1.16,-.1,-.22);i.add(a);let o=me(new be(.135,14,12),s,0,1.55,-.02);i.add(o),i.add(me(new be(.118,12,10),r,0,1.545,.055));for(let l of[-.13,.13])i.add(me(new Ae(.085,.3,4,8),e,l,.9,.1,Math.PI/2.3)),i.add(me(new Ae(.072,.28,4,8),e,l,.58,.3,.22)),i.add(me(new be(.062,8,7),e,l,.36,.34)),i.add(me(new Ae(.055,.4,4,8),t,l*1.7,1.2,.26,Math.PI/2.6)),i.add(me(new be(.05,8,7),n,l*2.3,1.09,.56));return i}var c_=new URLSearchParams(location.search),eh=c_.has("touch")||matchMedia("(pointer: coarse)").matches||navigator.maxTouchPoints>0,un={steer:0,throttle:0,brake:0,moveX:0,moveY:0,run:!1,toggleMode:!1},jc=0,th=0,Ne=new Set;addEventListener("keydown",i=>{Ne.add(i.code),(i.code==="KeyE"||i.code==="KeyF")&&(un.toggleMode=!0),["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(i.code)&&i.preventDefault()});addEventListener("keyup",i=>Ne.delete(i.code));var Xr=new Map;function h_(i){return i<innerWidth*.5?"power":"steer"}function Md(i){let t=s=>{window.__touchFired=(window.__touchFired||0)+1;for(let r of s.changedTouches)Xr.set(r.identifier,{startX:r.clientX,startY:r.clientY,x:r.clientX,y:r.clientY,px:r.clientX,py:r.clientY,side:h_(r.clientX)});s.preventDefault()},e=s=>{for(let r of s.changedTouches){let a=Xr.get(r.identifier);a&&(a.x=r.clientX,a.y=r.clientY)}s.preventDefault()},n=s=>{for(let r of s.changedTouches)Xr.delete(r.identifier)};i.addEventListener("touchstart",t,{passive:!1}),i.addEventListener("touchmove",e,{passive:!1}),i.addEventListener("touchend",n,{passive:!0}),i.addEventListener("touchcancel",n,{passive:!0})}function Sd(i){let t=!1,e=0,n=0;i.addEventListener("mousedown",s=>{t=!0,e=s.clientX,n=s.clientY}),addEventListener("mouseup",()=>{t=!1}),addEventListener("mousemove",s=>{t&&(jc+=s.clientX-e,th+=s.clientY-n,e=s.clientX,n=s.clientY)})}function bd(i){let t=0,e=0,n=0,s=0,r=0,a=jc,o=th;jc=0,th=0;for(let l of Xr.values()){if(l.side==="power")if(i==="walk"){let c=innerWidth*.09;s=Math.max(-1,Math.min(1,(l.x-l.startX)/c)),r=Math.max(-1,Math.min(1,(l.y-l.startY)/c))}else l.y<innerHeight*.62?e=1:n=1;else i==="walk"?(a+=l.x-l.px,o+=l.y-l.py):t=Math.max(-1,Math.min(1,(l.x-l.startX)/(innerWidth*.14)));l.px=l.x,l.py=l.y}return i==="walk"?((Ne.has("KeyA")||Ne.has("ArrowLeft"))&&(s=-1),(Ne.has("KeyD")||Ne.has("ArrowRight"))&&(s=1),(Ne.has("KeyW")||Ne.has("ArrowUp"))&&(r=-1),(Ne.has("KeyS")||Ne.has("ArrowDown"))&&(r=1)):((Ne.has("KeyA")||Ne.has("ArrowLeft"))&&(t=-1),(Ne.has("KeyD")||Ne.has("ArrowRight"))&&(t=1),(Ne.has("KeyW")||Ne.has("ArrowUp"))&&(e=1),(Ne.has("KeyS")||Ne.has("ArrowDown")||Ne.has("Space"))&&(n=1)),un.steer=t,un.throttle=e,un.brake=n,un.moveX=s,un.moveY=r,un.run=Ne.has("ShiftLeft")||Ne.has("ShiftRight"),{steer:t,throttle:e,brake:n,moveX:s,moveY:r,lookDX:a,lookDY:o,run:un.run}}function Ed(){return[...Xr.values()].map(i=>`${i.side}@${i.x|0},${i.y|0}`).join(" ")}var hl={speed:1.85,runSpeed:4.1,accel:9,turnRate:9};function wd(i=0,t=0,e=0){return{x:i,z:t,heading:e,speed:0,phase:0}}function Td(i,t,e,n,s){let r=Math.min(1,Math.hypot(e,n)),a=r*(s?hl.runSpeed:hl.speed);if(i.speed+=(a-i.speed)*Math.min(1,hl.accel*t),r>.05){let l=Math.atan2(e,n)-i.heading;for(;l>Math.PI;)l-=Math.PI*2;for(;l<-Math.PI;)l+=Math.PI*2;i.heading+=l*Math.min(1,hl.turnRate*t)}return i.phase+=i.speed*t*2.4,i.x+=Math.sin(i.heading)*i.speed*t,i.z+=Math.cos(i.heading)*i.speed*t,i}function Ad(){let i=new Se,t=new De({color:13194559}),e=new De({color:3686735}),n=new De({color:9071186}),s=new De({color:2366486}),r=(d,g,v,m,p)=>{let S=new Ct(d,g);return S.position.set(v,m,p),S.castShadow=!0,i.add(S),S},a=r(new Ae(.135,.36,4,10),t,0,1.24,0),o=r(new Ae(.125,.1,3,8),e,0,.95,0),l=r(new be(.112,14,12),n,0,1.62,0);r(new be(.119,14,10,0,Math.PI*2,0,Math.PI*.6),s,0,1.64,0);let c=r(new Ae(.048,.42,3,8),t,-.2,1.22,0),u=r(new Ae(.048,.42,3,8),t,.2,1.22,0),f=r(new Ae(.062,.46,3,8),e,-.09,.53,0),h=r(new Ae(.062,.46,3,8),e,.09,.53,0);return{group:i,pose(d,g){let v=g>.1?Math.sin(d*2.4):0;c.rotation.x=v*.7,u.rotation.x=-v*.7,f.rotation.x=-v*.8,h.rotation.x=v*.8;let m=g>.1?Math.abs(Math.cos(d*2.4))*.03:0;a.position.y=1.24+m,l.position.y=1.62+m,o.position.y=.95+m}}}var qr=new Dt({color:14605008,roughness:.86}),u_=new Dt({color:14069316,roughness:.86});function Bs(i,t,e,n,s){if(!t.length)return 0;let r=new ze(e,n),a=new Le(r,s,t.length),o=new ee,l=new ve,c=new we,u=new L,f=new L(1,1,1);return t.forEach((h,d)=>{u.set(h[0],h[1],h[2]),c.set(-Math.PI/2,h[3],0,"YXZ"),l.setFromEuler(c),o.compose(u,l,f),a.setMatrixAt(d,o)}),a.receiveShadow=!0,i.add(a),t.length}function Rd(i,t){let e=t.p,n=t.w/2,s=[],r=[],a=[],o=[],l=[],c=[],u=0;for(let h=0;h<e.length-1;h++){let[d,g]=e[h],[v,m]=e[h+1],p=v-d,S=m-g,b=Math.hypot(p,S);if(b<.5)continue;let y=p/b,A=S/b,w=-A,T=y,x=Math.atan2(y,A);for(let M=0;M<b;M+=1,u++){let R=d+y*M,I=g+A*M;if(u%9<3)for(let P of[-3.6,3.6])s.push([R+w*P,.075,I+T*P,x]);if(u%2===0)for(let P of[-1,1])r.push([R+w*(n-.55)*P,.075,I+T*(n-.55)*P,x]);if(u%2===0)for(let P of[-1,1])a.push([R+w*(n-.12)*P,.078,I+T*(n-.12)*P,x]),a.push([R+w*(n-.34)*P,.078,I+T*(n-.34)*P,x]);if(u%190===24)for(let P of[-1,1])o.push([R+w*(n*.5)*P,.08,I+T*(n*.5)*P,x+Math.PI/2]);if(u%190===60||u%190===140)for(let P of[-5.4,-1.9,1.9,5.4])l.push([R+w*P,.08,I+T*P,x]),c.push([R+w*P+y*1.9,.08,I+T*P+A*1.9,x])}}let f=0;return f+=Bs(i,s,.14,1,qr),f+=Bs(i,r,.12,2,qr),f+=Bs(i,a,.1,2,u_),f+=Bs(i,o,.42,n*.92,qr),f+=Bs(i,l,.28,3.2,qr),f+=Bs(i,c,.92,.9,qr),f}function Cd(i,t,e,n,s){let r=new s,a=[],o=[],l=[],c=0;for(let S of t.roads){if(!S.n||/orchard road/i.test(S.n)||S.k==="footway"||S.k==="pedestrian"||S.k==="service")continue;let b=S.p,y=S.w/2,A=0;for(let T=0;T<b.length-1;T++)A+=Math.hypot(b[T+1][0]-b[T][0],b[T+1][1]-b[T][1]);if(A<45)continue;c++;let w=0;for(let T=0;T<b.length-1;T++){let[x,M]=b[T],[R,I]=b[T+1],P=R-x,F=I-M,B=Math.hypot(P,F);if(B<.5)continue;let D=P/B,z=F/B,N=-z,X=D,Y=Math.atan2(D,z);for(let j=0;j<B;j+=4,w+=4){let tt=x+D*j,st=M+z*j;for(let Tt of[-1,1]){let Zt=tt+N*(y+.4)*Tt,wt=st+X*(y+.4)*Tt;if(n(Zt,wt)||a.push([Zt,.15,wt,Y]),w%44===0){let J=tt+N*(y+2.8)*Tt,ot=st+X*(y+2.8)*Tt;n(J,ot)||r.add(J,ot,lt(.6,.9))}w%96===0&&!n(Zt,wt)&&(o.push([Zt,3.6,wt,Y]),l.push([Zt-N*.9*Tt,7,wt-X*.9*Tt,Y,Tt]))}}}}let u=new ee,f=new ve,h=new we,d=new L,g=new L(1,1,1),v=(S,b,y,A)=>{if(!y.length)return;let w=new Le(S,b,y.length);y.forEach((T,x)=>{A(T),u.compose(d,f,g),w.setMatrixAt(x,u)}),w.castShadow=!0,w.receiveShadow=!0,i.add(w)},m=S=>{d.set(S[0],S[1],S[2]),h.set(0,S[3],0),f.setFromEuler(h)};v(new Et(.38,.3,4),zt.kerb,a,m),v(new ne(.09,.13,7.2,8),zt.metal,o,m),v(new Et(.9,.16,.4),zt.trim,l,S=>{d.set(S[0],S[1],S[2]),h.set(0,S[3],0),f.setFromEuler(h)});let p=r.build(i);return{sideRoads:c,sideTrees:p,sideKerbs:a.length}}var Id=[11876142,2051962,14067004,3107663,8011629,13593402,2830131,11022927,4026255],d_=[11680302,3107727,13672506,3504725,9060208];function yn(i,t,e,n,s,r){let a=new Ct(i,t);return a.position.set(e,n,s),a.rotation.y=r,a.castShadow=!0,a.receiveShadow=!0,a}function Pd(i,t,e,n,s){let r=new Se,a=zt.metal,o=zt.darkMetal,l=s/2+1.2;for(let f of[-1,1])r.add(yn(new ne(.22,.28,7.4,10),a,f*l,3.7,0,0)),r.add(yn(new Et(1.2,.35,1.2),zt.conc,f*l,.18,0,0));r.add(yn(new Et(s+2.8,.85,.55),a,0,7.2,0,0)),r.add(yn(new Et(s+2.8,.28,.32),a,0,6.4,0,0));let c=Math.max(3,Math.round(s/3.4));for(let f=0;f<c;f++){let h=-s/2+(f+.5)*(s/c),d=yn(new Et(.62,.3,.85),o,h,6.75,.5,0);d.rotation.x=.42,r.add(d)}for(let f of[-1,1])r.add(yn(new Et(.4,.4,.75),o,f*(l-1.4),6.9,-.5,0));let u=yn(new Et(2.4,.9,.12),new Dt({color:1842978,emissive:13208094,emissiveIntensity:.55}),0,8.1,.1,0);r.add(u),r.position.set(t,0,e),r.rotation.y=n,i.add(r)}function f_(i,t,e,n,s){let r=new Se,a=zt.metal,o=zt.conc,l=s+14;r.add(yn(new Et(l,.42,2.6),o,0,6,0,0)),r.add(yn(new Et(l,.16,3),zt.trim,0,8.6,0,0));for(let c of[-1,1]){r.add(yn(new Et(l,1.05,.1),a,0,6.75,c*1.3,0));for(let u=0;u<=10;u++){let f=-l/2+u/10*l;r.add(yn(new ne(.055,.055,2.4,6),a,f,7.4,c*1.3,0))}}for(let c of[-1,1]){let u=c*(l/2-1);r.add(yn(new Et(2.6,6,2.8),o,u,3,c*3.2,0));for(let f=0;f<12;f++)r.add(yn(new Et(2.2,.16,.34),o,u,.5+f*.46,c*(1.9+f*.2),0))}r.position.set(t,0,e),r.rotation.y=n,i.add(r)}function Ld(i,t,e,n){let s=t.p,r=t.w/2,a={erp:0,bridges:0,banners:0,medianPlants:0,roofSigns:0,banners2:0},o=[],l=[],c=[],u=[],f=0;for(let T=0;T<s.length-1;T++){let[x,M]=s[T],[R,I]=s[T+1],P=R-x,F=I-M,B=Math.hypot(P,F);if(B<.5)continue;let D=P/B,z=F/B,N=-z,X=D,Y=Math.atan2(D,z);for(let j=0;j<B;j+=1,f++){let tt=x+D*j,st=M+z*j;if(f%3===0&&l.push([tt,.14,st,Y]),f%7===0&&c.push([tt+N*lt(-.45,.45),.72,st+X*lt(-.45,.45),Y]),f%46===0&&u.push([tt,0,st,Y]),f%34===8)for(let Tt of[-1,1]){let Zt=tt+N*(r+.4)*Tt,wt=st+X*(r+.4)*Tt;n(Zt,wt)||o.push([Zt+N*.28*Tt,5.4,wt+X*.28*Tt,Y])}f===300&&(Pd(i,tt,st,Y,t.w),a.erp++),f===700&&(Pd(i,tt,st,Y,t.w),a.erp++),(f===470||f===940)&&(f_(i,tt,st,Y,t.w),a.bridges++)}}let h=new ee,d=new ve,g=new we,v=new L,m=new L(1,1,1),p=new Gt,S=(T,x,M,R,I)=>{if(!M.length)return;let P=new Le(T,x,M.length);M.forEach((F,B)=>{R(F),h.compose(v,d,m),P.setMatrixAt(B,h),I&&P.setColorAt(B,I())}),P.instanceColor&&(P.instanceColor.needsUpdate=!0),P.castShadow=!0,P.receiveShadow=!0,i.add(P)},b=T=>{v.set(T[0],T[1],T[2]),g.set(0,T[3],0),d.setFromEuler(g)};S(new Et(2.1,.34,3),zt.kerb,l,b),S(new be(.66,7,5),new De({color:4152371}),c,T=>{v.set(T[0],.72,T[2]),d.identity(),m.set(1,.78,1)}),m.set(1,1,1),a.medianPlants=c.length,S(new ne(.14,.2,6.4,7),zt.trunk,u,T=>{v.set(T[0],3.2,T[2]),d.identity()});let y=[];for(let[T,,x]of u)for(let M=0;M<7;M++)y.push([T,6.3,x,M/7*Math.PI*2]);S(new ze(3.2,.8),zt.leaf,y,T=>{v.set(T[0]+Math.sin(T[3])*1.4,T[1]-.35,T[2]+Math.cos(T[3])*1.4),g.set(-.95,T[3]+Math.PI/2,0,"YXZ"),d.setFromEuler(g)}),S(new Et(.06,1.6,.62),new Dt({roughness:.8,side:He}),o,b,()=>p.setHex(Ue(d_))),a.banners=o.length;let A=[],w=[];for(let T of e.buildings){if(T.a<700)continue;let x=0,M=0;for(let j of T.p)x+=j[0],M+=j[1];x/=T.p.length,M/=T.p.length;let R=0,I=0;for(let j=0;j<T.p.length;j++){let tt=T.p[j],st=T.p[(j+1)%T.p.length],Tt=Math.hypot(st[0]-tt[0],st[1]-tt[1]);Tt>I&&(I=Tt,R=j)}let P=T.p[R],F=T.p[(R+1)%T.p.length],B=(P[0]+F[0])/2,D=(P[1]+F[1])/2,z=Math.atan2(F[0]-P[0],F[1]-P[1]),N=B-x,X=D-M,Y=Math.hypot(N,X)||1;T.h>34&&oi(.55)&&A.push([B+N/Y*.6,T.h+2.2,D+X/Y*.6,z+Math.PI/2,Math.min(16,I*.4)]),T.h>14&&I>12&&oi(.7)&&w.push([B+N/Y*1.1,9.5,D+X/Y*1.1,z+Math.PI/2])}if(A.length){let T=new Le(new Et(1,3.2,.5),new Dt({roughness:.6}),A.length);A.forEach((x,M)=>{v.set(x[0],x[1],x[2]),g.set(0,x[3],0),d.setFromEuler(g),m.set(x[4],1,1),h.compose(v,d,m),T.setMatrixAt(M,h),T.setColorAt(M,p.setHex(Ue(Id)))}),T.instanceColor&&(T.instanceColor.needsUpdate=!0),T.castShadow=!0,i.add(T),m.set(1,1,1)}return S(new Et(.9,7.5,.35),new Dt({roughness:.55}),w,b,()=>p.setHex(Ue(Id))),a.roofSigns=A.length,a.banners2=w.length,a}var ul=class{constructor(){this.ready=!1,this.muted=!1,this._lastStep=0}start(){if(this.ready)return;let t=window.AudioContext||window.webkitAudioContext;if(!t)return;let e=new t;this.ctx=e,e.state==="suspended"&&e.resume(),this.master=e.createGain(),this.master.gain.value=0,this.master.connect(e.destination),this.engineGain=e.createGain(),this.engineGain.gain.value=0,this.engineFilter=e.createBiquadFilter(),this.engineFilter.type="lowpass",this.engineFilter.frequency.value=420,this.engineFilter.Q.value=3.2,this.engineFilter.connect(this.engineGain),this.engineGain.connect(this.master),this.osc1=e.createOscillator(),this.osc1.type="sawtooth",this.osc1.frequency.value=46,this.osc2=e.createOscillator(),this.osc2.type="sawtooth",this.osc2.frequency.value=46*2.01,this.osc3=e.createOscillator(),this.osc3.type="square",this.osc3.frequency.value=46*.5;let n=e.createGain();n.gain.value=.45;let s=e.createGain();s.gain.value=.3,this.osc1.connect(this.engineFilter),this.osc2.connect(n),n.connect(this.engineFilter),this.osc3.connect(s),s.connect(this.engineFilter),this.lfo=e.createOscillator(),this.lfo.frequency.value=5.5,this.lfoGain=e.createGain(),this.lfoGain.gain.value=1.6,this.lfo.connect(this.lfoGain),this.lfoGain.connect(this.osc1.frequency);let r=e.sampleRate*2,a=e.createBuffer(1,r,e.sampleRate),o=a.getChannelData(0),l=0;for(let c=0;c<r;c++){let u=Math.random()*2-1;l=(l+.02*u)/1.02,o[c]=l*3.2}this.noiseBuf=a,this.wind=e.createBufferSource(),this.wind.buffer=a,this.wind.loop=!0,this.windFilter=e.createBiquadFilter(),this.windFilter.type="bandpass",this.windFilter.frequency.value=700,this.windFilter.Q.value=.7,this.windGain=e.createGain(),this.windGain.gain.value=0,this.wind.connect(this.windFilter),this.windFilter.connect(this.windGain),this.windGain.connect(this.master),this.amb=e.createBufferSource(),this.amb.buffer=a,this.amb.loop=!0,this.ambFilter=e.createBiquadFilter(),this.ambFilter.type="lowpass",this.ambFilter.frequency.value=320,this.ambGain=e.createGain(),this.ambGain.gain.value=.16,this.amb.connect(this.ambFilter),this.ambFilter.connect(this.ambGain),this.ambGain.connect(this.master),this.osc1.start(),this.osc2.start(),this.osc3.start(),this.lfo.start(),this.wind.start(),this.amb.start(),this.master.gain.setTargetAtTime(this.muted?0:.55,e.currentTime,.4),this.ready=!0}setMuted(t){this.muted=t,this.ready&&this.master.gain.setTargetAtTime(t?0:.55,this.ctx.currentTime,.15)}update(t,e,n,s){if(!this.ready||this.muted)return;let r=this.ctx.currentTime,a=Math.abs(t);if(e==="ride"){let o=44+Math.pow(a,.86)*9.4;this.osc1.frequency.setTargetAtTime(o,r,.06),this.osc2.frequency.setTargetAtTime(o*2.01,r,.06),this.osc3.frequency.setTargetAtTime(o*.5,r,.06),this.engineFilter.frequency.setTargetAtTime(380+a*165,r,.1),this.engineGain.gain.setTargetAtTime(.1+Math.min(.3,a*.028),r,.12),this.windGain.gain.setTargetAtTime(Math.min(.3,a*a*.0022),r,.2),this.windFilter.frequency.setTargetAtTime(520+a*60,r,.2)}else if(this.engineGain.gain.setTargetAtTime(0,r,.25),this.windGain.gain.setTargetAtTime(0,r,.3),n>.3){let o=Math.floor(s*2.4/Math.PI);o!==this._lastStep&&(this._lastStep=o,this._footstep(n))}}_footstep(t){let e=this.ctx,n=e.currentTime,s=e.createBufferSource();s.buffer=this.noiseBuf,s.playbackRate.value=1.6;let r=e.createBiquadFilter();r.type="bandpass",r.frequency.value=1150,r.Q.value=1.1;let a=e.createGain();a.gain.setValueAtTime(0,n),a.gain.linearRampToValueAtTime(.055*Math.min(1,t/2),n+.008),a.gain.exponentialRampToValueAtTime(1e-4,n+.13),s.connect(r),r.connect(a),a.connect(this.master),s.start(n,Math.random()*1.5),s.stop(n+.16)}};var dl=class{constructor(t){this.pts=t,this.cum=[0];for(let e=0;e<t.length-1;e++)this.cum.push(this.cum[e]+Math.hypot(t[e+1][0]-t[e][0],t[e+1][1]-t[e][1]));this.len=this.cum[this.cum.length-1]}nearestS(t,e){let n=0,s=1/0;for(let r=0;r<this.pts.length;r++){let a=(this.pts[r][0]-t)**2+(this.pts[r][1]-e)**2;a<s&&(s=a,n=this.cum[r])}return n}at(t,e){let n=(t%this.len+this.len)%this.len,s=0,r=this.cum.length-1;for(;s<r-1;){let h=s+r>>1;this.cum[h]<=n?s=h:r=h}let a=this.pts[s],o=this.pts[Math.min(s+1,this.pts.length-1)],l=Math.max(1e-4,this.cum[s+1]-this.cum[s]),c=(n-this.cum[s])/l,u=(o[0]-a[0])/l,f=(o[1]-a[1])/l;return e[0]=a[0]+(o[0]-a[0])*c,e[1]=a[1]+(o[1]-a[1])*c,e[2]=u,e[3]=f,e}},p_=[9268046,11043422,7295288,12819058,8215616],m_=[1840914,2760986,1183500,4009762,5588024],g_=[13194559,15262420,3100014,14271625,9080726,7176026,11903172,3885650,13994602,4878196,14734008,9194069],x_=[3356735,2831168,4867904,5854044,7498334,2040875],fl=class{constructor(t,e,n=150){this.path=new dl(t.p),this.half=t.w/2,this.isBlocked=e,this.count=n,this.people=[]}build(t){let e=this.count,n=(c,u)=>{let f=new Le(c,u,e);return f.castShadow=!0,f.frustumCulled=!1,t.add(f),f},s=c=>new De(c?{color:c}:{});this.head=n(new be(.105,12,10),s()),this.hair=n(new be(.112,12,8,0,Math.PI*2,0,Math.PI*.62),s()),this.torso=n(new Ae(.125,.34,4,10),s()),this.hips=n(new Ae(.115,.1,3,8),s()),this.armL=n(new Ae(.045,.4,3,7),s()),this.armR=n(new Ae(.045,.4,3,7),s()),this.legL=n(new Ae(.058,.44,3,7),s()),this.legR=n(new Ae(.058,.44,3,7),s()),this.bag=n(new Et(.22,.26,.1),s());let r=new Gt,a=new Gt,o=new Gt,l=new Gt;for(let c=0;c<e;c++){let u=oi(.5)?1:-1,f=oi(.5)?1:-1,h={s:an()*this.path.len,off:u*(this.half+lt(3.2,10.5)),dir:f,speed:lt(.95,1.65)*(oi(.12)?0:1),phase:an()*Math.PI*2,scale:lt(.92,1.08),hasBag:oi(.38),bagSide:oi(.5)?1:-1};this.people.push(h),r.setHex(Ue(g_)),a.setHex(Ue(x_)),o.setHex(Ue(p_)),l.setHex(Ue(m_)),this.torso.setColorAt(c,r),this.armL.setColorAt(c,r),this.armR.setColorAt(c,r),this.hips.setColorAt(c,a),this.legL.setColorAt(c,a),this.legR.setColorAt(c,a),this.head.setColorAt(c,o),this.hair.setColorAt(c,l),this.bag.setColorAt(c,a)}for(let c of[this.torso,this.armL,this.armR,this.hips,this.legL,this.legR,this.head,this.hair,this.bag])c.instanceColor&&(c.instanceColor.needsUpdate=!0);return this._m=new ee,this._q=new ve,this._e=new we,this._p=new L,this._s=new L(1,1,1),this._tmp=[0,0,0,0],this.update(0,0),e}update(t,e,n=1e9,s=1e9){let{_m:r,_q:a,_e:o,_p:l,_s:c,_tmp:u}=this,f=this._hidden||(this._hidden=new ee().makeTranslation(0,-9999,0));for(let h=0;h<this.people.length;h++){let d=this.people[h];d.s+=d.dir*d.speed*e,this.path.at(d.s,u);let[g,v,m,p]=u,S=-p,b=m,y=g+S*d.off,A=v+b*d.off,w=y-n,T=A-s,x=Math.hypot(w,T);if(x<2.6){let N=(2.6-x)/2.6;d.dodge=(d.dodge||0)+(N*1.5-(d.dodge||0))*Math.min(1,e*5)}else d.dodge&&(d.dodge+=(0-d.dodge)*Math.min(1,e*2.2),Math.abs(d.dodge)<.01&&(d.dodge=0));let M=d.off>=0?1:-1,R=y+S*(d.dodge||0)*M,I=A+b*(d.dodge||0)*M;if(this.isBlocked(R,I)){for(let N of[this.head,this.hair,this.torso,this.hips,this.armL,this.armR,this.legL,this.legR,this.bag])N.setMatrixAt(h,f);continue}let P=Math.atan2(m*d.dir,p*d.dir),F=d.scale,B=d.speed>.1?Math.sin(t*5.2*(d.speed/1.3)+d.phase):0,D=d.speed>.1?Math.abs(Math.cos(t*5.2+d.phase))*.022:0,z=(N,X,Y,j,tt,st)=>{let Tt=R+(S*X+m*j),Zt=I+(b*X+p*j);l.set(Tt,Y*F+D,Zt),o.set(tt||0,P,st||0,"YXZ"),a.setFromEuler(o),c.set(F,F,F),r.compose(l,a,c),N.setMatrixAt(h,r)};z(this.head,0,1.615,.01),z(this.hair,0,1.635,.005),z(this.torso,0,1.22,0),z(this.hips,0,.94,0),z(this.armL,-.19,1.2,0,B*.62),z(this.armR,.19,1.2,0,-B*.62),z(this.legL,-.085,.52,0,-B*.72),z(this.legR,.085,.52,0,B*.72),d.hasBag?z(this.bag,d.bagSide*.26,1.02,-.06):this.bag.setMatrixAt(h,f)}for(let h of[this.head,this.hair,this.torso,this.hips,this.armL,this.armR,this.legL,this.legR,this.bag])h.instanceMatrix.needsUpdate=!0}},__=[14211806,2830392,9409948,8007466,2572382,12172480,4016703],pl=class{constructor(t,e=16,n=3){this.path=new dl(t.p),this.half=t.w/2,this.nCars=e,this.nBuses=n,this.items=[]}build(t,e=0){let n=this.nCars,s=this.nBuses,r=(h,d,g)=>{let v=new Le(h,d,g);return v.castShadow=!0,v.receiveShadow=!0,v.frustumCulled=!1,t.add(v),v},a=new Dt({roughness:.38,metalness:.3}),o=new Dt({color:2765370,roughness:.12,metalness:.2}),l=new Dt({color:2369323,roughness:.85});this.body=r(new Et(1.78,.62,4.32),a,n),this.roof=r(new Et(1.64,.5,2.1),a,n),this.glaze=r(new Et(1.69,.38,2),o,n),this.wheel=r(new ne(.31,.31,.2,10),l,n*4),this.busBody=r(new Et(2.5,2.5,11.8),new Dt({roughness:.5}),s),this.busSkirt=r(new Et(2.54,.62,11.7),new Dt({color:15790057,roughness:.6}),s),this.busGlaze=r(new Et(2.54,.95,10.4),o,s),this.busBlind=r(new Et(1.65,.42,.08),new Dt({color:1711392,emissive:14197308,emissiveIntensity:.5}),s),this.busWheel=r(new ne(.48,.48,.28,10),l,s*4);let c=new Gt;for(let h=0;h<n;h++){let d=h%2===0?1:-1;this.items.push({kind:"car",i:h,s:e+55+(this.path.len-110)/n*h+lt(-6,6),lane:d*(1.9+(h%4<2?0:3.4)),dir:d,speed:lt(7,12)}),c.setHex(Ue(__)),this.body.setColorAt(h,c),this.roof.setColorAt(h,c)}this.body.instanceColor&&(this.body.instanceColor.needsUpdate=!0),this.roof.instanceColor&&(this.roof.instanceColor.needsUpdate=!0),this.busBody.instanceColor&&(this.busBody.instanceColor.needsUpdate=!0);let u=[4160838,4160838,12858415],f=new Gt;for(let h=0;h<s;h++){let d=h%2===0?1:-1;f.setHex(u[h%u.length]),this.busBody.setColorAt(h,f),this.items.push({kind:"bus",i:h,s:e+140+(this.path.len-200)/s*h+lt(-15,15),lane:d*5.4,dir:d,speed:lt(6,9)})}return this._m=new ee,this._q=new ve,this._e=new we,this._p=new L,this._s=new L(1,1,1),this._tmp=[0,0,0,0],this.update(0,0),n+s}update(t,e){let{_m:n,_q:s,_e:r,_p:a,_s:o,_tmp:l}=this;for(let c of this.items){c.s+=c.dir*c.speed*e,this.path.at(c.s,l);let[u,f,h,d]=l,g=-d,v=h,m=u+g*c.lane,p=f+v*c.lane,S=Math.atan2(h*c.dir,d*c.dir);if(r.set(0,S,0),s.setFromEuler(r),c.kind==="car"){a.set(m,.62,p),n.compose(a,s,o),this.body.setMatrixAt(c.i,n),a.set(m-h*.35*c.dir,1.14,p-d*.35*c.dir),n.compose(a,s,o),this.roof.setMatrixAt(c.i,n),n.compose(a,s,o),this.glaze.setMatrixAt(c.i,n);for(let b=0;b<4;b++){let y=(b<2?1.4:-1.4)*c.dir,A=b%2?.86:-.86;a.set(m+h*y+g*A,.31,p+d*y+v*A),r.set(0,S,Math.PI/2,"YXZ"),this._q2=this._q2||new ve,this._q2.setFromEuler(r),n.compose(a,this._q2,o),this.wheel.setMatrixAt(c.i*4+b,n)}}else{a.set(m,1.55,p),n.compose(a,s,o),this.busBody.setMatrixAt(c.i,n),a.set(m,.62,p),n.compose(a,s,o),this.busSkirt.setMatrixAt(c.i,n),a.set(m,2.05,p),n.compose(a,s,o),this.busGlaze.setMatrixAt(c.i,n),a.set(m+h*5.95*c.dir,2.42,p+d*5.95*c.dir),n.compose(a,s,o),this.busBlind.setMatrixAt(c.i,n);for(let b=0;b<4;b++){let y=(b<2?3.6:-3.6)*c.dir,A=b%2?1.2:-1.2;a.set(m+h*y+g*A,.48,p+d*y+v*A),r.set(0,S,Math.PI/2,"YXZ"),this._q2=this._q2||new ve,this._q2.setFromEuler(r),n.compose(a,this._q2,o),this.busWheel.setMatrixAt(c.i*4+b,n)}}}for(let c of[this.body,this.roof,this.glaze,this.wheel,this.busBody,this.busSkirt,this.busGlaze,this.busBlind,this.busWheel])c.instanceMatrix.needsUpdate=!0}};var y_=[11876142,2051962,14067004,3107663,8011629,13593402,2830131];function Dd(i,t,e){let n=t.p,s=t.w/2,r=[],a=[],o=[],l=[],c=[],u=[],f=[],h=0;for(let M=0;M<n.length-1;M++){let[R,I]=n[M],[P,F]=n[M+1],B=P-R,D=F-I,z=Math.hypot(B,D);if(z<.5)continue;let N=B/z,X=D/z,Y=-X,j=N,tt=Math.atan2(N,X);for(let st=0;st<z;st+=1,h++){let Tt=R+N*st,Zt=I+X*st;for(let wt of[-1,1]){let J=(s+1.1)*wt,ot=Tt+Y*J,rt=Zt+j*J;if(h%2===0&&!e(ot,rt)&&(r.push([ot,1,rt,tt]),h%4===0&&a.push([ot,.55,rt,tt])),h%260===120){let bt=Tt+Y*(s+5.6)*wt,It=Zt+j*(s+5.6)*wt;e(bt,It)||o.push([bt,It,tt,wt])}if(h%190===30){let bt=Tt+Y*(s+1.6)*wt,It=Zt+j*(s+1.6)*wt;e(bt,It)||l.push([bt,It,tt,wt])}if(h%46===12){let bt=Tt+Y*(s+6.4)*wt,It=Zt+j*(s+6.4)*wt;e(bt,It)||u.push([bt,.32,It,tt])}if(h%120===60){let bt=Tt+Y*(s+4.2)*wt,It=Zt+j*(s+4.2)*wt;e(bt,It)||f.push([bt,.46,It,tt])}if(h%26===8){let bt=Tt+Y*(s+12.5)*wt,It=Zt+j*(s+12.5)*wt;e(bt,It)&&c.push([Tt+Y*(s+11.4)*wt,lt(6.2,7.6),Zt+j*(s+11.4)*wt,tt,wt])}}}}let d=new ee,g=new ve,v=new we,m=new L,p=new L(1,1,1),S=(M,R,I,P,F)=>{if(!I.length)return null;let B=new Le(M,R,I.length);return I.forEach((D,z)=>{P(D),d.compose(m,g,p),B.setMatrixAt(z,d),F&&B.setColorAt(z,F(D,z))}),B.instanceColor&&(B.instanceColor.needsUpdate=!0),B.castShadow=!0,B.receiveShadow=!0,i.add(B),B},b=M=>{m.set(M[0],M[1],M[2]),v.set(0,M[3],0),g.setFromEuler(v)};S(new Et(.06,.05,2),zt.metal,r,b),S(new Et(.05,.04,2),zt.metal,r,M=>{m.set(M[0],.62,M[2]),v.set(0,M[3],0),g.setFromEuler(v)}),S(new ne(.035,.035,1,6),zt.metal,a,b),S(new ne(.55,.46,.64,10),zt.conc,u,b),S(new be(.52,8,6),zt.canopy,u,M=>{m.set(M[0],.86,M[2]),g.identity()}),S(new ne(.24,.2,.9,8),zt.darkMetal,f,b);let y=new Gt;S(new Et(.28,1.05,2.6),new Dt({roughness:.55}),c,M=>{m.set(M[0],M[1],M[2]),v.set(0,M[3],0),g.setFromEuler(v)},()=>y.setHex(Ue(y_)));for(let[M,R,I,P]of o){let F=new Se,B=new Ct(new Et(9.2,.16,3.1),zt.trim);B.position.y=3,B.castShadow=!0,F.add(B);for(let X=0;X<4;X++){let Y=new Ct(new ne(.07,.07,3,8),zt.metal);Y.position.set(-4.1+X*2.7,1.5,1.35),Y.castShadow=!0,F.add(Y)}let D=new Ct(new Et(8.8,1.7,.08),zt.glass);D.position.set(0,1.95,-1.4),F.add(D);let z=new Ct(new Et(7.4,.09,.46),zt.metal);z.position.set(0,.62,-1.1),z.castShadow=!0,F.add(z);let N=new Ct(new Et(.9,1.5,.1),new Dt({color:2568506,roughness:.3}));N.position.set(4.4,1.7,-1),F.add(N),F.position.set(M,0,R),F.rotation.y=I,i.add(F)}for(let[M,R,I,P]of l){let F=new Se,B=new Ct(new ne(.09,.11,5.4,8),zt.darkMetal);B.position.y=2.7,B.castShadow=!0,F.add(B);let D=new Ct(new ne(.06,.06,3,6),zt.darkMetal);D.position.set(-1.5*P,5.2,0),D.rotation.z=Math.PI/2,D.castShadow=!0,F.add(D);let z=new Ct(new Et(.32,.86,.3),zt.darkMetal);z.position.set(-2.9*P,4.9,0),z.castShadow=!0,F.add(z);for(let N=0;N<3;N++){let X=new Ct(new bi(.1,10),new Dt({color:[14172207,14198063,4173402][N],emissive:N===2?3115590:0,emissiveIntensity:.6}));X.position.set(-2.9*P,5.18-N*.27,.16),F.add(X)}F.position.set(M,0,R),F.rotation.y=I,i.add(F)}let A=[],w=[],T=[],x=0;for(let M=0;M<n.length-1;M++){let[R,I]=n[M],[P,F]=n[M+1],B=P-R,D=F-I,z=Math.hypot(B,D);if(z<.5)continue;let N=B/z,X=D/z,Y=-X,j=N,tt=Math.atan2(N,X);for(let st=0;st<z;st+=1,x++){if(x%4!==0)continue;let Tt=R+N*st,Zt=I+X*st;for(let wt of[-1,1]){let J=Tt+Y*(s+9)*wt,ot=Zt+j*(s+9)*wt;e(Tt+Y*(s+13.5)*wt,Zt+j*(s+13.5)*wt)&&(w.push([J,3.35,ot,tt]),T.push([J,3.12,ot,tt]),A.push([J+Y*1.5*wt,1.6,ot+j*1.5*wt,tt]),A.push([J-Y*1.5*wt,1.6,ot-j*1.5*wt,tt]))}}}return S(new Et(3.4,.13,4.1),zt.trim,w,b),S(new Et(.18,.22,4.1),zt.metal,T,b),S(new ne(.075,.075,3.2,8),zt.metal,A,b),{linkway:w.length,rails:r.length,shelters:o.length,lights:l.length,signs:c.length,planters:u.length}}function Ud(i,t,e){let n=document.createElement("canvas");n.width=i,n.height=t,e(n.getContext("2d"),i,t);let s=new Zi(n);return s.colorSpace=Oe,s.anisotropy=4,s}function v_(i){return Ud(512,192,(t,e,n)=>{t.fillStyle="#0f6b3f",t.fillRect(0,0,e,n),t.strokeStyle="#f2f4f0",t.lineWidth=5,t.strokeRect(9,9,e-18,n-18),t.fillStyle="#f2f4f0",t.font="600 44px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial",t.textBaseline="middle",i.forEach((s,r)=>{let a=i.length===1?n/2:58+r*62;t.fillText(s.text,34,a),t.save(),t.translate(e-66,a),s.dir==="left"&&t.rotate(Math.PI),t.beginPath(),t.moveTo(-20,0),t.lineTo(14,0),t.moveTo(2,-12),t.lineTo(14,0),t.lineTo(2,12),t.lineWidth=7,t.strokeStyle="#f2f4f0",t.lineJoin="round",t.stroke(),t.restore()})})}function M_(i){return Ud(512,128,(t,e,n)=>{t.fillStyle="#f4f4f1",t.fillRect(0,0,e,n),t.fillStyle="#20477e",t.fillRect(0,0,e,22),t.fillStyle="#1b1d1f",t.font="700 52px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial",t.textBaseline="middle",t.textAlign="center";let s=52;for(;t.measureText(i.toUpperCase()).width>e-46&&s>22;)s-=2,t.font=`700 ${s}px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial`;t.fillText(i.toUpperCase(),e/2,n/2+10)})}function Nd(i,t,e,n){let s=t.p,r=t.w/2,a={gantries:0,plates:0},o=[...new Set(e.roads.map(c=>c.n).filter(c=>c&&!/orchard road/i.test(c)))],l=0;for(let c=0;c<s.length-1;c++){let[u,f]=s[c],[h,d]=s[c+1],g=h-u,v=d-f,m=Math.hypot(g,v);if(m<.5)continue;let p=g/m,S=v/m,b=-S,y=p,A=Math.atan2(p,S);for(let w=0;w<m;w+=1,l++){let T=u+p*w,x=f+S*w;if(l%230===90){let M=new Se,R=new Ct(new ne(.13,.16,7.2,8),zt.darkMetal);R.position.set(b*(r+1),3.6,y*(r+1)),R.castShadow=!0,M.add(R);let I=new Ct(new Et(r*1.1,.16,.16),zt.darkMetal);I.position.set(b*(r*.45),7,y*(r*.45)),I.rotation.y=A,I.castShadow=!0,M.add(I);let P=Ue(o)||"Scotts Road",F=Ue(o)||"Paterson Road",B=new Ct(new ze(4.6,1.72),new Vn({map:v_([{text:P.slice(0,16),dir:"left"},{text:F.slice(0,16),dir:"right"}])}));B.position.set(b*(r*.42),5.9,y*(r*.42)),B.rotation.y=A+Math.PI,M.add(B);let D=new Ct(new Et(4.6,1.72,.09),zt.darkMetal);D.position.copy(B.position),D.position.y-=0,D.rotation.y=A,D.castShadow=!0,M.add(D),M.position.set(T,0,x),i.add(M),a.gantries++}if(l%150===40)for(let M of[-1,1]){let R=T+b*(r+2.4)*M,I=x+y*(r+2.4)*M;if(n(R,I))continue;let P=new Se,F=new Ct(new ne(.05,.05,2.6,6),zt.metal);F.position.y=1.3,F.castShadow=!0,P.add(F);let B=new Ct(new ze(1.5,.38),new Vn({map:M_("Orchard Road"),side:He}));B.position.y=2.5,P.add(B),P.position.set(R,0,I),P.rotation.y=A+Math.PI/2,i.add(P),a.plates++}}}return a}var ml=class{constructor(t,e){this.places=[];for(let n of t.buildings){if(!n.n)continue;let s=0,r=0;for(let a of n.p)s+=a[0],r+=a[1];this.places.push({n:n.n,x:s/n.p.length,z:r/n.p.length,a:n.a})}this.axis=e,this.current="",this.el=document.getElementById("place"),this.map=document.getElementById("map"),this.mapCtx=this.map?this.map.getContext("2d"):null,this.bounds=this._bounds(t),this.base=this._renderBase(t),this._t=0}_bounds(t){let e=1e9,n=-1e9,s=1e9,r=-1e9;for(let a of t.buildings)for(let[o,l]of a.p)o<e&&(e=o),o>n&&(n=o),l<s&&(s=l),l>r&&(r=l);return{mnx:e,mxx:n,mnz:s,mxz:r}}_renderBase(t){if(!this.map)return null;let e=this.map.width,n=document.createElement("canvas");n.width=n.height=e;let s=n.getContext("2d"),{mnx:r,mxx:a,mnz:o,mxz:l}=this.bounds,c=Math.max(a-r,l-o)||1,u=h=>(h-r)/c*e*.94+e*.03,f=h=>(h-o)/c*e*.94+e*.03;this.px=u,this.pz=f,s.fillStyle="rgba(12,16,20,0.72)",s.fillRect(0,0,e,e),s.fillStyle="rgba(198,205,212,0.30)";for(let h of t.buildings)s.beginPath(),h.p.forEach(([d,g],v)=>v?s.lineTo(u(d),f(g)):s.moveTo(u(d),f(g))),s.closePath(),s.fill();return s.strokeStyle="rgba(255,214,150,0.95)",s.lineWidth=2.2,s.beginPath(),this.axis.p.forEach(([h,d],g)=>g?s.lineTo(u(h),f(d)):s.moveTo(u(h),f(d))),s.stroke(),n}update(t,e){if(this._t+=e,this._t<.25)return;this._t=0;let n=null,s=1/0;for(let r of this.places){let a=Math.hypot(r.x-t.x,r.z-t.z)-Math.min(60,Math.sqrt(r.a)*.5);a<s&&(s=a,n=r)}if(this.el){let r=n&&s<90?n.n:"Orchard Road";r!==this.current&&(this.current=r,this.el.textContent=r)}if(this.mapCtx&&this.base){let r=this.map.width,a=this.mapCtx;a.clearRect(0,0,r,r),a.drawImage(this.base,0,0);let o=this.px(t.x),l=this.pz(t.z);a.save(),a.translate(o,l),a.rotate(-t.heading),a.fillStyle="rgba(255,214,150,0.28)",a.beginPath(),a.moveTo(0,0),a.arc(0,0,16,-Math.PI/2-.5,-Math.PI/2+.5),a.closePath(),a.fill(),a.restore(),a.fillStyle="#ffd696",a.beginPath(),a.arc(o,l,3.4,0,Math.PI*2),a.fill()}}};var vn=new URLSearchParams(location.search),Od=document.getElementById("hud"),ss=document.getElementById("c"),dn=new il({canvas:ss,antialias:!0,powerPreference:"high-performance"});dn.outputColorSpace=Oe;dn.toneMapping=Cr;dn.toneMappingExposure=1;dn.shadowMap.enabled=!vn.has("noshadow");dn.shadowMap.type=lo;var hi=new rr;hi.fog=new sr(13222834,.0021);var $e=new je(58,1,.3,1400),es=new L(-.52,.8,-.3).normalize();hi.add(new Ct(new be(900,40,24),new rn({side:Ze,depthWrite:!1,fog:!1,uniforms:{top:{value:new Gt(Xe.skyTop)},mid:{value:new Gt(Xe.skyMid)},haze:{value:new Gt(Xe.skyHaze)},cloud:{value:new Gt(Xe.cloud)},sun:{value:es.clone()}},vertexShader:`varying vec3 vW;
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
      }`})));var qe=new Tr(16773334,2.6);qe.castShadow=!0;qe.shadow.mapSize.set(2048,2048);qe.shadow.camera.left=-95;qe.shadow.camera.right=95;qe.shadow.camera.top=95;qe.shadow.camera.bottom=-95;qe.shadow.camera.near=1;qe.shadow.camera.far=460;qe.shadow.bias=-5e-4;qe.shadow.normalBias=.05;hi.add(qe,qe.target);hi.add(new Er(10930402,9733487,1.35));var on=new Se;hi.add(on);var Hs=12,gl=new Map;function S_(i){for(let t of i.buildings){let e=1e9,n=-1e9,s=1e9,r=-1e9;for(let[a,o]of t.p)e=Math.min(e,a),n=Math.max(n,a),s=Math.min(s,o),r=Math.max(r,o);for(let a=Math.floor(e/Hs);a<=Math.floor(n/Hs);a++)for(let o=Math.floor(s/Hs);o<=Math.floor(r/Hs);o++){let l=a+","+o;gl.has(l)||gl.set(l,[]),gl.get(l).push(t.p)}}}function b_(i,t,e){let n=!1;for(let s=0,r=i.length-1;s<i.length;r=s++){let a=i[s][0],o=i[s][1],l=i[r][0],c=i[r][1];o>e!=c>e&&t<(l-a)*(e-o)/(c-o)+a&&(n=!n)}return n}function Mn(i,t){let e=gl.get(Math.floor(i/Hs)+","+Math.floor(t/Hs));if(!e)return!1;for(let n of e)if(b_(n,i,t))return!0;return!1}function E_(i,t){if(!t)return 0;let e=t.p,n=t.w/2,s=new Wr,r=[],a=[],o=[],l=[],c=[],u=0;for(let p=0;p<e.length-1;p++){let[S,b]=e[p],[y,A]=e[p+1],w=y-S,T=A-b,x=Math.hypot(w,T);if(x<.5)continue;let M=w/x,R=T/x,I=-R,P=M,F=Math.atan2(M,R);for(let B=0;B<x;B+=1,u++){let D=S+M*B,z=b+R*B;for(let N of[-1,1]){let X=D+I*(n+.4)*N,Y=z+P*(n+.4)*N;if(u%13===(N>0?0:6))for(let j of[3.2,2.2,4.4]){let tt=D+I*(n+j)*N,st=z+P*(n+j)*N;if(!Mn(tt,st)){s.add(tt,st,lt(.85,1.15));break}}u%34===0&&(a.push([X,4.5,Y,0]),o.push([X-I*1.1*N,8.9,Y-P*1.1*N,F,N]),l.push([X-I*2.3*N,8.75,Y-P*2.3*N,F])),u%2===0&&r.push([X,.15,Y,F])}if(u%190===0&&u>40)for(let N=-3;N<=3;N++)c.push([D+I*N*1.3,.035,z+P*N*1.3,F])}}let f=new ee,h=new ve,d=new we,g=new L,v=new L(1,1,1),m=(p,S,b,y)=>{if(!b.length)return;let A=new Le(p,S,b.length);b.forEach((w,T)=>{y(w),f.compose(g,h,v),A.setMatrixAt(T,f)}),A.castShadow=!0,A.receiveShadow=!0,on.add(A)};return m(new Et(.42,.3,2),zt.kerb,r,p=>{g.set(p[0],p[1],p[2]),d.set(0,p[3],0),h.setFromEuler(d)}),m(new ne(.11,.16,9,8),zt.metal,a,p=>{g.set(p[0],p[1],p[2]),h.identity()}),m(new ne(.07,.07,2.4,6),zt.metal,o,p=>{g.set(p[0],p[1],p[2]),d.set(0,p[3],Math.PI/2-.2*p[4]),h.setFromEuler(d)}),m(new Et(1,.2,.44),zt.trim,l,p=>{g.set(p[0],p[1],p[2]),d.set(0,p[3],0),h.setFromEuler(d)}),m(new ze(.62,t.w),zt.white,c,p=>{g.set(p[0],p[1],p[2]),d.set(-Math.PI/2,p[3]+Math.PI/2,0,"YXZ"),h.setFromEuler(d)}),s.build(on)}var Zr=yd(),rh=vd();Zr.group.add(rh);var _l=new Se;_l.add(Zr.group);hi.add(_l);var Ut=cl(0,0,0),Bd=!1,$r={},Fi=null,ns=null,Yr=null,$n="ride",Oi=new ul;for(let i of["touchstart","mousedown","keydown"])addEventListener(i,()=>Oi.start(),{once:!0,passive:!0});var Gs=0,Jr=.16,le=wd(),is=Ad();is.group.visible=!1;hi.add(is.group);var zs=0;fetch("./data/orchard.json").then(i=>i.json()).then(i=>{S_(i);let t=vn.has("nobuild")?{count:0,tall:0}:xd(on,i),e=_d(on,i),n=i.axis||e,s=new Ct(new ze(2600,2600),new Dt({color:10130308,roughness:.95}));s.rotation.x=-Math.PI/2,s.position.y=-.05,s.receiveShadow=!0,on.add(s);let r=vn.has("nofoliage")?0:E_(i,n);!vn.has("nopeople")&&n&&(Fi=new fl(n,Mn,150),Fi.build(on)),!vn.has("notraffic")&&n&&(ns=new pl(n,18,3),ns.build(on,ns.path.nearestS(Ut.x,Ut.z)));let a=!vn.has("nofurniture")&&n?Dd(on,n,Mn):{},o=!vn.has("nosigns")&&n?Nd(on,n,i,Mn):{},l=!vn.has("nomarks")&&n?Rd(on,n):0,c=!vn.has("noside")&&n?Cd(on,i,n,Mn,Wr):{},u=!vn.has("nosg")&&n?Ld(on,n,i,Mn):{};n&&(Yr=new ml(i,n)),window.__axis=n;let f=Fi?Fi.people.length:0;if(n){let h=0,d=1/0;for(let A=0;A<n.p.length-1;A++){let w=n.p[A][0]*n.p[A][0]+n.p[A][1]*n.p[A][1];w<d&&(d=w,h=A)}let g=n.p[h],v=n.p[Math.min(h+1,n.p.length-1)],m=v[0]-g[0],p=v[1]-g[1],S=Math.hypot(m,p)||1,b=-p/S,y=m/S;Ut=cl(g[0]+b*-3.4,g[1]+y*-3.4,Math.atan2(m,p))}$r={marks:l,...c,...u,buildings:t.count,bespoke:t.bespoke,towers:t.tall,roads:i.roads.length,people:f,trees:r,...a,...o},Bd=!0,window.__ready=!0,window.__stats=$r}).catch(i=>{Od.textContent="data load failed: "+i.message});eh&&Md(ss);Sd(ss);{let i=document.getElementById("soundbtn");if(i){let t=e=>{e.preventDefault(),e.stopPropagation(),Oi.start(),Oi.setMuted(!Oi.muted),i.textContent=Oi.muted?"Sound off":"Sound on"};i.addEventListener("click",t),i.addEventListener("touchstart",t,{passive:!1})}}{let i=document.getElementById("modebtn");if(i){let t=e=>{e.preventDefault(),e.stopPropagation(),oh()};i.addEventListener("click",t),i.addEventListener("touchstart",t,{passive:!1})}}var zd=vn.get("cam")||"ride",Zn=new Ai(-260,260,260,-260,1,2e3);Zn.up.set(0,0,-1);Zn.position.set(0,900,0);Zn.lookAt(0,0,0);function oh(){if($n==="ride"){let i=Math.cos(Ut.heading),t=-Math.sin(Ut.heading),e=Ut.x+i*1.2,n=Ut.z+t*1.2;Mn(e,n)&&(e=Ut.x-i*1.2,n=Ut.z-t*1.2),le.x=e,le.z=n,le.heading=Ut.heading,le.speed=0,Ut.speed=0,Ut.reversing=!1,Gs=Ut.heading,Jr=.16,is.group.visible=!0,rh.visible=!1,$n="walk"}else{if(Math.hypot(le.x-Ut.x,le.z-Ut.z)>6)return;is.group.visible=!1,rh.visible=!0,yl=!1,$n="ride"}w_()}function w_(){let i=document.getElementById("help");if(!i)return;i.innerHTML=$n==="ride"?'<b>hold left side</b> throttle<br><b>hold lower left</b> brake<br><b>hold brake stopped</b> reverse<br><b>drag right side</b> steer<br><span style="opacity:.65">keys: A/D \xB7 W \xB7 S \xB7 E to get off</span>':'<b>drag left side</b> walk<br><b>drag right side</b> look around<br><span style="opacity:.65">keys: WASD \xB7 shift to run \xB7 E to ride</span>';let t=document.getElementById("modebtn");t&&(t.textContent=$n==="ride"?"Get off":"Ride")}function T_(i){let e=Math.cos(Jr),n=Math.sin(Jr),s=le.x-Math.sin(Gs)*3.6*e,r=le.z-Math.cos(Gs)*3.6*e;$e.position.set(s,1.62+3.6*n,r),$e.lookAt(le.x,1.35,le.z),$e.fov=62,$e.updateProjectionMatrix()}var nh=new L,ih=new L,yl=!1,Ni=(vn.get("spec")||"").split(",").map(Number),A_=Ni.length===6&&Ni.every(i=>Number.isFinite(i));function R_(i){if(A_){$e.position.set(Ni[0],Ni[1],Ni[2]),$e.lookAt(Ni[3],Ni[4],Ni[5]),$e.fov=46,$e.updateProjectionMatrix();return}let t=new L(Math.sin(Ut.heading),0,Math.cos(Ut.heading)),e=new L(Ut.x,0,Ut.z).addScaledVector(t,-5.8).add(new L(0,3.05,0)),n=new L(Ut.x,1.35,Ut.z).addScaledVector(t,7.5);yl||(nh.copy(e),ih.copy(n),yl=!0),nh.lerp(e,Math.min(1,i*4.2)),ih.lerp(n,Math.min(1,i*6)),$e.position.copy(nh),$e.lookAt(ih),$e.fov=58+Ut.speed/nn.vMax*12,$e.updateProjectionMatrix()}var C_=parseFloat(vn.get("dpr")||"0");function Hd(){let i=ss.clientWidth,t=ss.clientHeight;dn.setPixelRatio(C_||Math.min(devicePixelRatio||1,2)),dn.setSize(i,t,!1),$e.aspect=i/t,$e.updateProjectionMatrix();let e=i/t,n=440;Zn.left=-n*e,Zn.right=n*e,Zn.top=n,Zn.bottom=-n,Zn.updateProjectionMatrix()}addEventListener("resize",Hd);Hd();var ah=performance.now(),vl=0,Ml=ah,sh=0;function xl(i){let t=Math.min(.05,(i-ah)/1e3);if(ah=i,document.hidden){requestAnimationFrame(xl);return}if(Bd){let e=bd($n);if(un.toggleMode&&(un.toggleMode=!1,oh()),window.__force&&(e.throttle=window.__force.throttle??e.throttle,e.brake=window.__force.brake??e.brake,e.steer=window.__force.steer??e.steer),$n==="walk"){Gs-=e.lookDX*.0045,Jr=Math.max(-.35,Math.min(.95,Jr+e.lookDY*.0035));let r=Math.sin(Gs),a=Math.cos(Gs),o=-e.moveY*r+e.moveX*a,l=-e.moveY*a-e.moveX*r,c=le.x,u=le.z;Td(le,t,o,l,e.run),Mn(le.x,le.z)&&(Mn(le.x,u)?Mn(c,le.z)?(le.x=c,le.z=u):le.x=c:le.z=u),is.group.position.set(le.x,0,le.z),is.group.rotation.y=le.heading,is.pose(le.phase,le.speed),qe.position.set(le.x+es.x*150,es.y*150,le.z+es.z*150),qe.target.position.set(le.x,0,le.z),qe.target.updateMatrixWorld(),zs+=t,Fi&&Fi.update(zs,t),ns&&ns.update(zs,t),Yr&&Yr.update(le,t),Oi.update(0,"walk",le.speed,le.phase),T_(t),dn.render(hi,$e),vl++,i-Ml>1e3&&Fd(i),requestAnimationFrame(xl);return}let n=Ut.x,s=Ut.z;if(Qc(Ut,t,e.throttle,e.brake,e.steer),Mn(Ut.x,Ut.z)){let r={x:Ut.x,z:s},a={x:n,z:Ut.z};Mn(r.x,r.z)?Mn(a.x,a.z)?(Ut.x=n,Ut.z=s,Ut.speed*=.2):(Ut.x=n,Ut.speed*=.86):(Ut.z=s,Ut.speed*=.86)}_l.position.set(Ut.x,0,Ut.z),_l.rotation.y=Ut.heading,Zr.group.rotation.z=Ut.lean,Zr.wheels[0].rotation.x=-Ut.wheel,Zr.wheels[1].rotation.x=-Ut.wheel,qe.position.set(Ut.x+es.x*150,es.y*150,Ut.z+es.z*150),qe.target.position.set(Ut.x,0,Ut.z),qe.target.updateMatrixWorld(),zs+=t,Fi&&Fi.update(zs,t,Ut.x,Ut.z),ns&&ns.update(zs,t),Yr&&Yr.update(Ut,t),Oi.update(Ut.speed,"ride",0,0),R_(t)}dn.render(hi,zd==="top"?Zn:$e),vl++,i-Ml>1e3&&Fd(i),requestAnimationFrame(xl)}function Fd(i){{sh=Math.round(vl*1e3/(i-Ml)),vl=0,Ml=i;let t=dn.getPixelRatio(),e=Math.round(ss.clientWidth*t)+"x"+Math.round(ss.clientHeight*t);Od.textContent=`${sh} fps \xB7 ${e} @dpr${t} \xB7 ${dn.info.render.triangles/1e3|0}k tris \xB7 ${dn.info.render.calls} draws \xB7 `+($n==="walk"?"on foot":`${Math.abs(Ut.speed*3.6)|0} km/h${Ut.reversing?" R":""}`)+($r.buildings?` \xB7 ${$r.buildings} buildings`:""),window.__probe={fps:sh,tris:dn.info.render.triangles,calls:dn.info.render.calls,px:e,dpr:t,kmh:+(Ut.speed*3.6).toFixed(1),mode:$n,...$r}}}requestAnimationFrame(xl);window.__drive=(i,t,e)=>{window.__force={throttle:i,steer:t,brake:0},setTimeout(()=>{window.__force=null},e*1e3)};window.__inp=()=>({TOUCH:eh,steer:un.steer,throttle:un.throttle,brake:un.brake,touches:Ed(),fired:window.__touchFired||0});window.__snd=Oi;window.__mode=()=>$n;window.__toggle=()=>oh();window.__walker=()=>({x:+le.x.toFixed(1),z:+le.z.toFixed(1),sp:+le.speed.toFixed(2)});window.__state=()=>({x:+Ut.x.toFixed(1),z:+Ut.z.toFixed(1),kmh:+(Ut.speed*3.6).toFixed(1)});window.__dbg=()=>{let i=new En().setFromObject(on),t=zd==="top"?Zn:$e;return{worldBox:{min:[i.min.x|0,i.min.y|0,i.min.z|0],max:[i.max.x|0,i.max.y|0,i.max.z|0]},children:on.children.length,camType:t.type,camPos:[t.position.x|0,t.position.y|0,t.position.z|0],camDir:(()=>{let e=new L;return t.getWorldDirection(e),[+e.x.toFixed(2),+e.y.toFixed(2),+e.z.toFixed(2)]})(),ortho:t.isOrthographicCamera?[t.left|0,t.right|0,t.top|0,t.bottom|0,t.near,t.far]:null}};window.__setState=(i,t,e)=>{Ut.x=i,Ut.z=t,Ut.heading=e,yl=!1};
/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
