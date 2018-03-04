from flask import Flask, render_template, request, redirect
from flask_login import login_user, login_required

from xpad_server.models import init_app as db_init_app, AdminUser, Room

app = Flask(__name__)
app.secret_key = "ASDASDAWQEWQWEQWEQWECVSDFGV$#%$$"
db = db_init_app(app,'sqlite:///./tmp_test.db')

@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route("/admin",methods=['GET','POST'])
@login_required
def admin_page():
    if(request.form):
        form = request.form.to_dict()
        action = form.pop('action', '')
        if action == "create::room":
            print("CREATE ROOM:", request.form)
            form['is_public'] = not form.pop('invite_only')
            db.session.add(Room(**form))
            db.session.commit()


    return render_template("pages/app-room-list.html",rooms=Room.query.all())
@app.route("/admin/login",methods=['GET','POST'])
def do_login():
    if(request.form):
        print(request.form)
        user = AdminUser.login(**request.form.to_dict())
        if(user):
            login_user(user)
            return redirect(request.args.get('next','/admin'))
    return render_template("pages/app-login.html")
if __name__ == '__main__':
    app.run()
