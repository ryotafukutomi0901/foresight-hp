import { NextResponse } from "next/server";

/*
 * 問い合わせの受け口。
 *
 * 送信先メールアドレス・メール送信サービスがまだ確定していないため、
 * 「送信できたことにする」ダミー実装はしない。バリデーションまでを行い、
 * 送信先が未設定の場合は 503 と明示的なメッセージを返す。
 * 利用者が送れたと誤解したまま連絡が届かない、という最悪の事故を避けるため。
 *
 * 送信先が決まったら CONTACT_TO_EMAIL を設定し、下部の deliver() に
 * 実際の送信処理(Resend / SendGrid / SES 等)を実装する。
 */

export const runtime = "nodejs";

type Payload = {
  type?: unknown;
  name?: unknown;
  contact?: unknown;
  tel?: unknown;
  message?: unknown;
  /* ボット除け(人間には見えない項目。値が入っていたら破棄する) */
  company?: unknown;
};

const MAX = { name: 100, contact: 200, tel: 40, message: 4000 } as const;

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "リクエストの形式が正しくありません。" },
      { status: 400 },
    );
  }

  // ハニーポット。値が入っていれば黙って成功を返し、実処理はしない。
  if (str(body.company)) {
    return NextResponse.json({ ok: true });
  }

  const name = str(body.name);
  const contact = str(body.contact);
  const tel = str(body.tel);
  const message = str(body.message);
  const type = str(body.type);

  const errors: Record<string, string> = {};

  if (!name) errors.name = "お名前を入力してください。";
  else if (name.length > MAX.name) errors.name = "お名前が長すぎます。";

  if (!contact) {
    errors.contact = "メールアドレスを入力してください。";
  } else if (contact.length > MAX.contact || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
    errors.contact = "メールアドレスの形式が正しくありません。";
  }

  if (tel && tel.length > MAX.tel) errors.tel = "電話番号が長すぎます。";

  if (!message) errors.message = "車の状態やご相談内容を入力してください。";
  else if (message.length > MAX.message) errors.message = "内容が長すぎます。";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const to = process.env.CONTACT_TO_EMAIL;
  if (!to) {
    // 送信先が未設定。成功を装わず、電話等の代替導線へ誘導する。
    return NextResponse.json(
      {
        ok: false,
        error:
          "現在、フォームからの送信を受け付けられません。お手数ですが、お電話にてご連絡ください。",
      },
      { status: 503 },
    );
  }

  await deliver({ to, type, name, contact, tel, message });

  return NextResponse.json({ ok: true });
}

/**
 * 実際の送信処理。メール送信サービス確定後にここだけを差し替える。
 * 呼び出し側(POST)はプロバイダに依存しない。
 */
async function deliver(input: {
  to: string;
  type: string;
  name: string;
  contact: string;
  tel: string;
  message: string;
}): Promise<void> {
  throw new Error(
    `CONTACT_TO_EMAIL(${input.to})は設定されていますが、メール送信処理が未実装です。`,
  );
}
