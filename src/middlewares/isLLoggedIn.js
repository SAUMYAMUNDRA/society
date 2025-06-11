export function isLoggedIn(req, res, next) {
  if (req.session && req.session.idr) {
    // User is logged in
    next(); // allow access
  } else {
    alert("plz login first");
    res.redirect("/login");
  }
}
