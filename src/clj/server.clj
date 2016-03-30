(ns clj.server
  (:use [org.httpkit.server :only [run-server]])
  (:require [clj.handler :refer [app]]

            [compojure.handler :refer [site]]
            [environ.core :refer [env]])
  (:gen-class))

;; (defn -main [& args]
;;   (let [port (Integer/parseInt (or (env :port) "3000"))]
;;     (run-jetty app {:port port :join? false})))
 
(defn -main [& args]
  (let [port (Integer/parseInt (or (env :port) "3000"))
        server (run-server #'app {:port port :join? false})]
    ;; stops server
    ;;(server)
    ))

;; (defn in-dev? true) ;; TODO read a config variable from command line, env, or file?

;; (defn -main [& args] ;; entry point, lein run will pick up and start from here
;;   (let [handler (if (in-dev? args)
;;                   (reload/wrap-reload (site #'all-routes)) ;; only reload when dev
;;                   (site all-routes))]
;;     (run-server handler {:port 8080})))
