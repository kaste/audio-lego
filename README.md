
Polymer elements around WebAudio.

Install
-------

```
bower install kaste/audio-lego -S
```

What you get
------------

Everything WebAudio starts with an `AudioContext`. You get one using:

```
    <audio-context
        open
        ctx="{{context}}"
        ></audio-context>
```

To record your microphone, you first ask for `getUserMedia` in JS. This translates to:

```
    <user-media
        open
        audio
        stream="{{stream}}"
        ></user-media>
```
For both elements `open` denotes an action. If you remove the attribute, the context will be closed, likewise with the mediastream you requested.

You can now go on and record this stream:

```
    <record-media
        recording
        ctx="[[context]]"
        stream="[[stream]]"
        data="{{data}}"
        ></record-media>
```

Actually, you want to parametrize the `recording` attribute. The recording starts, if the attribute is set, and stops if it is unset.

You get the raw recording data back [as a Float32Array], and feed it to the player:

```
    <play-sample
        play
        ctx="[[context]]"
        data="[[data]]"
        ></play-sample>

```
The same as above with the `recording`, the `play` attribute denotes an action. If `play` is set the playback will start. When the sample comes to its end, the attribute will be unset. If you unset the attribute before, playback will stop.

Finally, you can view the waveform of the recording, like so:

```
    <draw-waveform
        data="[[data.0]]"
        ></draw-waveform>

```


But you really should look at the demo index.html

See demo
--------

```
git clone https://github.com/kaste/audio-lego
cd audio-lego
npm install
bower install
gulp
```