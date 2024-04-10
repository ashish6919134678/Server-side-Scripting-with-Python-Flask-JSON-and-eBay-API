from flask import request
import requests
import api


def makeRequest(url, query_params={}, headers={}):
    """
    This function makes a get request to the url and returns the response
    in a json object. 

    """
    r = requests.get(url, params=query_params, headers=headers)
    print("Making Api Call To:")
    print(r.url)
    print()
    return r.json()


def extract_query_paramaters():
    """
    The search parameters sent from frontend are passed as query parameters.
    This function retreives those parameters and returns them in a json.
    """
    keywords = request.args.get('keywords', '')
    minimumPrice = request.args.get('minimumPrice', '')
    maximumPrice = request.args.get('maximumPrice', '')
    conditionNew = request.args.get('conditionNew', '')
    conditionUsed = request.args.get('conditionUsed', '')
    conditionVeryGood = request.args.get('conditionVeryGood', '')
    conditionGood = request.args.get('conditionGood', '')
    conditionAcceptable = request.args.get('conditionAcceptable', '')
    sellerReturnAccepted = request.args.get('sellerReturnAccepted', '')
    shippingFree = request.args.get('shippingFree', '')
    shippingExpedited = request.args.get('shippingExpedited', '')
    sortBy = request.args.get('sortBy', '')

    search_parameters = {
        'keywords': keywords,
        'minimumPrice': minimumPrice,
        'maximumPrice': maximumPrice,
        'conditionNew': conditionNew,
        'conditionUsed': conditionUsed,
        'conditionVeryGood': conditionVeryGood,
        'conditionGood': conditionGood,
        'conditionAcceptable': conditionAcceptable,
        'sellerReturnAccepted': sellerReturnAccepted,
        'shippingFree': shippingFree,
        'shippingExpedited': shippingExpedited,
        'sortBy': sortBy,
    }

    return search_parameters


def generate_url_findItemsAdvanced(search_parameters):
    """
    This function generates the url for the ebay “findItemsAdvanced” api from
    the search parameters
    """
    ebay_query_params = {
        "OPERATION-NAME": "findItemsAdvanced",
        "SERVICE-VERSION": "1.0.0",
        "SECURITY-APPNAME": f"{api.APPID}",
        "RESPONSE-DATA-FORMAT": "JSON",
        "REST-PAYLOAD": "",
        "keywords": search_parameters["keywords"],
        "sortOrder": search_parameters["sortBy"],

        # Item filter for Seller - Returns Accepted
        "itemFilter(0).name": "ReturnsAcceptedOnly",
        "itemFilter(0).value": f"{search_parameters['sellerReturnAccepted']}",
        # Item filter for Shipping - Free Shipping
        "itemFilter(1).name": "FreeShippingOnly",
        "itemFilter(1).value": f"{search_parameters['shippingFree']}",
    }

    filter_id = 2

    if search_parameters["minimumPrice"]:
        ebay_query_params[f"itemFilter({filter_id}).name"] = "MinPrice"
        ebay_query_params[f"itemFilter({filter_id}).value"] = f"{search_parameters['minimumPrice']}"
        ebay_query_params[f"itemFilter({filter_id}).paramName"] = "Currency"
        ebay_query_params[f"itemFilter({filter_id}).paramValue"] = "USD"
        filter_id += 1

    if search_parameters["maximumPrice"]:
        ebay_query_params[f"itemFilter({filter_id}).name"] = "MaxPrice"
        ebay_query_params[f"itemFilter({filter_id}).value"] = f"{search_parameters['maximumPrice']}"
        ebay_query_params[f"itemFilter({filter_id}).paramName"] = "Currency"
        ebay_query_params[f"itemFilter({filter_id}).paramValue"] = "USD"
        filter_id += 1

    if search_parameters["shippingExpedited"] == "true":
        ebay_query_params[f"itemFilter({filter_id}).name"] = "Expedited"
        ebay_query_params[f"itemFilter({filter_id}).value"] = "Expedited"
        filter_id += 1

    conditions = []

    if (search_parameters["conditionNew"]) == "true":
        conditions.append("1000")
    if (search_parameters["conditionUsed"]) == "true":
        conditions.append("3000")
    if (search_parameters["conditionVeryGood"]) == "true":
        conditions.append("4000")
    if (search_parameters["conditionGood"]) == "true":
        conditions.append("5000")
    if (search_parameters["conditionAcceptable"]) == "true":
        conditions.append("6000")

    if conditions:
        ebay_query_params[f"itemFilter({filter_id}).name"] = "Condition"
        for index, condition in enumerate(conditions):
            ebay_query_params[f"itemFilter({filter_id}).value({index})"] = condition
        filter_id += 1

    return ebay_query_params


def generate_urlparams_GetSingleItem(itemID):
    """
    This function returns a dictionary that contains the query parameters to 
    include when making an API call to GetSingleEndpoint.
    """
    query_params = {
        "callname": "GetSingleItem",
        "responseencoding": "JSON",
        "appid": api.APPID,
        "siteid": '0',
        'version': "967",
        "ItemID": itemID,
        "IncludeSelector": "Description,Details,ItemSpecifics"
    }
    return query_params


def get_key(item, keys, getarray=False):
    """
    This function returns the value of 
        item[keys[0]][keys[1]][keys[2]]...
    if getarray is falss, this function returns item[keys[n-1]][0]
    if getarray is true,  this function returns item[keys[n-1]]
    """
    for index, key in enumerate(keys):
        if key in item:
            if index + 1 == len(keys):
                item = item[key]
            else:
                item = item[key][0]
        else:
            return None

    if not getarray:
        item = item[0]

    return item


def get_ebay_item_values(item):
    """
    This function extracts the item from search results. 
    Arguments:
        item: The item object which was found inside the search results response
    """
    galleryURL = get_key(item, ["galleryURL"])
    title = get_key(item, ["title"])
    categoryName = get_key(item, ["primaryCategory", "categoryName"])
    viewItemURL = get_key(item, ["viewItemURL"])
    conditionDisplayName = get_key(item, ["condition", "conditionDisplayName"])
    topRatedListing = get_key(item, ["topRatedListing"])
    convertedCurrentPrice = get_key(
        item, ["sellingStatus", "convertedCurrentPrice"])
    shippingServiceCost = get_key(item, ["shippingInfo", "shippingServiceCost"])
    itemId = get_key(item, ["itemId"])

    if convertedCurrentPrice is not None:
        convertedCurrentPrice = convertedCurrentPrice["__value__"]

    if shippingServiceCost is not None:
        shippingServiceCost = shippingServiceCost["__value__"]
    else:
        shippingServiceCost = '0.0'

    r = {
        "itemId": f"{itemId}",
        "convertedCurrentPrice": convertedCurrentPrice,
        "shippingServiceCost": shippingServiceCost,
        "topRatedListing": topRatedListing,
        "conditionDisplayName": conditionDisplayName,
        "viewItemURL": viewItemURL,
        "categoryName": categoryName,
        "title": title,
        "galleryURL": galleryURL,
    }

    for key in r.keys():
        if r[key] is None:
            return None

    return r
