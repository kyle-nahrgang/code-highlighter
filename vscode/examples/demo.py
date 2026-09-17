def load_user(user_id):
    # !important:#e08920
    query = f"SELECT * FROM users WHERE id = {user_id}"
    return db.execute(query)
    # !important


def greet(name):
    # !important
    return f"hello {name}"
    # !important
