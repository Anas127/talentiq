import pandas as pd
import os

print(os.listdir("./data"))

df = pd.read_csv("./data/cleaned_jobs.csv")
print(df.head())