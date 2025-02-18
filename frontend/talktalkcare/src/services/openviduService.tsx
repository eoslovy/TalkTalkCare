import { Component } from 'react';
import {OpenVidu,Session,Publisher,StreamManager,Subscriber} from 'openvidu-browser';

class OpenviduService {
    private OV: OpenVidu;
    private session: Session | null = null;
    private publisher: Publisher | null = null;
  
    constructor() {
      this.OV = new OpenVidu();
      this.OV.enableProdMode();
      
      // ICE 서버 구성 개선
      this.OV.setAdvancedConfiguration({
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302'] },
          {
            urls: ['turn:54.180.148.155:3478'],
            username: 'turnuser',
            credential: 'turnpassword'
          },
          {
            urls: ['turns:54.180.148.155:5349'],
            username: 'turnuser',
            credential: 'turnpassword'
          }
        ]
      });
    }
  

    async joinSession(sessionId: string): Promise<{ session: Session; publisher: Publisher }> {
      // 세션 재사용 로직 추가
      if (this.session && this.session.sessionId === sessionId) {
        console.log('⚠️ 이미 연결된 세션 재사용:', sessionId);
        return { session: this.session, publisher: this.publisher! };
      }

      if (this.session) {
        await this.leaveSession();
      }

      this.session = this.OV.initSession();

      // 재연결 관련 이벤트 리스너 추가
      this.session.on('reconnecting', () => {
        console.log('🔄 세션 재연결 중...');
      });

      this.session.on('reconnected', () => {
        console.log('✅ 세션 재연결 성공');
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
        this.session.disconnect();
      }
      this.session = null;
      this.publisher = null;
    }
  
    // OpenVidu 세션 생성 API 호출 (프록시를 통해 호출)
    private async createSession(sessionId: string): Promise<string> {
      const response = await fetch('https://www.talktalkcare.com/openvidu/api/sessions', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa('OPENVIDUAPP:talktalkcare'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customSessionId: sessionId }),
        credentials: 'include'
      });
  
      console.log('세션 생성 응답:', response.status);
  
      // 409: 이미 존재하는 경우 정상 처리
      if (response.status === 409) {
        console.log('세션이 이미 존재함:', sessionId);
        return sessionId;
      }
  
      if (!response.ok) {
        console.error('세션 생성 실패:', response.status, await response.text());
        return sessionId;
      }
  
      const data = await response.json();
      console.log('세션 생성 성공:', data.id);
      return data.id;
    }
  
    // OpenVidu 토큰 생성 API 호출
    private async createToken(sessionId: string): Promise<string> {
      const response = await fetch(`https://www.talktalkcare.com/openvidu/api/sessions/${sessionId}/connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('OPENVIDUAPP:talktalkcare')
        },
        credentials: 'include'
      });
  
      console.log('토큰 생성 응답:', response.status);
      if (!response.ok) {
        console.error('토큰 생성 실패:', response.status, await response.text());
        throw new Error(`토큰 생성 실패: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('토큰 생성 성공:', data.token);
      return data.token;
    }
  
    private async getToken(sessionId: string): Promise<string> {
      const sid = await this.createSession(sessionId);
      return await this.createToken(sid);
    }
  }
  
  export default new OpenviduService();


