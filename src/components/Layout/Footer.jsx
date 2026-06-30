export default function Footer() {
  return (
    <footer className="border-t border-gray-700 px-4 py-4 text-sm text-gray-400">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="order-2 text-center md:order-1 md:text-left">
          <p className="font-bold text-gray-300">Thông tin liên hệ</p>
          <ul className="mt-2 space-y-1">
            <li>
              • Facebook:{" "}
              <a
                href="https://www.facebook.com/le.kiet.100046"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white hover:underline"
              >
                Le Kiet
              </a>{" "}
              |{" "}
              <a
                href="https://www.facebook.com/quan.TORU"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white hover:underline"
              >
                Quan Ngo
              </a>
            </li>
            <li>
              • Email:{" "}
              <a
                href="mailto:ark9manager@gmail.com"
                className="transition hover:text-white hover:underline"
              >
                ark9manager@gmail.com
              </a>
            </li>
          </ul>
        </div>

        <p className="order-1 max-w-2xl text-center font-semibold md:order-2 md:text-right">
          © Hypergryph Co., Ltd. All Rights Reserved. Mọi dữ liệu/tài nguyên sử
          dụng trên trang đều thuộc quyền sở hữu của Hypergryph
        </p>
      </div>
    </footer>
  );
}
