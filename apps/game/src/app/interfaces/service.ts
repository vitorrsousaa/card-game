export interface IService<TInput, TOutput> {
	execute(data: TInput): Promise<TOutput>;
}
