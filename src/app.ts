import server from "./server";
/* Create an instance of the server and make it listen to port 8080. */
const port = 8080;
server.listen(port, function() {
  console.log("Express server listening on port " + port);
});