function getURL(url) {
    let fetchLoc = "";
    if (window.location.href.includes("sidharrth")) {
      fetchLoc = `https://sidharrth.me/covid-world-economy/data/${url}`;
    } else {
      fetchLoc = `../../data/${url}`;
    }
    return fetchLoc;
}