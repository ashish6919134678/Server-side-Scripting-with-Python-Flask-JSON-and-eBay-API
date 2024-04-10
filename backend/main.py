from flask import Flask, jsonify, send_from_directory
import utils
import api

app = Flask(__name__)

FRONTEND = "../frontend/"


@app.route('/images/<path:filename>')
def serve_image(filename):
    static_directory = f"{FRONTEND}/images"
    return send_from_directory(static_directory, filename)


@app.route("/", methods=["GET"])
def index():
    static_directory = FRONTEND
    return send_from_directory(static_directory, "index.html")


@app.route("/index.css", methods=["GET"])
def css():
    static_directory = FRONTEND
    return send_from_directory(static_directory, "index.css")


@app.route("/index.js", methods=["GET"])
def js():
    static_directory = FRONTEND
    return send_from_directory(static_directory, "index.js")


# An empty result to return to the user when we receive
# an empty response from eBay.
def empty_result():
    return jsonify({
        "totalEntries": 0,
        "results": []
    })


@app.route("/search", methods=["GET"])
def get_data():
    search_parameter = utils.extract_query_paramaters()
    query_params = utils.generate_url_findItemsAdvanced(search_parameter)
    response = utils.makeRequest(api.URL_FINDING_SERVICE, query_params)

    # Api call was not success
    success = utils.get_key(response, ["findItemsAdvancedResponse", "ack"])
    if success is None or success != 'Success':
        return empty_result()

    # Extract values from response
    totalEntries = utils.get_key(
        response, ["findItemsAdvancedResponse", "paginationOutput", "totalEntries"])

    count = utils.get_key(
        response, ["findItemsAdvancedResponse", "searchResult", "@count"])

    items = utils.get_key(
        response, ["findItemsAdvancedResponse", "searchResult", "item"], True)

    if totalEntries is None or count is None or items is None:
        return empty_result()

    totalEntries = int(totalEntries)
    count = int(count)

    data = {
        "totalEntries": totalEntries,
        "results": []
    }

    for item in items:
        r = utils.get_ebay_item_values(item)
        if r:
            data["results"].append(r)

    return jsonify(data)


@app.route("/detailed/<int:itemid>", methods=["GET"])
def get_detailed_item(itemid):
    params = utils.generate_urlparams_GetSingleItem(itemid)
    headers = {
        "X-EBAY-API-IAF-TOKEN": api.APP_TOKEN
    }
    response = utils.makeRequest(api.URL_GETSINGLEITEM, params, headers)
    return response


if __name__ == "__main__":
    app.run(debug=True)
