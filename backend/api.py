from ebay_oauth_token import OAuthToken

APPID = "AshishG-ebayshop-PRD-7da214d81-d9471a22"
DEVID = "e995fdfc-c264-42e0-9ed0-21106cd34019"
CERTID = "PRD-da214d81cd74-21ba-4bc3-b50d-8252"
URL_FINDING_SERVICE = "https://svcs.ebay.com/services/search/FindingService/v1"
APP_TOKEN=OAuthToken(APPID, CERTID).getApplicationToken()
URL_GETSINGLEITEM = "https://open.api.ebay.com/shopping"
