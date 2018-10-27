# Name: José Braz
# Date: 08/25/2018

using JuMP
using Cbc		# Solver
using NamedArrays
using HDF5

# Imprime na forma de tabela as áreas e as pessoas destinadas a cada área
function printareas(diff)
	print("Locais e pessoas alocadas:")
	for area in COMUMAREAS
		print("\nÁrea ", area, ": ")
		for cleaner in CLEANERS
			if (diff[area,cleaner] == 1) print(cleaner, "\t") end
		end
	end
end

function getweight(v, i)
	maxelement = maximum(v)
	#scale = map(x -> 10^(maxelement - x), v)
	scale = 5^(maxelement - v[i])

	return scale
end

# Atualiza a tabela QAMT com os valores da diff
function updateQAMT!(QAMT, diff, isprinted = false)
	if isprinted
		println("Deseja atualizar QAMT? (sim/nao)")
		if readline() != "sim"
			return
		end
	end
	for i=COMUMAREAS, k=CLEANERS
		QAMT[i,k] += diff[i,k]
	end
	# fid = h5open("data.h5","w")
	#
	# println(array(QAMT))
	# fid["DATA"] = array(QAMT)
	#
	# close(fid)
end

# Abre banco de dados
#fid = h5open("data.h5","r")

# matrix de vezes de limpeza de áreas x moradores
#DATA = read(fid, "DATA")

#close(fid)

AREAS = ["A", "B", "C", "D", "E", "F"]
COMUMAREAS = ["A", "C", "D"]
CLEANERS = ["Laís", "Gustavo", "José", "Elvira", "Renata", "Susete"]
NAMES = ["Elvira", "Renata", "Gustavo", "José", "Laís", "Tales", "Susete",
"Tiago", "Will", "Filipe", "Camila"]


# Matriz i,k onde: i ∈ AREAS, k ∈ NAMES
# representa a quantidade de vezes que k fez a area i
DATA = [4 5 3 3 6 5 6 3 4 5 5;
	    0 0 8 8 0 8 0 8 7 7 8;
	    5 5 4 4 6 3 8 3 5 5 5;
	    5 6 5 4 7 4 6 4 4 3 3;
	    3 5 5 5 5 5 5 5 5 5 5;
	    1 2 2 2 2 2 2 2 2 1 1]

# DATA na representação de matriz nomeada
# QAMT (Quantidade Áreas Morador Total)
QAMT = NamedArray(DATA, (AREAS, NAMES), ("Areas", "Names"))
@show QAMT

# QAM (Quantidade Áreas Morador) i,k onde i ∈ COMUMAREAS, k ∈ CLEANERS
# Representa apenas as informações dos moradores envolvidos na limpeza
QAM = NamedArray([QAMT[i, k] for i=COMUMAREAS, k=CLEANERS],
				 (COMUMAREAS, CLEANERS), ("Areas", "Names"))
@show QAM

# =======================================


model = Model(solver=CbcSolver())

# Matriz de naturais de COMUMAREAS por CLEANERS
@variable(model, M[i=COMUMAREAS, k=CLEANERS] >= 0, Int)

# Objetivo: Maximizar a função de pondera mais as áreas menos feitas
@objective(model, Max, sum(
		sum(getweight(QAM[:,k], i) * M[i,k] for i=COMUMAREAS)
					   for k=CLEANERS))

# Restrição de linha
# Cada área deve ser feita duas vezes na semana
@constraint(model, [i=COMUMAREAS],
	sum(M[i,k] for k=CLEANERS) == sum(QAM[i,k] for k=CLEANERS) + 2)

# Restrição de coluna
# Cada morador deve fazer apenas uma área
@constraint(model, [k=CLEANERS],
	sum(M[i,k] for i=COMUMAREAS) == sum(QAM[i,k] for i=COMUMAREAS) + 1)

# Restrição de quantidade
# Cada elemento da matriz retornada deve ser maior ou igual a matriz de partida
@constraint(model, [k=CLEANERS, i=COMUMAREAS], M[i,k] >= QAM[i,k])

println(model)

# Resolve o modelo
status = solve(model)

if status == :Infeasible
    println("No solution found!")
else
	M = getvalue(M)
	Mnamed = NamedArray([round(Integer, getindex(M, i, k))
							for i=COMUMAREAS, k=CLEANERS],
						(COMUMAREAS, CLEANERS), ("Areas", "Names"))

	diff = Mnamed - QAM

	@show Mnamed
	@show diff

	updateQAMT!(QAMT, diff, true)

	printareas(diff)

end
