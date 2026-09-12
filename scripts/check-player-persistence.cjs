/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

function createRuntime() {
  let current = null;
  const state = { pathname: '/musica', context: null };
  const react = {
    createContext(value) { return { value, Provider: ({children}) => children }; },
    useContext(ctx) { return ctx.value; },
    useState(initial) {
      const i = current.index++;
      if (!(i in current.hooks)) current.hooks[i] = { value: typeof initial === 'function' ? initial() : initial };
      const slot = current.hooks[i];
      return [slot.value, value => { const next = typeof value === 'function' ? value(slot.value) : value; if (!Object.is(next,slot.value)) {slot.value=next; current?.markDirty?.(); slot.owner.dirty=true;} }];
    },
    useRef(initial) {
      const i=current.index++;
      if (!(i in current.hooks)) current.hooks[i]={ current:initial };
      return current.hooks[i];
    },
    useCallback(fn,deps) {
      const i=current.index++;
      const prior=current.hooks[i];
      if(prior && same(prior.deps,deps)) return prior.value;
      current.hooks[i]={deps,value:fn}; return fn;
    },
    useEffect(fn,deps) {
      const i=current.index++;
      const prior=current.hooks[i];
      if(prior && same(prior.deps,deps)) return;
      current.pending.push({i,fn,deps});
    },
  };
  function same(a,b){return a&&b&&a.length===b.length&&a.every((v,i)=>Object.is(v,b[i]));}
  const jsx = (type,props,key) => ({type,props:props||{},key:key??null});
  const cache=new Map();
  function load(name, overrides={}) {
    if(cache.has(name))return cache.get(name);
    const filename=path.join(root,name);
    const code=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
    const mod={exports:{}};
    const req=id=>{
      if(id==='react')return react;
      if(id==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:Symbol.for('fragment')};
      if(id==='next/link')return {__esModule:true,default:'Link'};
      if(id==='next/navigation')return {usePathname:()=>state.pathname};
      if(id.endsWith('.module.css'))return {__esModule:true,default:new Proxy({},{get:(_t,k)=>String(k)})};
      if(id==='@/app/lib/music-track-titles')return {getLocalizedTrackTitle:track=>track.title};
      if(id==='./MusicPlayerContext'||id==='@/app/components/music/MusicPlayerContext')return {useMusicPlayer:()=>state.context};
      if(id==='./YouTubeRecommendationPlayer')return {__esModule:true,default:overrides.youtubeComponent||'YouTubeRecommendationPlayer'};
      if(id.startsWith('./'))return load(path.join(path.dirname(name),id)+'.tsx',overrides);
      throw new Error('Unexpected import '+id);
    };
    new Function('require','module','exports',code)(req,mod,mod.exports);
    cache.set(name,mod.exports);return mod.exports;
  }
  function instance(component,props,commit) {
    const componentState={hooks:[],pending:[],index:0,dirty:false,markDirty(){this.dirty=true;}};
    function render(nextProps=props){
      props=nextProps;componentState.dirty=false;componentState.index=0;componentState.pending=[];
      const previous=current;current=componentState;
      const tree=component(props);
      current=previous;
      for(const slot of componentState.hooks)if(slot&&'value'in slot)slot.owner=componentState;
      commit?.(tree);
      for(const effect of componentState.pending){
        const prior=componentState.hooks[effect.i];prior?.cleanup?.();
        const cleanup=effect.fn();componentState.hooks[effect.i]={deps:effect.deps,cleanup};
      }
      return tree;
    }
    function unmount(){for(const h of componentState.hooks)h?.cleanup?.();}
    return {render,unmount,state:componentState};
  }
  return {react,state,load,instance};
}
function walk(node,pred){if(Array.isArray(node)){for(const child of node){const found=walk(child,pred);if(found)return found;}return null;}if(!node||typeof node!=='object')return null;if(pred(node))return node;const children=node.props?.children;for(const child of Array.isArray(children)?children:[children]){const found=walk(child,pred);if(found)return found;}return null;}
function button(tree,label){const b=walk(tree,n=>n.type==='button'&&n.props['aria-label']===label);assert.ok(b,'Missing button: '+label);return b;}
const recommendation={id:'test',title:'Test video',artist:'Test artist',youtubeVideoId:'testVideo01',coverUrl:null};
const track={id:'track',title:'Test track',subtitle:'VANMOTION',src:'/test.mp3',coverUrl:null,format:'MP3',externalUrl:null};

// A fake stateful React renderer tests the actual component handlers and JSX.
test('Selection, collapse, navigation and close preserve the video identity',()=>{
  const rt=createRuntime();const calls=[];let audioHandler=null;
  const context={tracks:[track],currentTrack:track,currentIndex:0,isPlaying:false,currentTime:0,duration:100,volume:.75,playbackError:null,
    togglePlayback:async()=>calls.push('audio-toggle'),pausePlayback:()=>calls.push('audio-pause'),
    setAudioStartHandler:fn=>audioHandler=fn,setVideoSessionActive:v=>{context.videoSessionActive=v;},videoSessionActive:false,
    selectTrack:()=>calls.push('select-track'),playPrevious:()=>{},playNext:()=>{},changeProgress:()=>{},changeVolume:()=>{},setLastTrackEndedHandler:()=>{}};
  rt.state.context=context;
  const Component=rt.load('app/components/music/GlobalMusicPlayer.tsx').default;
  const ui=rt.instance(Component,{language:'es',recommendations:[recommendation]});
  let tree=ui.render();
  button(tree,'Abrir reproductor').props.onClick();tree=ui.render();
  button(tree,'Reproducir Test video').props.onClick();tree=ui.render();
  let video=walk(tree,n=>n.type==='YouTubeRecommendationPlayer');assert.ok(video);
  const key=video.key;assert.equal(context.videoSessionActive,true);assert.ok(calls.includes('audio-pause'));
  assert.equal(walk(tree,n=>n.props?.className?.includes?.('expandedContent'))?.props.hidden,true);
  const fakePlayer={pauseVideo:()=>calls.push('video-pause'),stopVideo:()=>calls.push('video-stop')};
  video.props.playerRef.current=fakePlayer;
  assert.ok(
    tree.props.className.includes('recommendationMinimized')
  );

  rt.state.pathname='/ropa';
  tree=ui.render();

  assert.equal(
    walk(tree,n=>n.type==='YouTubeRecommendationPlayer').key,
    key
  );

  assert.ok(
    tree.props.className.includes('recommendationMinimized')
  );

  audioHandler();
  tree=ui.render();
  assert.ok(calls.includes('video-pause'));

  button(tree,'Ampliar vídeo').props.onClick();
  tree=ui.render();

  assert.equal(
    walk(tree,n=>n.type==='YouTubeRecommendationPlayer').key,
    key
  );

  assert.ok(
    !tree.props.className.includes('recommendationMinimized')
  );

  button(tree,'Minimizar vídeo').props.onClick();
  tree=ui.render();

  assert.equal(
    walk(tree,n=>n.type==='YouTubeRecommendationPlayer').key,
    key
  );

  assert.ok(
    tree.props.className.includes('recommendationMinimized')
  );

  button(tree,'Abrir menú de música').props.onClick();
  tree=ui.render();

  assert.ok(
    !walk(tree,n=>n.type==='YouTubeRecommendationPlayer')
  );

  assert.ok(calls.includes('video-stop'));
  assert.equal(context.videoSessionActive,false);

  const expandedContent = walk(
    tree,
    n=>n.props?.className?.includes?.('expandedContent')
  );

  assert.equal(expandedContent?.props.hidden,false);
  ui.unmount();
});

test('Route policy never conditionally removes the player while a video is active',()=>{
  const rt=createRuntime();rt.state.context={videoSessionActive:true};rt.state.pathname='/privacidad';
  const Component=rt.load('app/components/layout/RouteAwareMusicPlayer.tsx').default;
  const child={type:'Player',props:{}};const ui=rt.instance(Component,{children:child});
  let tree=ui.render();assert.equal(tree.props.hidden,false);assert.equal(tree.props.children,child);
  rt.state.context.videoSessionActive=false;tree=ui.render();assert.equal(tree.props.hidden,true);assert.equal(tree.props.children,child);
  rt.state.pathname='/ropa';tree=ui.render();assert.equal(tree.props.hidden,false);
});

test('YouTube API owns one stable host and uses the actual origin',async()=>{
  const rt=createRuntime();let created=0,destroyed=0,played=0,paused=0;const players=[];
  class FakePlayer{
    constructor(node,options){created++;this.node=node;this.options=options;players.push(this);}
    playVideo(){played++;}
    pauseVideo(){paused++;}
    stopVideo(){}
    destroy(){destroyed++;}
  }
  const oldWindow=global.window,oldDocument=global.document;
  global.window={YT:{Player:FakePlayer},location:{origin:'http://127.0.0.1:3107'}};
  global.document={createElement:()=>({}),head:{appendChild(){}}};
  try{
    let host;const events=[];
    const Component=rt.load('app/components/music/YouTubeRecommendationPlayer.tsx').default;
    const ref={current:null};
    const props={videoId:recommendation.youtubeVideoId,title:'Test',playing:true,playerRef:ref,onPlaying:()=>events.push('playing'),onPaused:()=>events.push('paused'),onEnded:()=>events.push('ended'),onError:e=>events.push(e)};
    const ui=rt.instance(Component,props,tree=>{
      if(!host)host={isConnected:true,children:[],appendChild(n){this.children.push(n)},replaceChildren(){this.children=[]}};
      tree.props.ref.current=host;
    });
    ui.render();await Promise.resolve();await Promise.resolve();
    assert.equal(created,1);assert.equal(players[0].options.playerVars.origin,'http://127.0.0.1:3107');
    players[0].options.events.onReady({target:players[0]});assert.equal(played,1);
    players[0].options.events.onStateChange({data:1});assert.deepEqual(events,['playing']);
    ui.render({...props,playing:false});assert.equal(created,1);assert.equal(destroyed,0);assert.ok(paused>=1);
    ui.unmount();assert.equal(destroyed,1);assert.equal(ref.current,null);
  }finally{global.window=oldWindow;global.document=oldDocument;}
});


test('Audio provider cancels deferred playback and notifies the video on audio start',async()=>{
  const rt=createRuntime();const oldWindow=global.window;
  const storage=new Map();const store={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v))};
  global.window={localStorage:store,sessionStorage:store};
  try{
    const Provider=rt.load('app/components/music/MusicPlayerContext.tsx').default;
    let audio, audioProps;
    const ui=rt.instance(Provider,{tracks:[track],children:'content'},tree=>{
      audioProps=walk(tree,n=>n.type==='audio').props;
      if(!audio)audio={paused:true,volume:.75,currentTime:0,duration:100,load(){},play(){this.paused=false;audioProps.onPlay();return Promise.resolve();},pause(){this.paused=true;audioProps.onPause();}};
      audioProps.ref.current=audio;
    });
    let tree=ui.render();let context=tree.props.value;
    let notified=0;context.setAudioStartHandler(()=>notified++);
    await context.togglePlayback();tree=ui.render();context=tree.props.value;
    assert.equal(audio.paused,false);assert.equal(notified,1);
    context.pausePlayback();ui.render();assert.equal(audio.paused,true);assert.equal(storage.get('vanmotion-global-playing'),'0');
    ui.unmount();
  }finally{global.window=oldWindow;}
});

(async()=>{for(const t of tests){try{await t.fn();console.log('PASS '+t.name)}catch(e){console.error('FAIL '+t.name);console.error(e);process.exitCode=1;}}})();
