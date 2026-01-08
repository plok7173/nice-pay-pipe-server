import { Injectable } from '@nestjs/common';
import axios from 'axios';
import dayjs from 'dayjs';
import { PayLog } from './types';

@Injectable()
export class AppService {
  constructor() {}

  async savePayLog(data: PayLog) {
    const microsoftTeamsWebhookUrl = process.env.MICROSOFT_TEAMS_WEBHOOK_URL;

    if (!microsoftTeamsWebhookUrl) {
      console.log('MICROSOFT_TEAMS_WEBHOOK_URL is not set');
    }

    try {
      await axios.post(microsoftTeamsWebhookUrl, this.getCardBody(data));
    } catch (err) {
      console.log(err);
    }
  }

  private getCardBody(paymentInfo: PayLog) {
    const isPaid =
      paymentInfo.status === 'paid' || paymentInfo.status === 'DONE';

    return {
      kind: 'PaymentWebhook',
      attachments: [
        {
          contentType: 'MessageCard',
          contentUrl: null,
          content: {
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            type: 'AdaptiveCard',
            version: '1.2',
            body: [
              {
                type: 'TextBlock',
                text: '알림 정보 : ' + (isPaid ? '결제 완료' : '결제 취소'),
              },
              {
                type: 'TextBlock',
                text: '상품명 : ' + paymentInfo.goodsName,
              },
              {
                type: 'TextBlock',
                text: '구매자 이름 : ' + paymentInfo.buyerName,
              },
              {
                type: 'TextBlock',
                text: '구매자 연락처 : ' + (paymentInfo.buyerTel || '없음'),
              },
              {
                type: 'TextBlock',
                text: '구매자 이메일 : ' + (paymentInfo.buyerEmail || '없음'),
              },
              {
                type: 'TextBlock',
                text: '결제 금액 : ' + paymentInfo.amount,
              },
              {
                type: 'TextBlock',
                text:
                  '결제 일시 : ' +
                  dayjs(paymentInfo.paidAt)
                    .add(9, 'hours')
                    .format('YYYY-MM-DD HH:mm:ss'),
              },
              {
                type: 'TextBlock',
                text: '결제 수단 : ' + (paymentInfo.cardName || '없음'),
              },
              {
                type: 'TextBlock',
                text: '카드 번호 : ' + (paymentInfo.cardNum || '없음'),
              },
              {
                type: 'TextBlock',
                text: '영수증 링크 : ' + (paymentInfo.receiptUrl || '없음'),
              },
            ],
          },
        },
      ],
    };
  }
}
