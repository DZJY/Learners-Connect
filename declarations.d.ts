declare module 'mammoth/mammoth.browser';
declare module 'officegen';
declare module 'file-type' {
    function fromBuffer(buffer: Buffer): Promise<{ext: string, mime: string} | undefined>;
  }