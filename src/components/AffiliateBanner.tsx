// A8.net等のアフィリエイトバナー。計測用パラメータを含むため、リンク先・画像URLは書き換えないこと
export function AffiliateBanner() {
  return (
    <div className="flex flex-col items-center gap-1">
      <a
        href="https://px.a8.net/svt/ejp?a8mat=4B1PLT+7RTWI2+52IU+5ZMCH"
        rel="nofollow noopener noreferrer"
        target="_blank"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          style={{ border: 0 }}
          width={300}
          height={250}
          alt=""
          src="https://www24.a8.net/svt/bgt?aid=260420321470&wid=008&eno=01&mid=s00000023655001006000&mc=1"
        />
      </a>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        style={{ border: 0 }}
        width={1}
        height={1}
        src="https://www13.a8.net/0.gif?a8mat=4B1PLT+7RTWI2+52IU+5ZMCH"
        alt=""
      />
    </div>
  );
}
