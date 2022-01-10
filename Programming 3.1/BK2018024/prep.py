# -*- coding: utf-8 -*-
"""
Created on Tue Apr 13 22:33:14 2021

@author: prais
"""

import pandas as pd

df = pd.read_csv('population_total.csv')

             
print(df['2021'].min())               
print(df['2021'].max())