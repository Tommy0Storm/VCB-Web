class VcbCaptureProcessor extends AudioWorkletProcessor {
  constructor(options){
    super();
    this._f = (options && options.processorOptions && options.processorOptions.frameSize) || 1024;
  }
  process(inputs/*, outputs, parameters*/){
    const input = inputs[0];
    if(!input || !input[0]) return true;
    const ch = input[0];
    this.port.postMessage(new Float32Array(ch));
    return true;
  }
}
registerProcessor('vcb-capture', VcbCaptureProcessor);

