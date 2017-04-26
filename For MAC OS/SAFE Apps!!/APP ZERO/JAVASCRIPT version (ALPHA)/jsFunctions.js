var token = localStorage["token"];
// THIS JS LISTENER IS ONLY REQUIRED CUZ MAIDSAFE'S CSP HEADER'S BLOCK HTML <button onClick!!!!
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("auth_button").addEventListener("click", function(){
    authorize();
  });
}, false);


function authorize() {
    var request = new XMLHttpRequest();
    request.open("post", "http://api.safenet/auth", true);
    request.setRequestHeader("Content-type", "application/json");
    request.onload = function() {
        if (this.status == 200) {
            console.log("SUCCESS:" + this.responseText);
            var response = JSON.parse(this.responseText);
            token = response.token;
            localStorage["token"] = token;
        }
    };
    var payload = {
        app: {
            name: "SUCCESSFUL AUTH!!!!!!!!!",
            version: "0.0.0000000001",
            vendor:  "SUCCESSMASTER911",
            id: "00000000000000000001"
           },
           permissions: ["SAFE_DRIVE_ACCESS"]
    };
    var payload_string = JSON.stringify(payload);
    request.send(payload_string);
}
