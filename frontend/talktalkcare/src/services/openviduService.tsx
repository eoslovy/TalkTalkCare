import { OpenVidu, Session, Publisher } from 'openvidu-browser';

class OpenviduService {
    private OV: OpenVidu;
    private session: Session | null = null;
    private publisher: Publisher | null = null;
    private iceServersConfigured = false;  // ICE 서버 설정 상태 추적

    constructor() {
        this.OV = new OpenVidu();
        this.OV.enableProdMode();
        this.setupIceServers(); // 생성자에서 한 번만 실행
    }

    private async setupIceServers() {
        if (this.iceServersConfigured) {
            console.log("🔄 TURN 서버 설정이 이미 적용됨. 설정 요청 생략.");
            return;
        }

        try {
            const response = await fetch('https://www.talktalkcare.com/api/turn-credentials');
            if (!response.ok) throw new Error(`TURN 서버 응답 오류: ${response.status}`);

            const { username, credential } = await response.json();
            console.log("✅ TURN 서버 인증정보 획득 완료.");

            this.OV.setAdvancedConfiguration({
                iceServers: [
                    { urls: ['stun:stun.l.google.com:19302'] },
                    {
                        urls: ['turn:54.180.148.155:3478', 'turns:54.180.148.155:5349'],
                        username,
                        credential
                    }
                ]
            });

            this.iceServersConfigured = true;  // 설정 완료 표시
            console.log("✅ TURN 서버 설정 적용 완료.");
        } catch (error) {
            console.error("❌ TURN 서버 설정 실패:", error);
            throw error;
        }
    }

    async joinSession(sessionId: string): Promise<{ session: Session; publisher: Publisher }> {
        try {
            if (this.session) {
                if (this.session.sessionId === sessionId) {
                    console.log('⚠️ 이미 연결된 세션 재사용:', sessionId);
                    return { session: this.session, publisher: this.publisher! };
                }
                await this.leaveSession();
            }

            this.session = this.OV.initSession();

            // WebRTC 이벤트 리스너 추가
            this.session.on('connectionCreated', (event) => {
                console.log(`🟢 WebRTC 연결 생성됨: ${event.connection.connectionId}`);
            });

            this.session.on('connectionDestroyed', (event) => {
                console.log(`❌ WebRTC 연결 종료됨: ${event.connection.connectionId}`);
            });

            this.session.on('exception', (exception) => {
                console.error('⚠️ WebRTC 예외 발생:', exception);
            });

            const token = await this.getToken(sessionId);
            await this.session.connect(token);

            this.publisher = await this.OV.initPublisherAsync(undefined, {
                audioSource: undefined,
                videoSource: undefined,
                publishAudio: true,
                publishVideo: true,
                resolution: '640x480',
                frameRate: 30,
                insertMode: 'APPEND',
                mirror: false
            });

            await this.session.publish(this.publisher);

            // WebRTC ICE Connection State 확인
            this.publisher.on('streamPlaying', () => {
                const rtcPeerConnection = this.publisher?.stream.getRTCPeerConnection();
                if (rtcPeerConnection) {
                    console.log(`📡 Publisher ICE Connection State: ${rtcPeerConnection.iceConnectionState}`);
                }
            });

            return { session: this.session, publisher: this.publisher };
        } catch (error) {
            console.error('세션 연결 실패:', error);
            throw error;
        }
    }

    async leaveSession() {
        if (this.session) {
            this.session.disconnect();
        }
        this.session = null;
        this.publisher = null;
    }

    private async createSession(sessionId: string): Promise<string> {
        const response = await fetch('https://www.talktalkcare.com/openvidu/api/sessions', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa('OPENVIDUAPP:talktalkcare'),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ customSessionId: sessionId }),
        });

        if (response.status === 409) {
            console.log('세션이 이미 존재함:', sessionId);
            return sessionId;
        }

        const data = await response.json();
        return data.id;
    }

    private async createToken(sessionId: string): Promise<string> {
        const response = await fetch(`https://www.talktalkcare.com/openvidu/api/sessions/${sessionId}/connection`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa('OPENVIDUAPP:talktalkcare')
            }
        });

        const data = await response.json();
        return data.token;
    }

    private async getToken(sessionId: string): Promise<string> {
        const sid = await this.createSession(sessionId);
        return await this.createToken(sid);
    }
}

export default new OpenviduService();
