import server from "./server";
const port = 8000;
server.listen(port, function() {
  console.log("Express server listening on port " + port);
});