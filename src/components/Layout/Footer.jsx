export default function Footer() {
  return (
    <footer className="border-t border-gray-700 px-4 py-4 text-sm text-gray-400">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 text-center">
        <p className="max-w-2xl font-semibold">
          © Hypergryph Co., Ltd. All Rights Reserved. Mọi dữ liệu/tài nguyên sử
          dụng trên trang đều thuộc quyền sở hữu của Hypergryph
        </p>

        <ul className="space-y-1">
          <li>
            • Facebook:{" "}
            <a
              href="https://www.facebook.com/profile.php?id=61577839262188"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white hover:underline"
            >
              A9vn
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
    </footer>
  );
}