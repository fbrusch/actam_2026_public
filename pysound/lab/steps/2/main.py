import js


def shout(text, times=1):
    return (text.upper() + "! ") * times


def notes(n):
    names = ["do", "re", "mi", "fa", "sol", "la", "si"]
    return [names[i % 7] for i in range(n)]


def write(text):
    out = js.document.getElementById("out")     # the same DOM that JavaScript sees
    out.textContent = f"Python wrote this: {text[::-1]}"
