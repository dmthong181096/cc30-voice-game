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
        this.initVoiceRecognition();
        this.registerGameEvents();
    }
    
    private registerGameEvents(): void {
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
    }
    
    private initVoiceRecognition(): void {
        if (!cc.sys.isBrowser) {
            console.warn('VoiceManager01: Voice recognition only supported on web');
            this.fireEvent('voice-not-supported', { reason: 'not-browser' });
            return;
        }
        
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('VoiceManager01: Speech Recognition not supported in this browser');
            this.fireEvent('voice-not-supported', { reason: 'no-api' });
            return;
        }
        
        // Check secure context
        const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        if (!isSecure) {
            console.warn('VoiceManager01: Speech Recognition requires HTTPS or localhost');
            this.fireEvent('voice-not-supported', { reason: 'insecure-context' });
            return;
        }
        
        try {
            this.recognition = new SpeechRecognition();
            this.setupRecognitionProperties();
            this.setupRecognitionEvents();
            this.isInitialized = true;
            
            console.log('VoiceManager01: Initialized successfully');
            this.fireEvent('voice-initialized');
            
        } catch (error) {
            console.error('VoiceManager01: Failed to initialize:', error);
            this.fireEvent('voice-init-failed', { error });
        }
    }
    
    private setupRecognitionProperties(): void {
        this.recognition.lang = this.currentLanguage;
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 3; // Get multiple alternatives for better matching
    }
    
    private setupRecognitionEvents(): void {
        this.recognition.onstart = () => {
            this.isListening = true;
            this.fireEvent('voice-started', { 
                targetLetter: this.targetLetter,
                language: this.currentLanguage 
            });
        };
        
        this.recognition.onresult = (event: any) => {
            const results = [];
            
            // Process all alternatives
            for (let i = 0; i < event.results[0].length; i++) {
                const alternative = event.results[0][i];
                results.push({
                    transcript: alternative.transcript.trim().toUpperCase(),
                    confidence: alternative.confidence
                });
            }
            
            // Find best match
            const bestMatch = this.findBestLetterMatch(results);
            
            this.fireEvent('voice-result', {
                results: results,
                bestMatch: bestMatch,
                targetLetter: this.targetLetter
            });
            
            // Check if match is successful
            if (bestMatch.isMatch && bestMatch.confidence >= this.confidenceThreshold) {
                this.fireEvent('letter-matched', {
                    letter: bestMatch.letter,
                    confidence: bestMatch.confidence,
                    transcript: bestMatch.transcript
                });
            } else {
                this.fireEvent('letter-not-matched', {
                    expected: this.targetLetter,
                    received: bestMatch.letter,
                    confidence: bestMatch.confidence,
                    transcript: bestMatch.transcript,
                    allResults: results
                });
            }
        };
        
        this.recognition.onerror = (event: any) => {
            this.isListening = false;
            
            this.fireEvent('voice-error', { 
                error: event.error,
                message: this.getErrorMessage(event.error)
            });
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
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
    private onSetTargetLetter(data: { letter: string }): void {
        this.targetLetter = data.letter.toUpperCase();
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
        if (!this.isInitialized) {
            this.fireEvent('voice-error', { 
                error: 'not-initialized',
                message: 'Voice recognition not initialized'
            });
            return;
        }
        
        if (this.isListening) {
            console.warn('VoiceManager01: Already listening');
            return;
        }
        
        if (!this.targetLetter) {
            this.fireEvent('voice-error', { 
                error: 'no-target',
                message: 'No target letter set'
            });
            return;
        }
        
        try {
            this.recognition.start();
        } catch (error) {
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