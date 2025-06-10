export function isLoggedIn(req, res, next) {
  if (req.session && req.session.societyEmail) {
    // User is logged in
    next(); // allow access
  } else {
    // User is not logged in
    res.redirect("/login");
  }
}
