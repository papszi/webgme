/*
 * Copyright (C) 2012 Vanderbilt University, All rights reserved.
 * 
 * Author: Miklos Maroti
 */

package org.isis.webgme.storage;

import org.isis.promise.*;
import com.mongodb.*;
import java.util.concurrent.*;
import org.isis.promise.Executors;

public class MongoDb implements Storage {

	public static class Options {
		public String host = "localhost";
		public int port = 27017;
		public String database = "test";
		public String collection = "storage";
	};

	private Options options;
	private DBCollection collection;

	public MongoDb(Options options) {
		assert (options != null);
		this.options = options;
	}

	ExecutorService executor;

	Func0<Void> openTask = new Func0<Void>() {
		@Override
		public Promise<Void> call() throws Exception {
			Mongo mongo = null;
			try {
				MongoOptions mongoOptions = new MongoOptions();
				mongoOptions.connectionsPerHost = 5;
				mongoOptions.threadsAllowedToBlockForConnectionMultiplier = 1000;

				mongo = new Mongo(
						new ServerAddress(options.host, options.port),
						mongoOptions);
				DBCollection coll = mongo.getDB(options.database)
						.getCollection(options.collection);

				CommandResult result = coll.getDB().getPreviousError();
				result.throwOnError();

				synchronized (MongoDb.this) {
					if (collection != null)
						throw new Exception("already open");

					collection = coll;
				}

				executor = new ThreadPoolExecutor(100, 100, 1,
						TimeUnit.SECONDS, new LinkedBlockingQueue<Runnable>());

			} catch (Exception exception) {
				if (mongo != null)
					mongo.close();

				throw exception;
			}

			return Constant.VOID;
		}
	};

	@Override
	public Promise<Void> open() {
		assert (collection == null);
		return openTask.submit(Executors.NEW_THREAD_EXECUTOR);
	}

	@Override
	public synchronized boolean isOpened() {
		return collection != null;
	}

	Func0<Void> closeTask = new Func0<Void>() {
		@Override
		public Promise<Void> call() throws Exception {
			DBCollection coll;
			ExecutorService exec;

			synchronized (MongoDb.this) {
				coll = collection;
				exec = executor;
				if (coll == null)
					throw new Exception("already closed");
				else {
					collection = null;
					executor = null;
				}
			}

			exec.shutdown();

			Mongo mongo = coll.getDB().getMongo();
			mongo.close();

			return Constant.VOID;
		}
	};

	@Override
	public Promise<Void> close() {
		assert (collection != null);
		return closeTask.submit(Executors.NEW_THREAD_EXECUTOR);
	}

	Func1<Object, String> loadTask = new Func1<Object, String>() {
		@Override
		public Promise<Object> call(String key) throws Exception {
			DBObject result = collection.findOne(key);
			return result == null ? Constant.NULL
					: new Constant<Object>(result);
		}
	};

	@Override
	public Promise<Object> load(String key) {
		assert (key != null && collection != null && executor != null);
		return loadTask.submit(executor, key);
	}

	Func1<Void, DBObject> saveTask = new Func1<Void, DBObject>() {
		@Override
		public Promise<Void> call(DBObject object) throws Exception {
			collection.save(object);
			return Constant.VOID;
		}
	};

	@Override
	public Promise<Void> save(Object object) {
		assert (object != null && collection != null && executor != null);
		return saveTask.submit(executor, (DBObject) object);
	}

	@Override
	public Promise<Void> remove(String key) {
		// TODO Auto-generated method stub
		return null;
	}
}