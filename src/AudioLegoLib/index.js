
import { dropUntil } from './funcs'

const getUserMedia = (navigator.getUserMedia ||
                      navigator.webkitGetUserMedia).bind(navigator)

const AudioContext = (window.AudioContext ||
                      window.webkitAudioContext)

export function openStream(options) {
  return new Promise((resolve, reject) => {
    getUserMedia(options, resolve, reject)
  })
  // .catch((e) => {
  //   console.log('openStream errored', e)
  // })
}

export function closeStream(stream) {
  for (let track of stream.getTracks()) {
    track.stop()
  }
}


function _connect(objects, method) {
  return objects.reduce((p, c) => {
    p[method](c)
    return c
  })
}

export function connect(...things) {
  return _connect(things, 'connect')
}

export function disconnect(...things) {
  return _connect(things, 'disconnect')
}

function range(length, initializer=(v, k) => k) {
  return Array.from({length}, initializer)
}

function concatFloat32Array(a, b) {
  let alen = a.length
  let blen = b.length
  let result = new Float32Array(alen + blen)
  result.set(a)
  result.set(b, alen)
  return result
}

function make_recorder(ctx, stream) {
  const
    input = ctx.createMediaStreamSource(stream),
    BUFFER_LEN = 512,
    CHANNELS = input.channelCount,
    recorder = ctx.createScriptProcessor(BUFFER_LEN, CHANNELS, CHANNELS),
    nodes = [input, recorder, ctx.destination]

  return {CHANNELS, recorder, nodes}
}

export function recordStream(ctx, stream) {
  // Recording raw using a ScriptProcessor just doesn't work (TM). We get zeros
  // at the beginning of each recording, and if we get a stop signal, we need
  // to process another X chunks b/c otherwise we just cut off.
  // Generally speaking the recording frame/session is shifted by X samples;
  // probably the 'latency' of course, but there's no API AFAIK to ask for the
  // current latency.
  // I get the same buggy behavior with the 'official' demo:
  // https://webaudiodemos.appspot.com/AudioRecorder/index.html
  // https://github.com/GoogleChrome/voice-memos by @paullewis isn't better as
  // well

  const {CHANNELS, recorder, nodes} = make_recorder(ctx, stream)
  // Number of buffers we record after stop has been called,
  // otherwise the samples are cut off at the end :-(
  const HANGOVER = 20
  let stop_called = 0

  const stop_promise = new Promise((resolve) => {

    const recording = range(CHANNELS, () => new Float32Array)
    recorder.onaudioprocess = e => {
      // NOTE: this inputBuffer is mutated state (WTF?), so we need to make
      // a copy, regardless of what we do. Here we flatten the chunks
      // immediately.
      const inputBuffer = e.inputBuffer
      for (let i=0; i<CHANNELS; i++) {
        recording[i] = concatFloat32Array(recording[i], inputBuffer.getChannelData(i))
      }

      if (stop_called === HANGOVER) {
        disconnect(...nodes)
        // We just drop the Zeros from the beginning of the recording (see
        // comment above)
        resolve(recording.map(dropUntil(Boolean)))
      } else if (stop_called > 0) {
        stop_called += 1
      }
    }

  })

  connect(...nodes)

  return {
    stop() {
      stop_called += 1
      return stop_promise
    }
  }
}


export function AudioBufferFromArrayBuffer(ctx, ary) {
  const CHANNELS = ary.length
  const LENGTH = ary[0].length
  const buffer = ctx.createBuffer(CHANNELS, LENGTH, ctx.sampleRate)
  for (let i=0; i<CHANNELS; i++) {
    buffer.getChannelData(i).set(ary[i])

    // should be?
    // buffer.copyToChannel(ary[i], i)
  }
  return buffer
}


export function createBufferSource(ctx, buffer) {
  const bufferSource = ctx.createBufferSource()
  bufferSource.buffer = buffer
  return bufferSource
}


export function sample_player(ctx, buffer) {
  const sampler = createBufferSource(ctx, buffer)
  connect(sampler, ctx.destination)

  return {
    start(time=0) {
      sampler.start(time)
      return new Promise((resolve) => {
        sampler.addEventListener('ended', resolve)
      })
    },
    stop() {
      sampler.stop()
    }
  }
}

export function play_sample(ctx, buffer) {
  let {start, stop} = sample_player(ctx, buffer)
  let promise = start()
  promise.stop = stop
  return promise
}



/**
function bufferToStream(ctx, buffer) {
  const dest = ctx.createMediaStreamDestination();
  connect(buffer, dest);
}

function resample_live(buffer) {
  const ctx = new AudioContext();
  const sampler = createBufferSource(ctx, buffer);
  const dest = ctx.createMediaStreamDestination();
  connect(sampler, dest);

  const promise = new Promise((resolve, _reject) => {
    const recorder = recordStreamToBlob(dest.stream);
    sampler.addEventListener('ended', () => {
      recorder.stop().then(resolve);
    });
    sampler.start(0);
  });
  promise.stop = () => sampler.stop();
  return promise;
}

function resample_offline(buffer) {
  const ctx = new OfflineAudioContext(buffer.numOfChannels,
                                      buffer.length,
                                      buffer.sampleRate);
  const sampler = createBufferSourceFromData(ctx, buffer);
  const dest = ctx.createMediaStreamDestination();
  connect(sampler, dest);

  const promise = new Promise((resolve, _reject) => {
    const recorder = recordStreamToBlob(dest.stream);
    sampler.start(0);
    ctx.addEventListener('complete', () => {
      recorder.stop().then(resolve);
    });
    ctx.startRendering();
  });

  return promise;
}

export function recordStreamToBlob(stream, type='audio/webm') {
  const recorder = new MediaRecorder(stream, {mimeType: type});

  let recording = [];
  recorder.addEventListener('dataavailable', evt => {
    if (!evt.data || evt.data.size === 0) {
      return;
    }

    recording.push(evt.data);
  });

  recorder.addEventListener('error', evt => {
    console.log(`we had an error ${evt}`);
  });


  let stopped = false;
  recorder.start(10);

  return {
    stop() {
      return new Promise((resolve, reject) => {
        if (stopped) {
          return reject();
        }
        recorder.stop();
        stopped = true;
        const blob = new Blob(recording, {type});
        resolve(blob);
      });
    }
  };
}
**/