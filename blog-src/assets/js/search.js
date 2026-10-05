/* ブログ内検索。索引 (searchindex.json) を最初の入力時に 1 回だけ読み、端末内で絞り込む。
   - もくじの検索欄: 入力中に候補を 6 件まで出す。Enter で検索ページへ
   - 検索ページ: ?q= の結果を全部出す
   ことばは空白で区切り、すべてを含む記事だけ残す。全角/半角・大文字/小文字は同じ扱い。 */
(function () {
  var s = document.currentScript, INDEX = s.getAttribute("data-index"), PAGE = s.getAttribute("data-search");
  var docs = null, loading = null;
  function norm(t) { return (t || "").normalize("NFKC").toLowerCase(); }
  function load() {
    if (docs) return Promise.resolve(docs);
    if (!loading) loading = fetch(INDEX).then(function (r) { return r.json(); }).then(function (j) {
      docs = j.map(function (d) { d.nt = norm(d.t); d.nd = norm(d.d); d.nb = norm(d.b); return d; });
      return docs;
    });
    return loading;
  }
  function terms(q) { return norm(q).split(/[\s　]+/).filter(Boolean); }
  function search(q) {
    var ts = terms(q); if (!ts.length) return [];
    var out = [];
    docs.forEach(function (d) {
      var score = 0, pos = -1;
      for (var i = 0; i < ts.length; i++) {
        var t = ts[i], inT = d.nt.indexOf(t) >= 0, inD = d.nd.indexOf(t) >= 0, p = d.nb.indexOf(t);
        if (!inT && !inD && p < 0) return;
        score += (inT ? 6 : 0) + (inD ? 3 : 0) + (p >= 0 ? 1 : 0);
        if (p >= 0 && (pos < 0 || p < pos)) pos = p;
      }
      out.push({ d: d, score: score, pos: pos, t: ts });
    });
    return out.sort(function (a, b) { return b.score - a.score; });
  }
  function esc(t) { return t.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function mark(text, ts) {
    var h = esc(text);
    ts.forEach(function (t) {
      if (!t) return;
      var re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      h = h.replace(re, function (m) { return "<mark>" + m + "</mark>"; });
    });
    return h;
  }
  function snippet(r) {
    // 本文に当たりがあればその前後、無ければ説明文
    if (r.pos < 0) return esc(r.d.d);
    var b = r.d.b, nb = r.d.nb, from = Math.max(0, r.pos - 28), to = Math.min(b.length, r.pos + 72);
    // NFKC で長さが変わる文字は稀なので、位置は平文側にそのまま当てる
    var cut = b.slice(from, to);
    return (from > 0 ? "…" : "") + mark(cut, r.t) + (to < b.length ? "…" : "");
  }
  function row(r) {
    return '<li><a href="' + r.d.u + '"><span class="scat">' + esc(r.d.c) + '</span><b>' + mark(r.d.t, r.t) + '</b><span>' + snippet(r) + '</span></a></li>';
  }
  // もくじの検索欄 (候補)
  var side = document.getElementById("q-side"), sugg = document.getElementById("sugg");
  if (side && sugg) {
    var timer;
    side.addEventListener("input", function () {
      clearTimeout(timer);
      var q = side.value;
      if (!terms(q).length) { sugg.hidden = true; sugg.innerHTML = ""; return; }
      timer = setTimeout(function () {
        load().then(function () {
          var rs = search(q).slice(0, 6);
          sugg.innerHTML = rs.length
            ? '<ul class="rows">' + rs.map(row).join("") + '</ul><a class="smore" href="' + PAGE + '?q=' + encodeURIComponent(q) + '">すべての結果</a>'
            : '<div class="snone">見つかりませんでした</div>';
          sugg.hidden = false;
        });
      }, 120);
    });
    side.addEventListener("focus", function () { load(); });
    document.addEventListener("click", function (e) { if (!e.target.closest(".sbox")) sugg.hidden = true; });
    side.addEventListener("keydown", function (e) { if (e.key === "Escape") { sugg.hidden = true; } });
  }
  // 検索ページ
  var page = document.getElementById("q-page"), res = document.getElementById("search-results");
  if (page && res) {
    var q0 = new URLSearchParams(location.search).get("q") || "";
    page.value = q0;
    function run(q) {
      if (!terms(q).length) { res.innerHTML = ""; return; }
      load().then(function () {
        var rs = search(q);
        res.innerHTML = '<p class="meta">' + rs.length + '件</p>' + (rs.length ? '<ul class="rows">' + rs.map(row).join("") + '</ul>' : '<p>見つかりませんでした。別のことばで試してみてください。</p>');
      });
    }
    run(q0);
    var t2;
    page.addEventListener("input", function () {
      clearTimeout(t2);
      t2 = setTimeout(function () {
        run(page.value);
        history.replaceState(null, "", PAGE + (terms(page.value).length ? "?q=" + encodeURIComponent(page.value) : ""));
      }, 150);
    });
  }
})();
