import { Body, Controller, HttpCode, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  getHello(): any {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly appService: AppService) {}

  @Get('health')
  healthCheck() {
    return true;
  }

  @Post('pay/toss')
  @HttpCode(200)
  async tossPayWebHook(@Body() body: any) {
    //콘솔 로그 확인 용도
    console.log('[TOSS] HIT'); 
    console.log(JSON.stringify(body, null, 2));

      try {
    const data = body?.data ?? {};

    // ✅ 카드가 있으면 카드 정보, 없으면 easyPay.provider 사용
    const cardName = data.card?.company ?? data.easyPay?.provider ?? '없음';
    const cardNum = data.card?.number ?? null; // easyPay는 카드번호 없음

    // 토스 → 나이스 PayLog 형태로 매핑
    const payLog = {
      goodsName: data.orderName ?? ' ',
      buyerName: ' ',
      buyerTel: ' ',
      buyerEmail: ' ',
      amount: data.totalAmount ?? 0,
      paidAt: data.approvedAt ?? body?.createdAt ?? new Date().toISOString(),
      cardName,  
      cardNum,                              
      status: data.status ?? ' ',
      receiptUrl: data.receipt?.url ?? null,
    };

    await this.appService.savePayLog(payLog);
  } catch (err) {
    console.log(err);
  }

  return 'OK';
}
  
  @Post('pay')
  @HttpCode(200)
  async postPayWebHook(@Body() body: any) {
    const {
      goodsName,
      buyerName,
      buyerTel,
      buyerEmail,
      amount,
      paidAt,
      card,
      status,
      receiptUrl,
    } = body;

    const { cardName, cardNum } = card;

    try {
      await this.appService.savePayLog({
        goodsName,
        buyerName,
        buyerTel,
        buyerEmail,
        amount,
        paidAt,
        cardName,
        cardNum,
        status,
        receiptUrl,
      });
    } catch (err) {
      console.log(err);
    }

    return 'OK';
  }
}
