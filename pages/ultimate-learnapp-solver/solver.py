import requests
from bs4 import BeautifulSoup

userName = 'as'
time = 5
guid = 'peeg458gc23'
t = 'p80pwfpyt23'
url = 'https://learningapps.org/show.php?id=prvfq8ft324'

headers = {
    "accept": "*/*",
    "accept-language": "de,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
    "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
    "sec-ch-ua": "\"Chromium\";v=\"130\", \"Microsoft Edge\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "no-cors",
}

# First fetch request
response1 = requests.post(
    "https://learningapps.org/setAppSolved.php",
    headers=headers,
    data=f"guid={guid}&value=100&time={time}&user=0"
)

# Second fetch request
response2 = requests.post(
    "https://learningapps.org/collection.php",
    headers=headers,
    data=f"u={userName}&c={t}"
)

# Third fetch request
response3 = requests.post(
    "https://learningapps.org/collection.php",
    headers=headers,
    data=f"u={userName}&a={guid}&c={t}&t={time}"
)

# print(response1.status_code, response2.status_code, response3.status_code)

redirect_window = requests.get(url, headers=headers).text
print(redirect_window)
# redirect_window_obj = BeautifulSoup(redirect_window, 'html.parser')
# redirect_window_obj.select('script[src^="https://learningapps.org/data"]').get('src')

