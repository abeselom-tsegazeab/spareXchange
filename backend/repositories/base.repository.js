/**
 * Base Repository Pattern Implementation
 * Provides CRUD operations and common query methods
 * Separates data access logic from business logic
 */

class BaseRepository {
	constructor(model) {
		this.model = model;
	}

	/**
	 * Find documents with optional filters and pagination
	 */
	async find(query = {}, options = {}) {
		const {
			page = 1,
			limit = 10,
			sort = "-createdAt",
			populate = null,
			select = null,
		} = options;

		const queryBuilder = this.model.find(query);

		// Apply pagination
		const skip = (page - 1) * limit;
		queryBuilder.skip(skip).limit(limit);

		// Apply sorting
		if (sort) queryBuilder.sort(sort);

		// Apply field selection
		if (select) queryBuilder.select(select);

		// Apply population
		if (populate) {
			if (Array.isArray(populate)) {
				populate.forEach((p) => queryBuilder.populate(p));
			} else {
				queryBuilder.populate(populate);
			}
		}

		const [documents, total] = await Promise.all([
			queryBuilder.exec(),
			this.model.countDocuments(query),
		]);

		return {
			documents,
			total,
			page: Number(page),
			totalPages: Math.ceil(total / limit),
			hasNext: page * limit < total,
			hasPrev: page > 1,
		};
	}

	/**
	 * Find single document
	 */
	async findById(id, options = {}) {
		const { populate = null, select = null } = options;

		const query = this.model.findById(id);

		if (select) query.select(select);
		if (populate) {
			if (Array.isArray(populate)) {
				populate.forEach((p) => query.populate(p));
			} else {
				query.populate(populate);
			}
		}

		return query.exec();
	}

	/**
	 * Find one document matching query
	 */
	async findOne(query, options = {}) {
		const { populate = null, select = null } = options;

		const queryBuilder = this.model.findOne(query);

		if (select) queryBuilder.select(select);
		if (populate) {
			if (Array.isArray(populate)) {
				populate.forEach((p) => queryBuilder.populate(p));
			} else {
				queryBuilder.populate(populate);
			}
		}

		return queryBuilder.exec();
	}

	/**
	 * Create new document
	 */
	async create(data) {
		const document = new this.model(data);
		return document.save();
	}

	/**
	 * Create multiple documents (bulk insert)
	 */
	async createMany(documents) {
		return this.model.insertMany(documents);
	}

	/**
	 * Update document by ID
	 */
	async updateById(id, updateData, options = {}) {
		const { new: returnNew = true, runValidators = true } = options;

		return this.model.findByIdAndUpdate(id, updateData, {
			new: returnNew,
			runValidators,
		});
	}

	/**
	 * Update documents matching query
	 */
	async updateMany(query, updateData) {
		return this.model.updateMany(query, updateData);
	}

	/**
	 * Delete document by ID (soft delete if model supports it)
	 */
	async deleteById(id, softDelete = false) {
		if (softDelete) {
			return this.model.findByIdAndUpdate(id, { isActive: false }, { new: true });
		}
		return this.model.findByIdAndDelete(id);
	}

	/**
	 * Count documents matching query
	 */
	async count(query = {}) {
		return this.model.countDocuments(query);
	}

	/**
	 * Check if document exists
	 */
	async exists(query) {
		return this.model.exists(query);
	}

	/**
	 * Aggregate pipeline
	 */
	async aggregate(pipeline) {
		return this.model.aggregate(pipeline);
	}

	/**
	 * Distinct values for a field
	 */
	async distinct(field, query = {}) {
		return this.model.distinct(field, query);
	}
}

export { BaseRepository };
