import * as cc from 'cc';
import Declaration from '../Declaration01';

const { ccclass } = cc._decorator;
const { BaseSubscriber } = Declaration;

@ccclass('VoiceManager01')
export class VoiceManager01 extends BaseSubscriber {
    
    private recognition: any = null;
    private isListening: boolean = false;
    private targetLetter: string = '';
    private currentLanguage: string = 'en-US';
    private isInitialized: boolean = false;
    private confidenceThreshold: number = 0.7;
    
    start() {
        super.start && super.start();
        cc.log('🎤 VoiceManager01: Component starting...');
        this.initVoiceRecognition();
        this.registerGameEvents();
        cc.log('🎤 VoiceManager01: Component started successfully');
    }
    
    private registerGameEvents(): void {
        cc.log('🎤 VoiceManager01: Registering game events...');
        
        // Game control events
        this.registerEvent('set-target-letter', this.onSetTargetLetter.bind(this));
        this.registerEvent('start-voice-input', this.startListening.bind(this));
        this.registerEvent('stop-voice-input', this.stopListening.bind(this));
        this.registerEvent('set-confidence-threshold', this.onSetConfidenceThreshold.bind(this));
        this.registerEvent('change-language', this.onChangeLanguage.bind(this));
        
        // Game state events
        this.registerEvent('game-paused', this.onGamePaused.bind(this));
        this.registerEvent('game-resumed', this.onGameResumed.bind(this));
        this.registerEvent('game-over', this.onGameOver.bind(this));
        
        cc.log('🎤 VoiceManager01: All events registered successfully');
    }
    
    private initVoiceRecognition(): void {
        cc.log('🎤 VoiceManager01: Initializing voice recognition...');
        
        if (!cc.sys.isBrowser) {
            cc.error('🎤 ❌ VoiceManager01: Not running in browser');
            this.fireEvent('voice-not-supported', { reason: 'not-browser' });
            return;
        }
        
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            cc.error('🎤 ❌ VoiceManager01: Speech Recognition API not available');
            this.fireEvent('voice-not-supported', { reason: 'no-api' });
            return;
        }
        
        // Check secure context
        const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        cc.log('🎤 VoiceManager01: Secure context check:', isSecure, 'Protocol:', location.protocol, 'Hostname:', location.hostname);
        
        if (!isSecure) {
            cc.error('🎤 ❌ VoiceManager01: Requires HTTPS or localhost');
            this.fireEvent('voice-not-supported', { reason: 'insecure-context' });
            return;
        }
        
        try {
            cc.log('🎤 VoiceManager01: Creating SpeechRecognition instance...');
            this.recognition = new SpeechRecognition();
            this.setupRecognitionProperties();
            this.setupRecognitionEvents();
            this.isInitialized = true;
            
            cc.log('🎤 ✅ VoiceManager01: Initialized successfully!');
            this.fireEvent('voice-initialized');
            
        } catch (error) {
            cc.error('🎤 ❌ VoiceManager01: Failed to initialize:', error);
            this.fireEvent('voice-init-failed', { error });
        }
    }
    
    private setupRecognitionProperties(): void {
        this.recognition.lang = this.currentLanguage;
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1; // Chỉ lấy 1 kết quả duy nhất
    }
    
    private setupRecognitionEvents(): void {
        this.recognition.onstart = () => {
            this.isListening = true;
            cc.log('🎤 VoiceManager01: Recognition STARTED - Listening for:', this.targetLetter);
            this.fireEvent('voice-started', { 
                targetLetter: this.targetLetter,
                language: this.currentLanguage 
            });
        };
        
        this.recognition.onresult = (event: any) => {
            cc.log('🎤 VoiceManager01: Got voice result, processing...');
            
            // Stop recognition immediately after getting result
            this.stopListening();
            
            // Chỉ lấy kết quả đầu tiên (có confidence cao nhất)
            const firstResult = event.results[0][0];
            const result = {
                transcript: firstResult.transcript.trim().toUpperCase(),
                confidence: firstResult.confidence
            };
            
            cc.log('🎤 VoiceManager01: Single result:', result);
            
            // Find best match
            const bestMatch = this.findBestLetterMatch([result]);
            
            cc.log('🎤 VoiceManager01: Best match:', bestMatch);
            cc.log('🎤 VoiceManager01: Target letter:', this.targetLetter);
            
            this.fireEvent('voice-result', {
                result: result,
                bestMatch: bestMatch,
                targetLetter: this.targetLetter
            });
            
            // Check if match is successful
            if (bestMatch.isMatch && bestMatch.confidence >= this.confidenceThreshold) {
                cc.log('🎤 ✅ VoiceManager01: MATCH! Letter:', bestMatch.letter, 'Confidence:', bestMatch.confidence);
                this.fireEvent('letter-matched', {
                    letter: bestMatch.letter,
                    confidence: bestMatch.confidence,
                    transcript: bestMatch.transcript
                });
            } else {
                cc.log('🎤 ❌ VoiceManager01: NO MATCH! Expected:', this.targetLetter, 'Got:', bestMatch.letter);
                this.fireEvent('letter-not-matched', {
                    expected: this.targetLetter,
                    received: bestMatch.letter,
                    confidence: bestMatch.confidence,
                    transcript: bestMatch.transcript
                });
            }
        };
        
        this.recognition.onerror = (event: any) => {
            this.isListening = false;
            cc.error('🎤 ❌ VoiceManager01: Recognition ERROR:', event.error);
            
            this.fireEvent('voice-error', { 
                error: event.error,
                message: this.getErrorMessage(event.error)
            });
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            cc.log('🎤 ⏹️ VoiceManager01: Recognition ENDED');
            this.fireEvent('voice-ended');
        };
    }
    
    private findBestLetterMatch(results: any[]): any {
        let bestMatch = {
            letter: '',
            confidence: 0,
            transcript: '',
            isMatch: false
        };
        
        for (const result of results) {
            const letters = result.transcript.match(/[A-Z]/g) || [];
            
            // Check if target letter is in the transcript
            if (letters.includes(this.targetLetter)) {
                if (result.confidence > bestMatch.confidence) {
                    bestMatch = {
                        letter: this.targetLetter,
                        confidence: result.confidence,
                        transcript: result.transcript,
                        isMatch: true
                    };
                }
            } else if (!bestMatch.isMatch && letters.length > 0) {
                // If no match found yet, record the best non-match
                if (result.confidence > bestMatch.confidence) {
                    bestMatch = {
                        letter: letters[0], // First letter found
                        confidence: result.confidence,
                        transcript: result.transcript,
                        isMatch: false
                    };
                }
            }
        }
        
        return bestMatch;
    }
    
    private getErrorMessage(error: string): string {
        switch (error) {
            case 'not-allowed':
                return 'Microphone permission denied. Please allow microphone access.';
            case 'no-speech':
                return 'No speech detected. Please try speaking louder.';
            case 'audio-capture':
                return 'Audio capture failed. Please check your microphone.';
            case 'network':
                return 'Network error. Please check your internet connection.';
            case 'service-not-allowed':
                return 'Speech service not allowed. Please check browser settings.';
            case 'bad-grammar':
                return 'Speech recognition grammar error.';
            case 'language-not-supported':
                return 'Language not supported.';
            default:
                return `Unknown error: ${error}`;
        }
    }
    
    // Event handlers
    public onSetTargetLetter(data: { letter: string }): void {
        this.targetLetter = data.letter.toUpperCase();
        cc.log('🎯 VoiceManager01: Target letter set to:', this.targetLetter);
        cc.log('🎯 VoiceManager01: Event received with data:', data);
        this.fireEvent('target-letter-set', { letter: this.targetLetter });
    }
    
    private onSetConfidenceThreshold(data: { threshold: number }): void {
        this.confidenceThreshold = Math.max(0, Math.min(1, data.threshold));
        this.fireEvent('confidence-threshold-set', { threshold: this.confidenceThreshold });
    }
    
    private onChangeLanguage(data: { language: string }): void {
        this.setLanguage(data.language);
    }
    
    private onGamePaused(): void {
        if (this.isListening) {
            this.stopListening();
        }
    }
    
    private onGameResumed(): void {
        // Game can decide whether to auto-resume listening
    }
    
    private onGameOver(): void {
        if (this.isListening) {
            this.stopListening();
        }
    }
    
    // Public methods
    startListening(): void {
        cc.log('🎤 VoiceManager01: startListening() called');
        cc.log('🎤 VoiceManager01: isInitialized:', this.isInitialized);
        cc.log('🎤 VoiceManager01: isListening:', this.isListening);
        cc.log('🎤 VoiceManager01: targetLetter:', this.targetLetter);
        
        if (!this.isInitialized) {
            cc.error('🎤 ❌ VoiceManager01: Not initialized!');
            this.fireEvent('voice-error', { 
                error: 'not-initialized',
                message: 'Voice recognition not initialized'
            });
            return;
        }
        
        if (this.isListening) {
            cc.warn('🎤 ⚠️ VoiceManager01: Already listening');
            return;
        }
        
        if (!this.targetLetter) {
            cc.error('🎤 ❌ VoiceManager01: No target letter set!');
            this.fireEvent('voice-error', { 
                error: 'no-target',
                message: 'No target letter set'
            });
            return;
        }
        
        try {
            cc.log('🎤 VoiceManager01: Starting recognition for letter:', this.targetLetter);
            this.recognition.start();
        } catch (error) {
            cc.error('🎤 ❌ VoiceManager01: Failed to start recognition:', error);
            this.fireEvent('voice-error', { 
                error: 'start-failed',
                message: 'Failed to start voice recognition',
                details: error
            });
        }
    }
    
    stopListening(): void {
        if (!this.recognition || !this.isListening) {
            return;
        }
        
        try {
            this.recognition.stop();
        } catch (error) {
            console.error('VoiceManager01: Failed to stop recognition:', error);
        }
    }
    
    setLanguage(language: string): void {
        this.currentLanguage = language;
        if (this.recognition) {
            this.recognition.lang = language;
            this.fireEvent('language-changed', { language });
        }
    }
    
    setConfidenceThreshold(threshold: number): void {
        this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
    }
    
    // Getters
    isSupported(): boolean {
        return this.isInitialized;
    }
    
    getCurrentTarget(): string {
        return this.targetLetter;
    }
    
    getIsListening(): boolean {
        return this.isListening;
    }
    
    getLanguage(): string {
        return this.currentLanguage;
    }
    
    getConfidenceThreshold(): number {
        return this.confidenceThreshold;
    }
    
    // Cleanup
    onDestroy(): void {
        if (this.isListening) {
            this.stopListening();
        }
        super.onDestroy && super.onDestroy();
    }
}