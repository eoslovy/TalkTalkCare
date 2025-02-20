import { OpenVidu, Session, Publisher } from 'openvidu-browser';

class OpenviduService {
    private OV: OpenVidu;
    private session: Session | null = null;
    private publisher: Publisher | null = null;

    constructor() {
        this.OV = new OpenVidu();
        this.OV.enableProdMode();
        this.setupIceServers();
    }

    private async setupIceServers() {
      try {
          // 기본 STUN 서버 설정
          const iceServers: RTCIceServer[] = [{ urls: ['stun:stun.l.google.com:19302'] }];
  
          // TURN 서버 요청
          const response = await fetch('https://www.talktalkcare.com/api/turn-credentials');
          if (!response.ok) throw new Error(`TURN 서버 오류: ${response.status}`);
  
          const data = await response.json();
          if (data.username && data.credential) {
              console.log('✅ TURN 서버 인증정보 획득 완료');
  
              // TURN 서버 추가 (WebRTC 표준 형식 준수)
              iceServers.push({
                  urls: ['turn:54.180.148.155:3478', 'turns:54.180.148.155:5349'],
                  username: data.username, // ✅ TypeScript가 허용하는 형식 적용
                  credential: data.credential
              });
          }
  
          this.OV.setAdvancedConfiguration({ iceServers });
          console.log('✅ ICE 서버 설정 적용 완료:', iceServers);
      } catch (error) {
          console.warn('❌ TURN 서버 설정 실패: 기본 STUN만 사용');
          this.OV.setAdvancedConfiguration({
              iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }]
          });
      }
  }
  

    async joinSession(sessionId: string): Promise<{ session: Session; publisher: Publisher }> {
        if (this.session && this.session.sessionId === sessionId) {
            console.log('⚠️ 이미 연결된 세션 재사용:', sessionId);
            return { session: this.session, publisher: this.publisher! };
        }

        if (this.session) {
            await this.leaveSession();
        }

        this.session = this.OV.initSession();

        // WebRTC 이벤트 리스너 추가
        this.session.on('connectionCreated', (event) => {
            console.log(`🟢 WebRTC 연결 생성됨: ${event.connection.connectionId}`);
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
        return { session: this.session, publisher: this.publisher };
    }

    async leaveSession() {
        if (this.session) {
            try {
                if (this.publisher) {
                    this.session.unpublish(this.publisher);
                    this.publisher = null;
                    console.log('🛑 Publisher 스트림 해제 완료');
                }

                this.session.disconnect();
                this.session = null;
                console.log('✅ 세션 정상 종료');
            } catch (error) {
                console.error('🚨 세션 종료 중 에러:', error);
            }
        }
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
            console.log('⚠️ 세션이 이미 존재함:', sessionId);
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
