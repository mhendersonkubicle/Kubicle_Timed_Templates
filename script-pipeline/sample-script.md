# Sample lesson script — Manual vs Automated Data Pipelines

Let's weigh up manual versus automated data pipelines. When it comes to speed, the manual approach is slow and hands-on, whereas automation runs instantly. And on reliability, manual work is error-prone, while automation validates every record. So the manual way gives you control but costs effort, and the automated way trades control for enormous scale.

So how does an automated pipeline actually work? It has four stages. Of course it all ends with monitoring the live system once it's running. But first you ingest the raw data from the source, then you clean and validate it, and after that you load it into the warehouse.

One term you'll hear a lot here is idempotency. It simply means an operation can run many times over and still produce exactly the same result, with no extra side effects.

To recap the benefits of going automated: you get faster delivery, you make fewer errors, you can scale far more easily, and you end up with a clear audit trail of everything that ran.
