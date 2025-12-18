#!/bin/bash

# Chạy mongorestore
# --db ecommerce_db: Chỉ định database để restore (giống MONGO_INITDB_DATABASE)
# /docker-entrypoint-initdb.d/ecommerce_db: Đường dẫn TBÊN TRONG container
#   trỏ đến thư mục chứa file .bson của bạn.
mongorestore --db ecommerce_db /docker-entrypoint-initdb.d/ecommerce_db