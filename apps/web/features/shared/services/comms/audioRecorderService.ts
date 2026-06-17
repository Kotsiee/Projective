export interface AudioRecorderResult {
	blob: Blob;
	file: File;
	mimeType: string;
	size: number;
}

export class AudioRecorderService {
	private mediaRecorder: MediaRecorder | null = null;
	private audioChunks: Blob[] = [];
	private _stream: MediaStream | null = null;
	private isRecording = false;

	// New getter so the visualizer can access the live microphone data
	public get stream(): MediaStream | null {
		return this._stream;
	}

	public async start(): Promise<void> {
		try {
			this.audioChunks = [];
			this._stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			const mimeType = this.getBestSupportedMimeType();
			const options = mimeType ? { mimeType } : undefined;

			this.mediaRecorder = new MediaRecorder(this._stream, options);

			this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
				if (event.data.size > 0) {
					this.audioChunks.push(event.data);
				}
			};

			this.mediaRecorder.start();
			this.isRecording = true;
		} catch (error) {
			console.error('🎤 [AudioRecorder] Failed to start recording:', error);
			throw new Error('Microphone access denied or unavailable.');
		}
	}

	public stop(): Promise<AudioRecorderResult | null> {
		return new Promise((resolve) => {
			if (!this.mediaRecorder || !this.isRecording) {
				this.cleanup();
				return resolve(null);
			}

			this.mediaRecorder.onstop = () => {
				const finalMimeType = this.mediaRecorder?.mimeType || 'audio/webm';
				const audioBlob = new Blob(this.audioChunks, { type: finalMimeType });

				const extension = finalMimeType.includes('mp4')
					? 'mp4'
					: finalMimeType.includes('ogg')
					? 'ogg'
					: 'webm';
				const filename = `voice-message-${Date.now()}.${extension}`;
				const audioFile = new File([audioBlob], filename, { type: finalMimeType });

				this.cleanup();
				resolve({
					blob: audioBlob,
					file: audioFile,
					mimeType: finalMimeType,
					size: audioFile.size,
				});
			};

			this.mediaRecorder.stop();
			this.isRecording = false;
		});
	}

	public cancel(): void {
		if (this.mediaRecorder && this.isRecording) {
			this.mediaRecorder.onstop = null;
			this.mediaRecorder.stop();
		}
		this.cleanup();
	}

	private getBestSupportedMimeType(): string | undefined {
		const types = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'];
		for (const type of types) {
			if (MediaRecorder.isTypeSupported(type)) return type;
		}
		return undefined;
	}

	private cleanup(): void {
		this.isRecording = false;
		this.audioChunks = [];
		if (this._stream) {
			this._stream.getTracks().forEach((track) => track.stop());
			this._stream = null;
		}
		this.mediaRecorder = null;
	}
}
