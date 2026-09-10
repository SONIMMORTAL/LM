/**
 * Turntable playhead.
 *
 * An AudioBufferSourceNode can't do this: its playbackRate is clamped positive,
 * so it can slow down but never run backwards, and a record that can't run
 * backwards can't be scratched. This processor keeps its own fractional
 * playhead and advances it by a *signed* rate each sample, which gives
 * backspins, pitch bends and stalls for free.
 *
 * rate 1.0 == the deck at 33 1/3 RPM.
 */
class ScratchPlayhead extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            // a-rate so a fast wrist flick bends pitch within a single block
            { name: 'rate', defaultValue: 1, minValue: -16, maxValue: 16, automationRate: 'a-rate' },
            { name: 'gain', defaultValue: 1, minValue: 0, maxValue: 1, automationRate: 'a-rate' },
        ];
    }

    constructor() {
        super();
        /** @type {Float32Array[]} */
        this.channels = [];
        this.frames = 0;
        this.position = 0; // fractional sample index
        this.running = false;
        this.reportCounter = 0;
        // A held record makes no sound. Without this the playhead just repeats
        // one sample forever, which is a DC offset rather than silence.
        this.stallEnvelope = 1;

        this.port.onmessage = (event) => {
            const msg = event.data;

            switch (msg.type) {
                case 'load':
                    this.channels = msg.channels;
                    this.frames = msg.channels[0] ? msg.channels[0].length : 0;
                    this.position = 0;
                    this.port.postMessage({ type: 'loaded', frames: this.frames });
                    break;
                case 'play':
                    this.running = true;
                    break;
                case 'stop':
                    this.running = false;
                    break;
                case 'seek':
                    this.position = Math.max(0, Math.min(this.frames - 1, msg.frame));
                    break;
            }
        };
    }

    /** Linear interpolation between neighbouring samples. */
    sampleAt(channel, position) {
        const i = Math.floor(position);
        const frac = position - i;
        const a = channel[i];
        const b = i + 1 < channel.length ? channel[i + 1] : a;
        return a + (b - a) * frac;
    }

    process(_inputs, outputs, parameters) {
        const output = outputs[0];
        const blockSize = output[0].length;

        if (!this.running || this.frames === 0) {
            for (let c = 0; c < output.length; c++) output[c].fill(0);
            return true;
        }

        const rateParam = parameters.rate;
        const gainParam = parameters.gain;
        const rateIsConstant = rateParam.length === 1;
        const gainIsConstant = gainParam.length === 1;

        for (let i = 0; i < blockSize; i++) {
            const rate = rateIsConstant ? rateParam[0] : rateParam[i];
            const gain = gainIsConstant ? gainParam[0] : gainParam[i];

            // Off either end of the record: silence, and hold there so a
            // forward push picks the groove back up.
            if (this.position < 0 || this.position >= this.frames - 1) {
                this.position = Math.max(0, Math.min(this.frames - 1, this.position));
                for (let c = 0; c < output.length; c++) output[c][i] = 0;
                if (rate === 0) continue;
                // allow the playhead to move back into range
                const next = this.position + rate;
                if (next > 0 && next < this.frames - 1) this.position = next;
                continue;
            }

            // ~14ms glide, so stopping and starting the record doesn't click
            const stallTarget = Math.abs(rate) < 0.03 ? 0 : 1;
            this.stallEnvelope += (stallTarget - this.stallEnvelope) * 0.0015;

            const level = gain * this.stallEnvelope;
            for (let c = 0; c < output.length; c++) {
                const source = this.channels[c] || this.channels[0];
                output[c][i] = source ? this.sampleAt(source, this.position) * level : 0;
            }

            this.position += rate;
        }

        // ~20 position reports a second is plenty for a progress readout
        this.reportCounter += blockSize;
        if (this.reportCounter >= sampleRate / 20) {
            this.reportCounter = 0;
            this.port.postMessage({ type: 'position', frame: this.position });
        }

        return true;
    }
}

registerProcessor('scratch-playhead', ScratchPlayhead);
