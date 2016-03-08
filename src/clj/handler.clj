(ns clj.handler
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.reload :as reload]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]))


(defn index []
  (slurp "./src/html/index.html"))

(defroutes app-routes
  (GET "/" [] (index))
  (route/resources "./resources/public")
  (route/not-found "Not Found"))

(def app
  (-> (wrap-defaults app-routes site-defaults)
      reload/wrap-reload))
